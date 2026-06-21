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

describe("SmartMoving CLI", () => {
  afterEach(() => {
    delete process.env.SMARTMOVING_API_KEY;
    delete process.env.SMARTMOVING_BASE_URL;
  });

  it("exits non-zero with a helpful error when SMARTMOVING_API_KEY is missing", async () => {
    const result = await runCli(["ping", "--json"]);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("SMARTMOVING_API_KEY environment variable is required");
    expect(result.stderr).toContain("do not pass API keys as CLI arguments");
    expect(result.stdout).toBe("");
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
        expect(JSON.parse(result.stdout)).toEqual({ ok: true });
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
        expect(JSON.parse(result.stdout)).toEqual([{ id: "branch-1", name: "Test Branch" }]);
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
        expect(JSON.parse(result.stdout)).toEqual({ items: [] });
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
        expect(result.stderr).toContain("SmartMoving API error: HTTP 401");
        expect(result.stderr).toContain("[REDACTED]");
        expect(result.stderr).not.toContain(testApiKey);
        expect(result.stdout).toBe("");
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
});
