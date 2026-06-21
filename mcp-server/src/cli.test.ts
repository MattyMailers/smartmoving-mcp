import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const cliArgs = ["--import", "tsx", "src/cli.ts"];
const testApiKey = "test-smartmoving-cli-api-key";

interface CliResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

interface CapturedRequest {
  method: string;
  path: string;
  headers: IncomingMessage["headers"];
}

interface ReadCommandCase {
  name: string;
  args: string[];
  expectedPath: string;
}

async function runCli(args: string[], env: Record<string, string | undefined> = {}): Promise<CliResult> {
  const child = spawn(process.execPath, [...cliArgs, ...args], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      SMARTMOVING_API_KEY: undefined,
      SMARTMOVING_BASE_URL: undefined,
      ...env,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk: string) => {
    stderr += chunk;
  });

  const [code] = (await once(child, "exit")) as [number | null];
  return { code, stdout, stderr };
}

async function withMockApi<T>(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
  run: (baseUrl: string, requests: CapturedRequest[]) => Promise<T>,
): Promise<T> {
  const requests: CapturedRequest[] = [];
  const server = createServer((request, response) => {
    requests.push({
      method: request.method ?? "GET",
      path: request.url ?? "",
      headers: request.headers,
    });
    handler(request, response);
  });

  try {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected HTTP server to listen on a TCP port.");
    }

    return await run(`http://127.0.0.1:${address.port}/v1`, requests);
  } finally {
    server.close();
  }
}

