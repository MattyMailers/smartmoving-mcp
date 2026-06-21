#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin as input, stderr as output } from "node:process";
import { Command, Option } from "commander";
import { SmartMovingClient } from "./client.js";
import { configPath, DEFAULT_API_KEY_ENV, DEFAULT_BASE_URL, writeInitialConfig } from "./cli/config.js";
import { runDoctor } from "./cli/doctor.js";
import { formatError, formatHuman, formatJson } from "./cli/format.js";

interface GlobalOptions {
  json?: boolean;
  plain?: boolean;
  quiet?: boolean;
  verbose?: boolean;
  color?: boolean;
  profile?: string;
}

interface InitOptions extends GlobalOptions {
  yes?: boolean;
  apiKeyEnv?: string;
  apiKeyStdin?: boolean;
  baseUrl?: string;
  runDoctor?: boolean;
}

interface LeadsListOptions extends GlobalOptions {
  page?: string;
  pageSize?: string;
}

interface JobGetOptions extends GlobalOptions {
  opportunityId?: string;
  includeEstimatedCharges?: boolean;
  includeActualCharges?: boolean;
  includeEstimatedMaterials?: boolean;
  includeActualMaterials?: boolean;
  includeStops?: boolean;
  includeDispatchInfo?: boolean;
  includeCharges?: boolean;
  includeNotes?: boolean;
}

interface FollowupsDueOptions extends GlobalOptions {
  opportunityId?: string;
  now?: string;
  includeCompleted?: boolean;
}

function requireClient(): SmartMovingClient {
  const apiKey = process.env.SMARTMOVING_API_KEY;
  if (!apiKey) {
    throw new Error(
      "SMARTMOVING_API_KEY environment variable is required. Set it in your shell or agent environment; do not pass API keys as CLI arguments.",
    );
  }

  return new SmartMovingClient({
    apiKey,
    baseUrl: process.env.SMARTMOVING_BASE_URL,
  });
}

function positiveInteger(value: string, label: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return parsed;
}

function jsonOption(): Option {
  return new Option("--json", "print machine-readable JSON output");
}

function profileOption(): Option {
  return new Option("--profile <name>", "SmartMoving CLI config profile");
}

function printResult(label: string, value: unknown, options: GlobalOptions): void {
  const json = options.json === true || program.opts<GlobalOptions>().json === true;
  console.log(json ? formatJson(value) : formatHuman(label, value));
}

async function runRead<T>(label: string, options: GlobalOptions, action: (client: SmartMovingClient) => Promise<T>): Promise<void> {
  try {
    const result = await action(requireClient());
    printResult(label, result, options);
  } catch (error) {
    console.error(`Error: ${formatError(error)}`);
    process.exitCode = 1;
  }
}

async function promptDefault(question: string, defaultValue: string): Promise<string> {
  const reader = createInterface({ input, output });
  try {
    const answer = await reader.question(`${question} (${defaultValue}): `);
    return answer.trim() || defaultValue;
  } finally {
    reader.close();
  }
}

async function runInit(options: InitOptions): Promise<void> {
  try {
    let profile = options.profile ?? program.opts<GlobalOptions>().profile ?? "default";
    let apiKeyEnv = options.apiKeyEnv ?? DEFAULT_API_KEY_ENV;
    let baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;

    if (!options.yes) {
      profile = await promptDefault("Profile name", profile);
      apiKeyEnv = await promptDefault("API key environment variable", apiKeyEnv);
      baseUrl = await promptDefault("Base URL", baseUrl);
    }

    if (options.apiKeyStdin) {
      if (!options.quiet) {
        console.error("Note: --api-key-stdin validates that a key was provided, but raw API keys are never stored in config.");
      }
      for await (const _chunk of input) {
        break;
      }
    }

    const path = configPath();
    const config = await writeInitialConfig({ profile, apiKeyEnv, baseUrl }, path);
    const result = { ok: true, configPath: path, profile: config.defaultProfile, apiKeyEnv: config.profiles[config.defaultProfile]?.apiKeyEnv };
    printResult("Initialized SmartMoving CLI config", result, options);

    if (options.runDoctor) {
      const doctor = await runDoctor({ profile: config.defaultProfile });
      printResult("Doctor", doctor, options);
      if (!doctor.ok) {
        process.exitCode = 1;
      }
    }
  } catch (error) {
    if (options.json) {
      console.log(formatJson({ ok: false, error: { code: "INIT_FAILED", message: formatError(error), hint: "Check the init options and try again." } }));
    } else {
      console.error(`Error: ${formatError(error)}`);
    }
    process.exitCode = 1;
  }
}

