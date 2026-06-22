#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin as input, stderr as output } from "node:process";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { Command, Option } from "commander";
import { SmartMovingClient } from "./client.js";
import { registerAgentCommand } from "./cli/agent.js";
import { configPath, credentialsPath, DEFAULT_API_KEY_ENV, DEFAULT_BASE_URL, resolveProfileAuth, writeInitialConfig, writeStoredApiKey } from "./cli/config.js";
import { registerDocsCommand } from "./cli/docs.js";
import { runDoctor } from "./cli/doctor.js";
import { formatError, formatHuman, formatJson } from "./cli/format.js";
import { registerSmokeCommand } from "./cli/smoke.js";
import { registerSchemaCommand } from "./operations/register-cli.js";

interface GlobalOptions {
  json?: boolean;
  wrapUntrusted?: boolean;
  allowWrites?: boolean;
  allowDestructive?: boolean;
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
  storeApiKey?: boolean;
  baseUrl?: string;
  runDoctor?: boolean;
}

interface LeadsListOptions extends GlobalOptions {
  page?: string;
  pageSize?: string;
}

interface CustomersListOptions extends GlobalOptions {
  page?: string;
  pageSize?: string;
  fromServiceDate?: string;
  toServiceDate?: string;
  includeOpportunityInfo?: boolean;
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

interface WriteOptions extends GlobalOptions {
  input?: string;
  dryRun?: boolean;
  yes?: boolean;
  idempotencyKey?: string;
  opportunityId?: string;
  text?: string;
  roomId?: string;
  file?: string;
  fileCategory?: string;
  notes?: string;
}

type WriteMethod = "POST" | "PUT" | "PATCH" | "DELETE";
type RequestSafety = "write" | "destructive";

interface PreparedWriteRequest {
  method: WriteMethod;
  path: string;
  body?: unknown;
  safety?: RequestSafety;
}

const truthyValues = new Set(["1", "true", "yes", "on"]);

function envFlag(name: string): boolean {
  const value = process.env[name];
  return value ? truthyValues.has(value.trim().toLowerCase()) : false;
}

function writesEnabled(options?: GlobalOptions): boolean {
  return options?.allowWrites === true || program.opts<GlobalOptions>().allowWrites === true || envFlag("SMARTMOVING_ALLOW_WRITES");
}

function destructiveEnabled(options?: GlobalOptions): boolean {
  return options?.allowDestructive === true || program.opts<GlobalOptions>().allowDestructive === true || envFlag("SMARTMOVING_ALLOW_DESTRUCTIVE");
}

async function requireClient(options?: GlobalOptions): Promise<SmartMovingClient> {
  let apiKey = process.env.SMARTMOVING_API_KEY;
  let baseUrl = process.env.SMARTMOVING_BASE_URL;

  if (!apiKey) {
    try {
      const auth = await resolveProfileAuth(options?.profile ?? program.opts<GlobalOptions>().profile);
      apiKey = auth.apiKey;
      baseUrl = auth.baseUrl;
    } catch {
      // Fall through to the stable auth error below.
    }
  }

  if (!apiKey) {
    throw new Error(
      "SmartMoving API key is required. Run smartmoving init to store it locally, or set SMARTMOVING_API_KEY in your shell or agent environment. Do not pass API keys as CLI arguments.",
    );
  }

  return new SmartMovingClient({
    apiKey,
    baseUrl,
    allowWrites: writesEnabled(program.opts<GlobalOptions>()),
    allowDestructive: destructiveEnabled(program.opts<GlobalOptions>()),
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

function addReadOptions(command: Command): Command {
  return command
    .addOption(jsonOption())
    .addOption(new Option("--wrap-untrusted", "wrap SmartMoving CRM response data for agent-safe prompt processing"))
    .addOption(new Option("--plain", "prefer plain text output"))
    .addOption(new Option("--quiet", "suppress non-essential stderr messages"))
    .addOption(new Option("--verbose", "print extra diagnostic detail where supported"));
}

function wantsJson(options: GlobalOptions): boolean {
  return options.json === true || program.opts<GlobalOptions>().json === true;
}

function printResult(label: string, value: unknown, options: GlobalOptions): void {
  console.log(wantsJson(options) ? formatJson(value) : formatHuman(label, value));
}

function printReadResult(label: string, value: unknown, options: GlobalOptions): void {
  if (wantsJson(options)) {
    const payload = options.wrapUntrusted
      ? { ok: true, source: "smartmoving", untrusted: true, data: value }
      : { ok: true, data: value };
    console.log(formatJson(payload));
    return;
  }

  console.log(formatHuman(label, value));
}

async function runRead<T>(label: string, options: GlobalOptions, action: (client: SmartMovingClient) => Promise<T>): Promise<void> {
  try {
    const result = await action(await requireClient(options));
    printReadResult(label, result, options);
  } catch (error) {
    if (wantsJson(options)) {
      console.log(formatJson({ ok: false, error: { code: "READ_FAILED", message: formatError(error) } }));
    } else {
      console.error(`Error: ${formatError(error)}`);
    }
    process.exitCode = 1;
  }
}

function writesDisabledResponse(): { ok: false; error: { code: string; message: string; hint: string } } {
  return {
    ok: false,
    error: {
      code: "WRITES_DISABLED",
      message: "Write operations are disabled by default.",
      hint: "Set SMARTMOVING_ALLOW_WRITES=true or use --allow-writes, then run with --dry-run first.",
    },
  };
}

function destructiveDisabledResponse(): { ok: false; error: { code: string; message: string; hint: string } } {
  return {
    ok: false,
    error: {
      code: "DESTRUCTIVE_DISABLED",
      message: "Destructive operations are disabled by default.",
      hint: "Set SMARTMOVING_ALLOW_WRITES=true and SMARTMOVING_ALLOW_DESTRUCTIVE=true, then pass --yes.",
    },
  };
}

async function readStdinText(): Promise<string> {
  let text = "";
  input.setEncoding("utf8");
  for await (const chunk of input) {
    text += chunk;
  }
  return text;
}

async function readJsonInput(options: WriteOptions): Promise<unknown> {
  if (!options.input) {
    throw new Error("--input <file.json> is required for this write command.");
  }

  const raw = options.input === "-" ? await readStdinText() : await readFile(options.input, "utf8");
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error(`Invalid JSON in --input ${options.input}: ${formatError(error)}`);
  }
}

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return value as Record<string, unknown>;
}

function omitKeys(source: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const result = { ...source };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

async function confirmWrite(options: WriteOptions, request: PreparedWriteRequest): Promise<void> {
  if (wantsJson(options) || options.yes || options.dryRun) {
    return;
  }

  const reader = createInterface({ input, output });
  try {
    const answer = await reader.question(`About to ${request.method} ${request.path}. Type yes to continue: `);
    if (answer.trim().toLowerCase() !== "yes") {
      throw new Error("Write cancelled.");
    }
  } finally {
    reader.close();
  }
}

async function runWrite(label: string, options: WriteOptions, prepare: () => Promise<PreparedWriteRequest>): Promise<void> {
  try {
    const request = await prepare();

    if (options.dryRun) {
      printResult(label, { ok: true, dryRun: true, request }, options);
      return;
    }

    if (request.safety === "destructive" && (!writesEnabled(options) || !destructiveEnabled(options) || !options.yes)) {
      if (wantsJson(options)) {
        console.log(formatJson(destructiveDisabledResponse()));
      } else {
        console.error("Error: Destructive operations are disabled by default. Set SMARTMOVING_ALLOW_WRITES=true and SMARTMOVING_ALLOW_DESTRUCTIVE=true, then pass --yes.");
      }
      process.exitCode = 1;
      return;
    }

    if (!writesEnabled(options)) {
      if (wantsJson(options)) {
        console.log(formatJson(writesDisabledResponse()));
      } else {
        console.error("Error: Write operations are disabled by default. Set SMARTMOVING_ALLOW_WRITES=true or use --allow-writes, then run with --dry-run first.");
      }
      process.exitCode = 1;
      return;
    }

    if (!options.yes) {
      printResult(label, { ok: true, dryRun: true, request }, options);
      return;
    }

    await confirmWrite(options, request);
    const client = await requireClient(options);
    const result = request.method === "POST"
      ? await client.post(request.path, request.body)
      : request.method === "PUT"
        ? await client.put(request.path, request.body)
        : request.method === "PATCH"
          ? await client.patch(request.path, request.body)
          : await client.delete(request.path);
    printReadResult(label, result, options);
  } catch (error) {
    if (wantsJson(options)) {
      console.log(formatJson({ ok: false, error: { code: "WRITE_FAILED", message: formatError(error) } }));
    } else {
      console.error(`Error: ${formatError(error)}`);
    }
    process.exitCode = 1;
  }
}

function addWriteOptions(command: Command): Command {
  return command
    .addOption(jsonOption())
    .addOption(new Option("--allow-writes", "allow write operations for this command"))
    .requiredOption("--input <file.json>", "JSON request body file, or '-' to read JSON from stdin")
    .option("--dry-run", "validate and print the request without calling SmartMoving")
    .option("--yes", "skip interactive confirmation")
    .option("--idempotency-key <key>", "caller-supplied idempotency key for external tracking");
}

function addActionOptions(command: Command): Command {
  return command
    .addOption(jsonOption())
    .addOption(new Option("--allow-writes", "allow write operations for this command"))
    .option("--dry-run", "validate and print the request without calling SmartMoving")
    .option("--yes", "skip interactive confirmation")
    .option("--idempotency-key <key>", "caller-supplied idempotency key for external tracking");
}

function addDestructiveOptions(command: Command): Command {
  return addActionOptions(command)
    .addOption(new Option("--allow-destructive", "allow destructive operations for this command"));
}

async function inputBody(options: WriteOptions): Promise<Record<string, unknown>> {
  return requireObject(await readJsonInput(options), "--input");
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

async function promptYesNo(question: string, defaultValue: boolean): Promise<boolean> {
  const defaultLabel = defaultValue ? "Y/n" : "y/N";
  const reader = createInterface({ input, output });
  try {
    const answer = (await reader.question(`${question} (${defaultLabel}): `)).trim().toLowerCase();
    if (!answer) {
      return defaultValue;
    }
    return ["y", "yes", "true", "1"].includes(answer);
  } finally {
    reader.close();
  }
}

async function promptRequired(question: string): Promise<string> {
  const reader = createInterface({ input, output });
  try {
    const answer = await reader.question(`${question}: `);
    const trimmed = answer.trim();
    if (!trimmed) {
      throw new Error(`${question} is required.`);
    }
    return trimmed;
  } finally {
    reader.close();
  }
}

async function readOneStdinValue(): Promise<string> {
  const text = await readStdinText();
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("API key cannot be empty.");
  }
  return trimmed;
}

async function runInit(options: InitOptions): Promise<void> {
  try {
    let profile = options.profile ?? program.opts<GlobalOptions>().profile ?? "default";
    let apiKeyEnv = options.apiKeyEnv ?? DEFAULT_API_KEY_ENV;
    let baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    let storeApiKey = options.storeApiKey === true;
    let apiKeyToStore: string | undefined;

    if (!options.yes) {
      profile = await promptDefault("Profile name", profile);
      baseUrl = await promptDefault("Base URL", baseUrl);
      storeApiKey = await promptYesNo("Store API key locally on this machine", true);
      if (storeApiKey) {
        apiKeyToStore = await promptRequired("Paste SmartMoving API key");
      } else {
        apiKeyEnv = await promptDefault("API key environment variable", apiKeyEnv);
      }
    }

    if (options.apiKeyStdin) {
      if (!storeApiKey) {
        throw new Error("--api-key-stdin requires --store-api-key so the key has somewhere local to go.");
      }
      apiKeyToStore = await readOneStdinValue();
    }

    if (storeApiKey && !apiKeyToStore && process.env[apiKeyEnv]) {
      apiKeyToStore = process.env[apiKeyEnv];
    }

    if (storeApiKey && !apiKeyToStore) {
      throw new Error("--store-api-key requires --api-key-stdin, interactive input, or the configured API key environment variable.");
    }

    const path = configPath();
    const config = await writeInitialConfig({ profile, apiKeyEnv, baseUrl, apiKeySource: storeApiKey ? "local" : "env" }, path);
    const selected = config.profiles[config.defaultProfile];

    let storedCredentialsPath: string | undefined;
    if (storeApiKey && apiKeyToStore) {
      storedCredentialsPath = credentialsPath();
      await writeStoredApiKey(config.defaultProfile, apiKeyToStore, storedCredentialsPath);
    }

    const result = storeApiKey
      ? { ok: true, configPath: path, profile: config.defaultProfile, apiKeySource: "local", credentialsPath: storedCredentialsPath }
      : { ok: true, configPath: path, profile: config.defaultProfile, apiKeySource: "env", apiKeyEnv: selected?.apiKeyEnv };
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
  .addOption(new Option("--allow-writes", "allow guarded write commands; alternatively set SMARTMOVING_ALLOW_WRITES=true"))
  .addOption(new Option("--allow-destructive", "allow destructive commands; alternatively set SMARTMOVING_ALLOW_DESTRUCTIVE=true"))
  .addOption(new Option("--plain", "prefer plain text output for commands that support it"))
  .addOption(new Option("--quiet", "suppress non-essential stderr messages"))
  .addOption(new Option("--verbose", "print extra diagnostic detail where supported"))
  .addOption(new Option("--no-color", "disable color output"))
  .addOption(profileOption())
  .showHelpAfterError()
  .showSuggestionAfterError();

program
  .command("init")
  .description("Create SmartMoving CLI config and optionally store an API key locally.")
  .addOption(jsonOption())
  .addOption(profileOption())
  .option("--api-key-env <name>", "environment variable that will hold the API key when local storage is not used", DEFAULT_API_KEY_ENV)
  .option("--store-api-key", "store an API key in a local machine-only credentials file")
  .option("--api-key-stdin", "read an API key from stdin; requires --store-api-key")
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

registerSchemaCommand(program, { jsonOption, printResult });
registerAgentCommand(program, { jsonOption, printResult, formatJson, formatError });
registerDocsCommand(program, { jsonOption, printResult });
registerSmokeCommand(program, { jsonOption });

const mcp = program.command("mcp").description("Print MCP client configuration helpers.");

mcp
  .command("config")
  .description("Print MCP config snippets that reference environment variables, never raw API keys.")
  .option("--print-hermes", "print a Hermes YAML snippet")
  .option("--print-claude", "print a Claude Desktop JSON snippet")
  .option("--print-json", "print generic MCP JSON")
  .action((options: { printHermes?: boolean; printClaude?: boolean; printJson?: boolean }) => printMcpConfig(options));

addReadOptions(program
  .command("ping")
  .description("Verify SmartMoving API connectivity and authentication."))
  .action((options: GlobalOptions) =>
    runRead("Ping", options, (client) => client.get("/api/ping")),
  );

const reference = program.command("reference").description("Read SmartMoving reference data.");

async function getAllReferenceData(client: SmartMovingClient): Promise<Record<string, unknown>> {
  const [branches, moveSizes, referralSources, serviceTypes, tariffs, users, arrivalWindows, badLeadReasons, cancellationReasons, lostReasons] = await Promise.all([
    client.get("/api/branches"),
    client.get("/api/move-sizes"),
    client.get("/api/referral-sources"),
    client.get("/api/service-types"),
    client.get("/api/tariffs"),
    client.get("/api/users"),
    client.get("/api/arrival-windows"),
    client.get("/api/bad-lead-reasons"),
    client.get("/api/cancellation-reasons"),
    client.get("/api/lost-reasons"),
  ]);

  return { branches, moveSizes, referralSources, serviceTypes, tariffs, users, arrivalWindows, badLeadReasons, cancellationReasons, lostReasons };
}

addReadOptions(reference
  .command("all")
  .description("Fetch commonly used SmartMoving reference data in one read-only response."))
  .action((options: GlobalOptions) =>
    runRead("Reference data", options, (client) => getAllReferenceData(client)),
  );

addReadOptions(reference
  .command("branches")
  .description("List SmartMoving branches/office locations."))
  .action((options: GlobalOptions) =>
    runRead("Branches", options, (client) => client.get("/api/branches")),
  );

addReadOptions(reference
  .command("move-sizes")
  .description("List SmartMoving move size reference values."))
  .action((options: GlobalOptions) =>
    runRead("Move sizes", options, (client) => client.get("/api/move-sizes")),
  );

for (const [commandName, label, path] of [
  ["referral-sources", "Referral sources", "/api/referral-sources"],
  ["service-types", "Service types", "/api/service-types"],
  ["tariffs", "Tariffs", "/api/tariffs"],
  ["users", "Users", "/api/users"],
  ["arrival-windows", "Arrival windows", "/api/arrival-windows"],
  ["bad-lead-reasons", "Bad lead reasons", "/api/bad-lead-reasons"],
  ["cancellation-reasons", "Cancellation reasons", "/api/cancellation-reasons"],
  ["lost-reasons", "Lost reasons", "/api/lost-reasons"],
] as const) {
  addReadOptions(reference.command(commandName).description(`Read SmartMoving ${label.toLowerCase()}.`))
    .action((options: GlobalOptions) => runRead(label, options, (client) => client.get(path)));
}

addReadOptions(reference
  .command("tariff-materials")
  .description("List materials available under a tariff.")
  .argument("<tariffId>", "tariff UUID"))
  .action((tariffId: string, options: GlobalOptions) =>
    runRead("Tariff materials", options, (client) => client.get(`/api/premium/tariffs/${tariffId}/materials`)),
  );

const customers = program.command("customers").description("Read customer records.");

addReadOptions(customers
  .command("list")
  .description("List customers with pagination.")
  .option("--page <page>", "page number", "1")
  .option("--page-size <pageSize>", "records per page, max 100", "25")
  .option("--from-service-date <date>", "filter customers with service on or after this ISO date")
  .option("--to-service-date <date>", "filter customers with service on or before this ISO date")
  .option("--include-opportunity-info", "include opportunity count and revenue summary"))
  .action((options: CustomersListOptions) =>
    runRead("Customers", options, (client) => {
      const page = positiveInteger(options.page ?? "1", "--page");
      const pageSize = positiveInteger(options.pageSize ?? "25", "--page-size");
      if (pageSize > 100) {
        throw new Error("--page-size must be 100 or less.");
      }
      return client.get("/api/customers", {
        Page: page,
        PageSize: pageSize,
        FromServiceDate: options.fromServiceDate,
        ToServiceDate: options.toServiceDate,
        IncludeOpportunityInfo: options.includeOpportunityInfo === true,
      });
    }),
  );

addReadOptions(customers
  .command("get")
  .description("Get a customer by UUID.")
  .argument("<customerId>", "customer UUID"))
  .action((customerId: string, options: GlobalOptions) =>
    runRead("Customer", options, (client) => client.get(`/api/customers/${customerId}`)),
  );

addWriteOptions(customers
  .command("create")
  .description("Create a customer. Guarded write; dry-run first."))
  .action((options: WriteOptions) => runWrite("Customer create", options, async () => ({
    method: "POST",
    path: "/api/premium/customers",
    body: await inputBody(options),
  })));

addWriteOptions(customers
  .command("update")
  .description("Update a customer by UUID. Guarded write; dry-run first.")
  .argument("<customerId>", "customer UUID"))
  .action((customerId: string, options: WriteOptions) => runWrite("Customer update", options, async () => ({
    method: "PUT",
    path: `/api/premium/customers/${customerId}`,
    body: await inputBody(options),
  })));

addReadOptions(customers
  .command("search")
  .description("Search customers by name, phone, or email.")
  .argument("<query>", "search query, at least 3 characters"))
  .action((query: string, options: GlobalOptions) =>
    runRead("Customers", options, (client) => client.get("/api/premium/customers/search", { searchQuery: query })),
  );

for (const [commandName, label, pathFor] of [
  ["opportunities", "Customer opportunities", (customerId: string) => `/api/customers/${customerId}/opportunities`],
  ["storage-accounts", "Customer storage accounts", (customerId: string) => `/api/customers/${customerId}/storage-accounts`],
  ["service-tickets", "Customer service tickets", (customerId: string) => `/api/premium/customers/${customerId}/service-tickets`],
] as const) {
  addReadOptions(customers.command(commandName).description(`Read ${label.toLowerCase()}.`).argument("<customerId>", "customer UUID"))
    .action((customerId: string, options: GlobalOptions) => runRead(label, options, (client) => client.get(pathFor(customerId))));
}

const leads = program.command("leads").description("Read lead records.");

addReadOptions(leads
  .command("list")
  .description("List leads with pagination.")
  .option("--page <page>", "page number", "1")
  .option("--page-size <pageSize>", "records per page, max 100", "25"))
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

addReadOptions(leads
  .command("get")
  .description("Get a lead by UUID.")
  .argument("<leadId>", "lead UUID"))
  .action((leadId: string, options: GlobalOptions) =>
    runRead("Lead", options, (client) => client.get(`/api/leads/${leadId}`)),
  );

addWriteOptions(leads
  .command("create")
  .description("Create a lead. Guarded write; dry-run first."))
  .action((options: WriteOptions) => runWrite("Lead create", options, async () => ({
    method: "POST",
    path: "/api/premium/leads",
    body: await inputBody(options),
  })));

addWriteOptions(leads
  .command("update")
  .description("Full update for a lead. Guarded write; dry-run first.")
  .argument("<leadId>", "lead UUID"))
  .action((leadId: string, options: WriteOptions) => runWrite("Lead update", options, async () => ({
    method: "PUT",
    path: `/api/premium/leads/${leadId}`,
    body: await inputBody(options),
  })));

addWriteOptions(leads
  .command("patch")
  .description("Partially update a lead. Guarded write; dry-run first.")
  .argument("<leadId>", "lead UUID"))
  .action((leadId: string, options: WriteOptions) => runWrite("Lead patch", options, async () => ({
    method: "PATCH",
    path: `/api/premium/leads/${leadId}`,
    body: await inputBody(options),
  })));

addWriteOptions(leads
  .command("convert")
  .description("Convert a lead to an opportunity. High-risk write; dry-run first.")
  .argument("<leadId>", "lead UUID"))
  .action((leadId: string, options: WriteOptions) => runWrite("Lead convert", options, async () => ({
    method: "PUT",
    path: `/api/premium/lead/${leadId}/convert`,
    body: await inputBody(options),
    safety: "write",
  })));

addReadOptions(leads
  .command("by-salesperson")
  .description("List leads assigned to a salesperson.")
  .argument("<userId>", "salesperson user UUID"))
  .action((userId: string, options: GlobalOptions) =>
    runRead("Leads", options, (client) => client.get(`/api/premium/leads/sales/${userId}`)),
  );

addReadOptions(leads
  .command("statuses")
  .description("List possible lead statuses."))
  .action((options: GlobalOptions) =>
    runRead("Lead statuses", options, (client) => client.get("/api/leads/statuses")),
  );

const opportunities = program.command("opportunities").description("Read opportunity records.");

addReadOptions(opportunities
  .command("get")
  .description("Get an opportunity by UUID.")
  .argument("<opportunityId>", "opportunity UUID")
  .option("--include-jobs", "include job details")
  .option("--include-follow-ups", "include follow-ups")
  .option("--include-payments", "include payments")
  .option("--include-documents", "include documents")
  .option("--include-rooms", "include room inventory")
  .option("--include-audit", "include audit activity"))
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

addReadOptions(opportunities
  .command("by-quote")
  .description("Look up an opportunity by quote number.")
  .argument("<quoteNumber>", "quote number"))
  .action((quoteNumber: string, options: GlobalOptions) =>
    runRead("Opportunity", options, (client) => client.get(`/api/opportunities/quote/${encodeURIComponent(quoteNumber)}`)),
  );

addWriteOptions(opportunities
  .command("create")
  .description("Create an opportunity. Guarded write; dry-run first."))
  .action((options: WriteOptions) => runWrite("Opportunity create", options, async () => ({
    method: "POST",
    path: "/api/premium/opportunity",
    body: await inputBody(options),
  })));

addWriteOptions(opportunities
  .command("update")
  .description("Update an opportunity. Guarded write; dry-run first.")
  .argument("<opportunityId>", "opportunity UUID"))
  .action((opportunityId: string, options: WriteOptions) => runWrite("Opportunity update", options, async () => ({
    method: "PATCH",
    path: `/api/premium/opportunities/${opportunityId}`,
    body: await inputBody(options),
  })));

const opportunityAttachments = opportunities.command("attachments").description("Manage opportunity attachments.");

addActionOptions(opportunityAttachments
  .command("add")
  .description("Upload an attachment to an opportunity. High-risk write; dry-run first.")
  .argument("<opportunityId>", "opportunity UUID")
  .requiredOption("--file <path>", "file to upload")
  .option("--file-category <category>", "SmartMoving file category number", "0")
  .option("--notes <notes>", "optional attachment notes"))
  .action((opportunityId: string, options: WriteOptions) => runWrite("Attachment add", options, async () => {
    if (!options.file) {
      throw new Error("--file <path> is required.");
    }
    const fileBuffer = await readFile(options.file);
    return {
      method: "POST",
      path: `/api/premium/opportunities/${opportunityId}/attachments`,
      body: {
        fileName: basename(options.file),
        fileCategory: Number.parseInt(options.fileCategory ?? "0", 10),
        fileBase64: fileBuffer.toString("base64"),
        notes: options.notes,
      },
      safety: "write",
    };
  }));

const opportunityRooms = opportunities.command("rooms").description("Manage opportunity inventory rooms.");

addWriteOptions(opportunityRooms
  .command("create")
  .description("Create inventory rooms for an opportunity. High-risk write; dry-run first.")
  .argument("<opportunityId>", "opportunity UUID"))
  .action((opportunityId: string, options: WriteOptions) => runWrite("Rooms create", options, async () => ({
    method: "POST",
    path: `/api/premium/opportunities/${opportunityId}/rooms`,
    body: await readJsonInput(options),
    safety: "write",
  })));

for (const [commandName, label, pathFor] of [
  ["audit", "Opportunity audit", (opportunityId: string) => `/api/opportunities/${opportunityId}/audit-activity`],
  ["documents", "Opportunity documents", (opportunityId: string) => `/api/premium/opportunities/${opportunityId}/documents`],
  ["payments", "Opportunity payments", (opportunityId: string) => `/api/payments/opportunities/${opportunityId}`],
] as const) {
  addReadOptions(opportunities.command(commandName).description(`Read ${label.toLowerCase()}.`).argument("<opportunityId>", "opportunity UUID"))
    .action((opportunityId: string, options: GlobalOptions) => runRead(label, options, (client) => client.get(pathFor(opportunityId))));
}

const jobs = program.command("jobs").description("Read job records.");

addReadOptions(jobs
  .command("by-opportunity")
  .description("List all jobs for an opportunity.")
  .argument("<opportunityId>", "opportunity UUID"))
  .action((opportunityId: string, options: GlobalOptions) =>
    runRead("Jobs", options, (client) => client.get(`/api/opportunities/${opportunityId}/jobs`)),
  );

addReadOptions(jobs
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
  .option("--include-notes", "include notes"))
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

addDestructiveOptions(jobs
  .command("delete")
  .description("Delete a job from an opportunity. Destructive; requires writes, destructive gate, and --yes.")
  .argument("<jobId>", "job UUID")
  .requiredOption("--opportunity-id <opportunityId>", "parent opportunity UUID required by the SmartMoving API"))
  .action((jobId: string, options: WriteOptions) => runWrite("Job delete", options, async () => ({
    method: "DELETE",
    path: `/api/premium/opportunities/${options.opportunityId}/jobs/${jobId}`,
    safety: "destructive",
  })));

addActionOptions(jobs
  .command("confirm")
  .description("Confirm a job on an opportunity. High-risk write; dry-run first.")
  .argument("<jobId>", "job UUID")
  .requiredOption("--opportunity-id <opportunityId>", "parent opportunity UUID required by the SmartMoving API"))
  .action((jobId: string, options: WriteOptions) => runWrite("Job confirm", options, async () => ({
    method: "POST",
    path: `/api/premium/opportunities/${options.opportunityId}/jobs/${jobId}/confirm`,
    safety: "write",
  })));

const jobStops = jobs.command("stops").description("Manage job stops.");

addWriteOptions(jobStops
  .command("update")
  .description("Replace all stops on a job. High-risk write; dry-run first.")
  .argument("<jobId>", "job UUID")
  .requiredOption("--opportunity-id <opportunityId>", "parent opportunity UUID required by the SmartMoving API"))
  .action((jobId: string, options: WriteOptions) => runWrite("Job stops update", options, async () => ({
    method: "PUT",
    path: `/api/premium/opportunities/${options.opportunityId}/jobs/${jobId}/stops`,
    body: await inputBody(options),
    safety: "write",
  })));

const jobMaterials = jobs.command("materials").description("Manage job materials.");

addWriteOptions(jobMaterials
  .command("add")
  .description("Add estimated materials to a job. High-risk write; dry-run first.")
  .argument("<jobId>", "job UUID")
  .requiredOption("--opportunity-id <opportunityId>", "parent opportunity UUID required by the SmartMoving API"))
  .action((jobId: string, options: WriteOptions) => runWrite("Job materials add", options, async () => ({
    method: "POST",
    path: `/api/premium/opportunities/${options.opportunityId}/Estimated/jobs/${jobId}/materials`,
    body: await inputBody(options),
    safety: "write",
  })));

const jobNotes = addReadOptions(jobs
  .command("notes")
  .description("Read all note fields on a job.")
  .argument("<jobId>", "job UUID")
  .requiredOption("--opportunity-id <opportunityId>", "parent opportunity UUID required by the SmartMoving API"))
  .action((jobId: string, options: JobGetOptions) =>
    runRead("Job notes", options, (client) =>
      client.get(`/api/premium/opportunities/${options.opportunityId}/jobs/${jobId}`, { IncludeNotes: true }),
    ),
  );

addWriteOptions(jobNotes
  .command("update")
  .description("Update job note fields. Guarded write; dry-run first.")
  .argument("<jobId>", "job UUID")
  .requiredOption("--opportunity-id <opportunityId>", "parent opportunity UUID required by the SmartMoving API"))
  .action((jobId: string, options: WriteOptions) => runWrite("Job notes update", options, async () => ({
    method: "PATCH",
    path: `/api/premium/opportunities/${options.opportunityId}/jobs/${jobId}/notes`,
    body: await inputBody(options),
  })));

jobNotes
  .command("append")
  .description("Append text to a job note field. Guarded write; dry-run first.")
  .argument("<jobId>", "job UUID")
  .requiredOption("--opportunity-id <opportunityId>", "parent opportunity UUID required by the SmartMoving API")
  .requiredOption("--text <text>", "text to append")
  .addOption(jsonOption())
  .addOption(new Option("--allow-writes", "allow write operations for this command"))
  .option("--dry-run", "validate and print the request without calling SmartMoving")
  .option("--yes", "skip interactive confirmation")
  .option("--idempotency-key <key>", "caller-supplied idempotency key for external tracking")
  .action((jobId: string, options: WriteOptions) => runWrite("Job note append", options, async () => ({
    method: "PATCH",
    path: `/api/premium/opportunities/${options.opportunityId}/jobs/${jobId}/notes`,
    body: { internalNotes: options.text },
  })));


const inventory = program.command("inventory").description("Read opportunity inventory data.");

addReadOptions(inventory
  .command("opportunity")
  .description("Get the full inventory for an opportunity.")
  .argument("<opportunityId>", "opportunity UUID"))
  .action((opportunityId: string, options: GlobalOptions) =>
    runRead("Opportunity inventory", options, (client) => client.get(`/api/premium/opportunities/${opportunityId}/inventory`)),
  );

addReadOptions(inventory
  .command("master")
  .description("Get the master inventory catalog."))
  .action((options: GlobalOptions) =>
    runRead("Master inventory", options, (client) => client.get("/api/premium/inventory")),
  );

addReadOptions(inventory
  .command("room-types")
  .description("Get available inventory room types."))
  .action((options: GlobalOptions) =>
    runRead("Room types", options, (client) => client.get("/api/premium/room-types")),
  );

addDestructiveOptions(inventory
  .command("remove-item")
  .description("Remove an inventory item from a room. Destructive; requires writes, destructive gate, and --yes.")
  .argument("<itemId>", "inventory item UUID")
  .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID")
  .requiredOption("--room-id <roomId>", "room UUID containing the item"))
  .action((itemId: string, options: WriteOptions) => runWrite("Inventory item remove", options, async () => ({
    method: "DELETE",
    path: `/api/premium/opportunities/${options.opportunityId}/inventory/rooms/${options.roomId}/items/${itemId}`,
    safety: "destructive",
  })));

addActionOptions(inventory
  .command("submit-review")
  .description("Submit opportunity inventory for review. High-risk write; dry-run first.")
  .argument("<opportunityId>", "opportunity UUID"))
  .action((opportunityId: string, options: WriteOptions) => runWrite("Inventory submit review", options, async () => ({
    method: "POST",
    path: `/api/premium/opportunities/${opportunityId}/inventory/submit`,
    safety: "write",
  })));

const followups = program.command("followups").description("Read follow-up records.");

addReadOptions(followups
  .command("list")
  .description("List follow-ups for one opportunity.")
  .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID to inspect"))
  .action((options: FollowupsDueOptions) =>
    runRead("Follow-ups", options, (client) => client.get(`/api/premium/opportunities/${options.opportunityId}/followups`)),
  );

addReadOptions(followups
  .command("get")
  .description("Get one follow-up for an opportunity.")
  .argument("<followupId>", "follow-up UUID")
  .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID to inspect"))
  .action((followupId: string, options: FollowupsDueOptions) =>
    runRead("Follow-up", options, (client) => client.get(`/api/premium/opportunities/${options.opportunityId}/followups/${followupId}`)),
  );

addReadOptions(followups
  .command("due")
  .description("List due follow-ups for one opportunity. Account-wide due follow-ups are not exposed by the current SmartMoving v1 API spec.")
  .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID to inspect")
  .option("--now <isoDateTime>", "compare against this ISO date/time instead of the current time")
  .option("--include-completed", "include completed follow-ups"))
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

addWriteOptions(followups
  .command("create")
  .description("Create a follow-up for an opportunity. Guarded write; dry-run first.")
  .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID"))
  .action((options: WriteOptions) => runWrite("Follow-up create", options, async () => ({
    method: "POST",
    path: `/api/premium/opportunities/${options.opportunityId}/followups`,
    body: await inputBody(options),
  })));

addWriteOptions(followups
  .command("update")
  .description("Update a follow-up for an opportunity. Guarded write; dry-run first.")
  .argument("<followupId>", "follow-up UUID")
  .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID"))
  .action((followupId: string, options: WriteOptions) => runWrite("Follow-up update", options, async () => ({
    method: "PUT",
    path: `/api/premium/opportunities/${options.opportunityId}/followups/${followupId}`,
    body: await inputBody(options),
  })));

addDestructiveOptions(followups
  .command("delete")
  .description("Delete a follow-up from an opportunity. Destructive; requires writes, destructive gate, and --yes.")
  .argument("<followupId>", "follow-up UUID")
  .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID"))
  .action((followupId: string, options: WriteOptions) => runWrite("Follow-up delete", options, async () => ({
    method: "DELETE",
    path: `/api/premium/opportunities/${options.opportunityId}/followups/${followupId}`,
    safety: "destructive",
  })));

const communication = program.command("communication").description("Log guarded communication writes.");

addWriteOptions(communication
  .command("note")
  .description("Log a note on an opportunity. Guarded write; dry-run first."))
  .action((options: WriteOptions) => runWrite("Communication note", options, async () => {
    const body = await inputBody(options);
    const opportunityId = typeof body.opportunityId === "string" ? body.opportunityId : undefined;
    if (!opportunityId) {
      throw new Error("--input must include an opportunityId string.");
    }
    return {
      method: "POST",
      path: `/api/premium/opportunities/${opportunityId}/communication/notes`,
      body: omitKeys(body, ["opportunityId"]),
    };
  }));

addWriteOptions(communication
  .command("call")
  .description("Log a call on an opportunity. Guarded write; dry-run first."))
  .action((options: WriteOptions) => runWrite("Communication call", options, async () => {
    const body = await inputBody(options);
    const opportunityId = typeof body.opportunityId === "string" ? body.opportunityId : undefined;
    if (!opportunityId) {
      throw new Error("--input must include an opportunityId string.");
    }
    return {
      method: "POST",
      path: `/api/premium/opportunities/${opportunityId}/communication/calls`,
      body: omitKeys(body, ["opportunityId"]),
    };
  }));

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(`Error: ${formatError(error)}`);
  process.exit(1);
});