function jsonResponse(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function expectJsonOk(stdout: string, data: unknown): void {
  expect(JSON.parse(stdout)).toEqual({ ok: true, data });
}

const readCommandCases: ReadCommandCase[] = [
  { name: "customers list", args: ["customers", "list", "--page-size", "25", "--json"], expectedPath: "/v1/api/customers?Page=1&PageSize=25&IncludeOpportunityInfo=false" },
  { name: "customers search", args: ["customers", "search", "Alice", "--json"], expectedPath: "/v1/api/premium/customers/search?searchQuery=Alice" },
  { name: "customers opportunities", args: ["customers", "opportunities", "customer-1", "--json"], expectedPath: "/v1/api/customers/customer-1/opportunities" },
  { name: "customers storage-accounts", args: ["customers", "storage-accounts", "customer-1", "--json"], expectedPath: "/v1/api/customers/customer-1/storage-accounts" },
  { name: "customers service-tickets", args: ["customers", "service-tickets", "customer-1", "--json"], expectedPath: "/v1/api/premium/customers/customer-1/service-tickets" },
  { name: "leads get", args: ["leads", "get", "lead-1", "--json"], expectedPath: "/v1/api/leads/lead-1" },
  { name: "leads by-salesperson", args: ["leads", "by-salesperson", "user-1", "--json"], expectedPath: "/v1/api/premium/leads/sales/user-1" },
  { name: "leads statuses", args: ["leads", "statuses", "--json"], expectedPath: "/v1/api/leads/statuses" },
  { name: "opportunities by-quote", args: ["opportunities", "by-quote", "Q-123", "--json"], expectedPath: "/v1/api/opportunities/quote/Q-123" },
  { name: "opportunities audit", args: ["opportunities", "audit", "opp-1", "--json"], expectedPath: "/v1/api/opportunities/opp-1/audit-activity" },
  { name: "opportunities documents", args: ["opportunities", "documents", "opp-1", "--json"], expectedPath: "/v1/api/premium/opportunities/opp-1/documents" },
  { name: "opportunities payments", args: ["opportunities", "payments", "opp-1", "--json"], expectedPath: "/v1/api/payments/opportunities/opp-1" },
  { name: "jobs by-opportunity", args: ["jobs", "by-opportunity", "opp-1", "--json"], expectedPath: "/v1/api/opportunities/opp-1/jobs" },
  { name: "jobs notes", args: ["jobs", "notes", "job-1", "--opportunity-id", "opp-1", "--json"], expectedPath: "/v1/api/premium/opportunities/opp-1/jobs/job-1?IncludeNotes=true" },
  { name: "inventory opportunity", args: ["inventory", "opportunity", "opp-1", "--json"], expectedPath: "/v1/api/premium/opportunities/opp-1/inventory" },
  { name: "inventory master", args: ["inventory", "master", "--json"], expectedPath: "/v1/api/premium/inventory" },
  { name: "inventory room-types", args: ["inventory", "room-types", "--json"], expectedPath: "/v1/api/premium/room-types" },
  { name: "followups list", args: ["followups", "list", "--opportunity-id", "opp-1", "--json"], expectedPath: "/v1/api/premium/opportunities/opp-1/followups" },
  { name: "followups get", args: ["followups", "get", "followup-1", "--opportunity-id", "opp-1", "--json"], expectedPath: "/v1/api/premium/opportunities/opp-1/followups/followup-1" },
  { name: "reference referral-sources", args: ["reference", "referral-sources", "--json"], expectedPath: "/v1/api/referral-sources" },
  { name: "reference service-types", args: ["reference", "service-types", "--json"], expectedPath: "/v1/api/service-types" },
  { name: "reference tariffs", args: ["reference", "tariffs", "--json"], expectedPath: "/v1/api/tariffs" },
  { name: "reference tariff-materials", args: ["reference", "tariff-materials", "tariff-1", "--json"], expectedPath: "/v1/api/premium/tariffs/tariff-1/materials" },
  { name: "reference users", args: ["reference", "users", "--json"], expectedPath: "/v1/api/users" },
  { name: "reference arrival-windows", args: ["reference", "arrival-windows", "--json"], expectedPath: "/v1/api/arrival-windows" },
  { name: "reference bad-lead-reasons", args: ["reference", "bad-lead-reasons", "--json"], expectedPath: "/v1/api/bad-lead-reasons" },
  { name: "reference cancellation-reasons", args: ["reference", "cancellation-reasons", "--json"], expectedPath: "/v1/api/cancellation-reasons" },
  { name: "reference lost-reasons", args: ["reference", "lost-reasons", "--json"], expectedPath: "/v1/api/lost-reasons" },
];

describe("SmartMoving CLI", () => {
  afterEach(() => {
    delete process.env.SMARTMOVING_API_KEY;
    delete process.env.SMARTMOVING_BASE_URL;
  });

  it("exits non-zero with a helpful error when SMARTMOVING_API_KEY is missing", async () => {
    const result = await runCli(["ping", "--json"]);

    expect(result.code).toBe(1);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("SMARTMOVING_API_KEY environment variable is required");
    expect(result.stdout).toContain("do not pass API keys as CLI arguments");
    expect(JSON.parse(result.stdout)).toMatchObject({ ok: false, error: { code: "READ_FAILED" } });
  });

  it("ping --json calls /api/ping and prints JSON", async () => {
    await withMockApi(
      (_request, response) => jsonResponse(response, 200, { ok: true }),
      async (baseUrl, requests) => {
        const result = await runCli(["ping", "--json"], {
          SMARTMOVING_API_KEY: testApiKey,
          SMARTMOVING_BASE_URL: baseUrl,
        });

        expect(result.code).toBe(0);
        expect(result.stderr).toBe("");
        expectJsonOk(result.stdout, { ok: true });
        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({ method: "GET", path: "/v1/api/ping" });
        expect(requests[0]?.headers["x-api-key"]).toBe(testApiKey);
      },
    );
  });

  it("reference branches --json calls the expected endpoint", async () => {
    await withMockApi(
      (_request, response) => jsonResponse(response, 200, [{ id: "branch-1", name: "Test Branch" }]),
      async (baseUrl, requests) => {
        const result = await runCli(["reference", "branches", "--json"], {
          SMARTMOVING_API_KEY: testApiKey,
          SMARTMOVING_BASE_URL: baseUrl,
        });

        expect(result.code).toBe(0);
        expectJsonOk(result.stdout, [{ id: "branch-1", name: "Test Branch" }]);
        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({ method: "GET", path: "/v1/api/branches" });
      },
    );
  });

  it("leads list --page-size includes query params", async () => {
    await withMockApi(
      (_request, response) => jsonResponse(response, 200, { items: [] }),
      async (baseUrl, requests) => {
        const result = await runCli(["leads", "list", "--page-size", "25", "--json"], {
          SMARTMOVING_API_KEY: testApiKey,
          SMARTMOVING_BASE_URL: baseUrl,
        });

        expect(result.code).toBe(0);
        expectJsonOk(result.stdout, { items: [] });
        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({ method: "GET", path: "/v1/api/leads?page=1&pageSize=25" });
      },
    );
  });

  it("redacts the API key from error output", async () => {
    await withMockApi(
      (_request, response) => jsonResponse(response, 401, { message: `invalid x-api-key: ${testApiKey}` }),
      async (baseUrl) => {
        const result = await runCli(["ping", "--json"], {
          SMARTMOVING_API_KEY: testApiKey,
          SMARTMOVING_BASE_URL: baseUrl,
        });

        expect(result.code).toBe(1);
        expect(result.stderr).toBe("");
        expect(result.stdout).toContain("SmartMoving API error: HTTP 401");
        expect(result.stdout).toContain("[REDACTED]");
        expect(result.stdout).not.toContain(testApiKey);
        expect(JSON.parse(result.stdout)).toMatchObject({ ok: false, error: { code: "READ_FAILED" } });
      },
    );
  });

  it.each(readCommandCases)("$name --json calls the expected read endpoint", async ({ args, expectedPath }) => {
    await withMockApi(
      (_request, response) => jsonResponse(response, 200, { fixture: true }),
      async (baseUrl, requests) => {
        const result = await runCli(args, {
          SMARTMOVING_API_KEY: testApiKey,
          SMARTMOVING_BASE_URL: baseUrl,
        });

        expect(result.code).toBe(0);
        expect(result.stderr).toBe("");
        expectJsonOk(result.stdout, { fixture: true });
        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({ method: "GET", path: expectedPath });
      },
    );
  });

  it("reference all --json fetches each reference endpoint", async () => {
    await withMockApi(
      (_request, response) => jsonResponse(response, 200, { fixture: true }),
      async (baseUrl, requests) => {
        const result = await runCli(["reference", "all", "--json"], {
          SMARTMOVING_API_KEY: testApiKey,
          SMARTMOVING_BASE_URL: baseUrl,
        });

        expect(result.code).toBe(0);
        expect(result.stderr).toBe("");
        const output = JSON.parse(result.stdout);
        expect(output.ok).toBe(true);
        expect(Object.keys(output.data)).toEqual([
          "branches",
          "moveSizes",
          "referralSources",
          "serviceTypes",
          "tariffs",
          "users",
          "arrivalWindows",
          "badLeadReasons",
          "cancellationReasons",
          "lostReasons",
        ]);
        expect(requests.map((request) => request.path)).toEqual([
          "/v1/api/branches",
          "/v1/api/move-sizes",
          "/v1/api/referral-sources",
          "/v1/api/service-types",
          "/v1/api/tariffs",
          "/v1/api/users",
          "/v1/api/arrival-windows",
          "/v1/api/bad-lead-reasons",
          "/v1/api/cancellation-reasons",
          "/v1/api/lost-reasons",
        ]);
      },
    );
  });

  it("prints top-level help without requiring an API key", async () => {
    const result = await runCli(["--help"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Usage: smartmoving [options] [command]");
    expect(result.stdout).toContain("Read-only CLI for the SmartMoving External API v1");
    expect(result.stdout).toContain("ping");
  });

  it("prints subcommand help without requiring an API key", async () => {
    const result = await runCli(["leads", "list", "--help"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Usage: smartmoving leads list [options]");
    expect(result.stdout).toContain("--page-size <pageSize>");
    expect(result.stdout).toContain("--json");
  });

  it("init --yes writes profile config without storing a raw API key", async () => {
    const dir = await mkdtemp(join(tmpdir(), "smartmoving-cli-test-"));
    const configPath = join(dir, "config.json");

    try {
      const result = await runCli(
        ["init", "--yes", "--profile", "dispatch", "--api-key-env", "SMARTMOVING_TEST_KEY", "--base-url", "https://example.test/v1", "--json"],
        { SMARTMOVING_CONFIG_PATH: configPath },
      );

      expect(result.code).toBe(0);
      expect(result.stderr).toBe("");
      expect(JSON.parse(result.stdout)).toEqual({ ok: true, configPath, profile: "dispatch", apiKeyEnv: "SMARTMOVING_TEST_KEY" });

      const config = JSON.parse(await readFile(configPath, "utf8"));
      expect(config).toEqual({
        version: 1,
        defaultProfile: "dispatch",
        profiles: {
          dispatch: {
            baseUrl: "https://example.test/v1",
            apiKeyEnv: "SMARTMOVING_TEST_KEY",
          },
        },
      });
      expect(JSON.stringify(config)).not.toContain(testApiKey);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("doctor --json reports missing API key with stable JSON and no stdout noise", async () => {
    const dir = await mkdtemp(join(tmpdir(), "smartmoving-cli-test-"));
    const configPath = join(dir, "config.json");

    try {
      await runCli(["init", "--yes", "--profile", "default", "--api-key-env", "SMARTMOVING_TEST_KEY"], {
        SMARTMOVING_CONFIG_PATH: configPath,
      });

      const result = await runCli(["doctor", "--json"], { SMARTMOVING_CONFIG_PATH: configPath });

      expect(result.code).toBe(1);
      expect(result.stderr).toBe("");
      expect(JSON.parse(result.stdout)).toMatchObject({
        ok: false,
        error: {
          code: "AUTH_MISSING",
          message: "SMARTMOVING_TEST_KEY is required",
          hint: "Run smartmoving init or export SMARTMOVING_TEST_KEY.",
        },
        safety: {
          writesEnabled: false,
          destructiveEnabled: false,
        },
      });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("doctor --json pings the configured API without printing the API key", async () => {
    await withMockApi(
      (_request, response) => jsonResponse(response, 200, { ok: true }),
      async (baseUrl) => {
        const dir = await mkdtemp(join(tmpdir(), "smartmoving-cli-test-"));
        const configPath = join(dir, "config.json");

        try {
          await runCli(["init", "--yes", "--profile", "default", "--api-key-env", "SMARTMOVING_TEST_KEY", "--base-url", baseUrl], {
            SMARTMOVING_CONFIG_PATH: configPath,
          });

          const result = await runCli(["doctor", "--json"], {
            SMARTMOVING_CONFIG_PATH: configPath,
            SMARTMOVING_TEST_KEY: testApiKey,
          });

          expect(result.code).toBe(0);
          expect(result.stderr).toBe("");
          expect(result.stdout).not.toContain(testApiKey);
          expect(JSON.parse(result.stdout)).toMatchObject({
            ok: true,
            checks: expect.arrayContaining([
              expect.objectContaining({ name: "apiKey", ok: true, detail: "present via SMARTMOVING_TEST_KEY" }),
              expect.objectContaining({ name: "ping", ok: true }),
            ]),
          });
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      },
    );
  });

  it("doctor --json redacts custom-profile API keys from ping errors", async () => {
    await withMockApi(
      (_request, response) => jsonResponse(response, 401, { message: `invalid x-api-key: ${testApiKey}` }),
      async (baseUrl) => {
        const dir = await mkdtemp(join(tmpdir(), "smartmoving-cli-test-"));
        const configPath = join(dir, "config.json");

        try {
          await runCli(["init", "--yes", "--profile", "default", "--api-key-env", "SMARTMOVING_TEST_KEY", "--base-url", baseUrl], {
            SMARTMOVING_CONFIG_PATH: configPath,
          });

          const result = await runCli(["doctor", "--json"], {
            SMARTMOVING_CONFIG_PATH: configPath,
            SMARTMOVING_TEST_KEY: testApiKey,
          });

          expect(result.code).toBe(1);
          expect(result.stderr).toBe("");
          expect(result.stdout).not.toContain(testApiKey);
          expect(JSON.parse(result.stdout)).toMatchObject({
            ok: false,
            checks: expect.arrayContaining([expect.objectContaining({ name: "ping", ok: false })]),
          });
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      },
    );
  });

  it("mcp config --print-json references env vars instead of raw API keys", async () => {
    const result = await runCli(["mcp", "config", "--print-json"], { SMARTMOVING_API_KEY: testApiKey });

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).not.toContain(testApiKey);
    expect(JSON.parse(result.stdout)).toEqual({
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
    });
  });

  it("schema --json prints the 62-operation registry contract without requiring an API key", async () => {
    const result = await runCli(["schema", "--json"]);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    const schema = JSON.parse(result.stdout);
    expect(schema).toMatchObject({ ok: true, version: "0.1.0" });
    expect(schema.operations).toHaveLength(62);
    expect(schema.operations).toContainEqual(expect.objectContaining({
      name: "list_leads",
      group: "leads",
      safety: "read",
      cli: expect.objectContaining({ command: "leads list" }),
      mcp: expect.objectContaining({ toolName: "list_leads" }),
    }));
  });

  it("schema --group and --safety filter the operation registry", async () => {
    const result = await runCli(["schema", "--group", "leads", "--safety", "read", "--json"]);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    const schema = JSON.parse(result.stdout);
    expect(schema.operations).toHaveLength(4);
    expect(schema.operations.every((operation: { group: string; safety: string }) => operation.group === "leads" && operation.safety === "read")).toBe(true);
  });
});
