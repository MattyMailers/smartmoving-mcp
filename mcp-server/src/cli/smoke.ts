import { Command, Option } from "commander";
import { SmartMovingClient } from "../client.js";
import { formatError, formatJson } from "./format.js";

interface SmokeOptions {
  json?: boolean;
  dryRun?: boolean;
  readOnly?: boolean;
}

interface SmokeCheck {
  name: string;
  ok: boolean;
  detail?: string;
}

interface SmokeSuccess {
  ok: true;
  mode: "read" | "write" | "live";
  live: boolean;
  dryRun?: boolean;
  checks?: SmokeCheck[];
  request?: {
    method: "POST";
    path: string;
    body: Record<string, unknown>;
  };
}

interface SmokeFailure {
  ok: false;
  mode: "read" | "write" | "live";
  live?: boolean;
  error: {
    code: string;
    message: string;
    hint: string;
  };
  checks?: SmokeCheck[];
}

const truthyValues = new Set(["1", "true", "yes", "on"]);

function envFlag(name: string): boolean {
  const value = process.env[name];
  return value ? truthyValues.has(value.trim().toLowerCase()) : false;
}

function requireSmokeClient(): SmartMovingClient {
  const apiKey = process.env.SMARTMOVING_API_KEY;
  if (!apiKey) {
    throw new Error("SMARTMOVING_API_KEY environment variable is required for smoke tests.");
  }

  return new SmartMovingClient({
    apiKey,
    baseUrl: process.env.SMARTMOVING_BASE_URL,
    allowWrites: false,
    allowDestructive: false,
  });
}

function printSmoke(result: SmokeSuccess | SmokeFailure, options: SmokeOptions): void {
  if (options.json) {
    console.log(formatJson(result));
    return;
  }

  if (result.ok) {
    console.log(`Smoke ${result.mode}: ok`);
    return;
  }

  console.error(`Smoke ${result.mode}: ${result.error.message}`);
}

function optionsWithGlobals(command: Command, options: SmokeOptions): SmokeOptions {
  const globals = command.optsWithGlobals<SmokeOptions>();
  return { ...options, json: options.json === true || globals.json === true };
}

async function runReadSmoke(options: SmokeOptions): Promise<SmokeSuccess | SmokeFailure> {
  const checks: SmokeCheck[] = [];
  try {
    await requireSmokeClient().get("/api/ping");
    checks.push({ name: "ping", ok: true });
    return { ok: true, mode: "read", live: false, checks };
  } catch (error) {
    checks.push({ name: "ping", ok: false, detail: formatError(error) });
    return {
      ok: false,
      mode: "read",
      live: false,
      checks,
      error: {
        code: "SMOKE_READ_FAILED",
        message: formatError(error),
        hint: "Check SMARTMOVING_API_KEY, SMARTMOVING_BASE_URL, and API connectivity.",
      },
    };
  }
}

function writeSmokeDryRun(): SmokeSuccess {
  return {
    ok: true,
    mode: "write",
    live: false,
    dryRun: true,
    request: {
      method: "POST",
      path: "/api/premium/leads",
      body: {
        firstName: "Synthetic",
        lastName: "SmokeTest",
        note: "Dry-run only. This payload is never sent by smartmoving smoke write.",
      },
    },
  };
}

async function runLiveSmoke(options: SmokeOptions): Promise<SmokeSuccess | SmokeFailure> {
  if (!envFlag("SMARTMOVING_LIVE_TESTS")) {
    return {
      ok: false,
      mode: "live",
      error: {
        code: "LIVE_TESTS_DISABLED",
        message: "Live smoke tests require SMARTMOVING_LIVE_TESTS=true.",
        hint: "Run mocked smoke tests by default; only enable live tests against an authorized account.",
      },
    };
  }

  if (!options.readOnly) {
    return {
      ok: false,
      mode: "live",
      live: true,
      error: {
        code: "LIVE_WRITE_TESTS_UNSUPPORTED",
        message: "Live smoke tests are read-only unless a dedicated sandbox workflow is added.",
        hint: "Pass --read-only and do not run live write smoke tests against production CRM data.",
      },
    };
  }

  const read = await runReadSmoke(options);
  if (!read.ok) {
    return { ...read, mode: "live", live: true };
  }

  return { ...read, mode: "live", live: true };
}

export function registerSmokeCommand(program: Command, helpers: { jsonOption: () => Option }): void {
  const smoke = program
    .command("smoke")
    .description("Run safe SmartMoving CLI smoke tests. CI should use mocked tests; live tests require SMARTMOVING_LIVE_TESTS=true.");

  smoke
    .command("read")
    .description("Run a read-only smoke check against /api/ping.")
    .addOption(helpers.jsonOption())
    .action(async (options: SmokeOptions, command: Command) => {
      const mergedOptions = optionsWithGlobals(command, options);
      const result = await runReadSmoke(mergedOptions);
      printSmoke(result, mergedOptions);
      if (!result.ok) {
        process.exitCode = 1;
      }
    });

  smoke
    .command("write")
    .description("Print a dry-run write smoke payload without calling SmartMoving.")
    .addOption(helpers.jsonOption())
    .option("--dry-run", "print the synthetic write request without sending it", true)
    .action((options: SmokeOptions, command: Command) => {
      const mergedOptions = optionsWithGlobals(command, options);
      const result = writeSmokeDryRun();
      printSmoke(result, mergedOptions);
    });

  smoke
    .command("live")
    .description("Run opt-in live smoke checks. Requires SMARTMOVING_LIVE_TESTS=true and --read-only.")
    .addOption(helpers.jsonOption())
    .option("--read-only", "allow only live read checks")
    .action(async (options: SmokeOptions, command: Command) => {
      const mergedOptions = optionsWithGlobals(command, options);
      const result = await runLiveSmoke(mergedOptions);
      printSmoke(result, mergedOptions);
      if (!result.ok) {
        process.exitCode = 1;
      }
    });
}