function mcpJsonConfig(): unknown {
  return {
    mcpServers: {
      smartmoving: {
        command: "npx",
        args: ["-y", "smartmoving-mcp-server"],
        env: {
          SMARTMOVING_API_KEY: "${SMARTMOVING_API_KEY}",
          SMARTMOVING_ALLOW_WRITES: "false",
        },
      },
    },
  };
}

function printMcpConfig(options: { printHermes?: boolean; printClaude?: boolean; printJson?: boolean }): void {
  if (options.printHermes) {
    console.log(`mcp_servers:\n  smartmoving:\n    command: "npx"\n    args:\n      - "-y"\n      - "smartmoving-mcp-server"\n    env:\n      SMARTMOVING_API_KEY: "\${SMARTMOVING_API_KEY}"\n      SMARTMOVING_ALLOW_WRITES: "false"\n    timeout: 120\n    connect_timeout: 60`);
    return;
  }

  if (options.printClaude) {
    console.log(formatJson(mcpJsonConfig()));
    return;
  }

  console.log(formatJson(mcpJsonConfig()));
}

function dueDateOf(followup: unknown): Date | null {
  if (!followup || typeof followup !== "object") {
    return null;
  }

  const record = followup as Record<string, unknown>;
  const raw = record.dueDateTime ?? record.dueDate ?? record.dueAtUtc ?? record.dueAt;
  if (typeof raw !== "string") {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isCompleted(followup: unknown): boolean {
  if (!followup || typeof followup !== "object") {
    return false;
  }

  const record = followup as Record<string, unknown>;
  return record.completed === true || record.isCompleted === true || Boolean(record.completedAtUtc);
}

function filterDueFollowups(value: unknown, now: Date, includeCompleted: boolean): unknown {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as Record<string, unknown>).items)
      ? ((value as Record<string, unknown>).items as unknown[])
      : null;

  if (!list) {
    return value;
  }

  return list.filter((followup) => {
    const dueDate = dueDateOf(followup);
    if (!dueDate || dueDate.getTime() > now.getTime()) {
      return false;
    }
    return includeCompleted || !isCompleted(followup);
  });
}

const program = new Command();

program
  .name("smartmoving")
  .description("Read-only CLI for the SmartMoving External API v1")
  .version("0.1.0")
  .addOption(jsonOption())
  .addOption(new Option("--plain", "prefer plain text output for commands that support it"))
  .addOption(new Option("--quiet", "suppress non-essential stderr messages"))
  .addOption(new Option("--verbose", "print extra diagnostic detail where supported"))
  .addOption(new Option("--no-color", "disable color output"))
  .addOption(profileOption())
  .showHelpAfterError()
  .showSuggestionAfterError();

program
  .command("init")
  .description("Create SmartMoving CLI config without storing raw API keys.")
  .addOption(jsonOption())
  .addOption(profileOption())
  .option("--api-key-env <name>", "environment variable that will hold the API key", DEFAULT_API_KEY_ENV)
  .option("--api-key-stdin", "read an API key from stdin for validation only; the raw key is not stored")
  .option("--base-url <url>", "SmartMoving API base URL", DEFAULT_BASE_URL)
  .option("--yes", "accept defaults and do not prompt")
  .option("--run-doctor", "run doctor after writing config")
  .action((options: InitOptions) => runInit(options));

program
  .command("doctor")
  .description("Check local SmartMoving CLI/MCP configuration and API connectivity.")
  .addOption(jsonOption())
  .addOption(profileOption())
  .action(async (options: GlobalOptions) => {
    const result = await runDoctor({ profile: options.profile ?? program.opts<GlobalOptions>().profile });
    printResult("Doctor", result, options);
    if (!result.ok) {
      process.exitCode = 1;
    }
  });

const mcp = program.command("mcp").description("Print MCP client configuration helpers.");

mcp
  .command("config")
  .description("Print MCP config snippets that reference environment variables, never raw API keys.")
  .option("--print-hermes", "print a Hermes YAML snippet")
  .option("--print-claude", "print a Claude Desktop JSON snippet")
  .option("--print-json", "print generic MCP JSON")
  .action((options: { printHermes?: boolean; printClaude?: boolean; printJson?: boolean }) => printMcpConfig(options));

program
  .command("ping")
  .description("Verify SmartMoving API connectivity and authentication.")
  .addOption(jsonOption())
  .action((options: GlobalOptions) =>
    runRead("Ping", options, (client) => client.get("/api/ping")),
  );

const reference = program.command("reference").description("Read SmartMoving reference data.");

reference
  .command("branches")
  .description("List SmartMoving branches/office locations.")
  .addOption(jsonOption())
  .action((options: GlobalOptions) =>
    runRead("Branches", options, (client) => client.get("/api/branches")),
  );

reference
  .command("move-sizes")
  .description("List SmartMoving move size reference values.")
  .addOption(jsonOption())
  .action((options: GlobalOptions) =>
    runRead("Move sizes", options, (client) => client.get("/api/move-sizes")),
  );

const customers = program.command("customers").description("Read customer records.");

customers
  .command("get")
  .description("Get a customer by UUID.")
  .argument("<customerId>", "customer UUID")
  .addOption(jsonOption())
  .action((customerId: string, options: GlobalOptions) =>
    runRead("Customer", options, (client) => client.get(`/api/customers/${customerId}`)),
  );

const leads = program.command("leads").description("Read lead records.");

leads
  .command("list")
  .description("List leads with pagination.")
  .option("--page <page>", "page number", "1")
  .option("--page-size <pageSize>", "records per page, max 100", "25")
  .addOption(jsonOption())
  .action((options: LeadsListOptions) =>
    runRead("Leads", options, (client) => {
      const page = positiveInteger(options.page ?? "1", "--page");
      const pageSize = positiveInteger(options.pageSize ?? "25", "--page-size");
      if (pageSize > 100) {
        throw new Error("--page-size must be 100 or less.");
      }
      return client.get("/api/leads", { page, pageSize });
    }),
  );

const opportunities = program.command("opportunities").description("Read opportunity records.");

opportunities
  .command("get")
  .description("Get an opportunity by UUID.")
  .argument("<opportunityId>", "opportunity UUID")
  .option("--include-jobs", "include job details")
  .option("--include-follow-ups", "include follow-ups")
  .option("--include-payments", "include payments")
  .option("--include-documents", "include documents")
  .option("--include-rooms", "include room inventory")
  .option("--include-audit", "include audit activity")
  .addOption(jsonOption())
  .action((opportunityId: string, options: GlobalOptions & Record<string, boolean | undefined>) =>
    runRead("Opportunity", options, (client) =>
      client.get(`/api/opportunities/${opportunityId}`, {
        IncludeJobs: options.includeJobs,
        IncludeFollowUps: options.includeFollowUps,
        IncludePayments: options.includePayments,
        IncludeDocuments: options.includeDocuments,
        IncludeRooms: options.includeRooms,
        IncludeAudit: options.includeAudit,
      }),
    ),
  );

const jobs = program.command("jobs").description("Read job records.");

jobs
  .command("get")
  .description("Get a premium job by UUID. SmartMoving requires the parent opportunity UUID.")
  .argument("<jobId>", "job UUID")
  .requiredOption("--opportunity-id <opportunityId>", "parent opportunity UUID required by the SmartMoving API")
  .option("--include-estimated-charges", "include estimated charge lines")
  .option("--include-actual-charges", "include actual charge lines")
  .option("--include-estimated-materials", "include estimated materials")
  .option("--include-actual-materials", "include actual materials")
  .option("--include-stops", "include stops")
  .option("--include-dispatch-info", "include dispatch information")
  .option("--include-charges", "include SmartMoving catch-all charges")
  .option("--include-notes", "include notes")
  .addOption(jsonOption())
  .action((jobId: string, options: JobGetOptions) =>
    runRead("Job", options, (client) =>
      client.get(`/api/premium/opportunities/${options.opportunityId}/jobs/${jobId}`, {
        IncludeEstimatedCharges: options.includeEstimatedCharges,
        IncludeActualCharges: options.includeActualCharges,
        IncludeEstimatedMaterials: options.includeEstimatedMaterials,
        IncludeActualMaterials: options.includeActualMaterials,
        IncludeStops: options.includeStops,
        IncludeDispatchInfo: options.includeDispatchInfo,
        IncludeCharges: options.includeCharges,
        IncludeNotes: options.includeNotes,
      }),
    ),
  );

const followups = program.command("followups").description("Read follow-up records.");

followups
  .command("due")
  .description("List due follow-ups for one opportunity. Account-wide due follow-ups are not exposed by the current SmartMoving v1 API spec.")
  .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID to inspect")
  .option("--now <isoDateTime>", "compare against this ISO date/time instead of the current time")
  .option("--include-completed", "include completed follow-ups")
  .addOption(jsonOption())
  .action((options: FollowupsDueOptions) =>
    runRead("Due follow-ups", options, async (client) => {
      const now = options.now ? new Date(options.now) : new Date();
      if (Number.isNaN(now.getTime())) {
        throw new Error("--now must be a valid ISO date/time.");
      }

      const result = await client.get(`/api/premium/opportunities/${options.opportunityId}/followups`);
      return filterDueFollowups(result, now, options.includeCompleted === true);
    }),
  );

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(`Error: ${formatError(error)}`);
  process.exit(1);
});
