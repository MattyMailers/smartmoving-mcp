import { afterEach, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { SmartMovingClient } from "./client.js";
import { registerAllTools } from "./tools/index.js";

describe("MCP discovery", () => {
  const closers: Array<() => Promise<void>> = [];
  afterEach(async () => { await Promise.allSettled(closers.splice(0).map((close) => close())); });

  it("publishes the batch follow-up audit with its bounded input schema", async () => {
    const server = new McpServer({ name: "smartmoving-test", version: "0.1.0" });
    const client = new Client({ name: "smartmoving-test-client", version: "0.1.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    registerAllTools(server, new SmartMovingClient({ apiKey: "synthetic-test-key", baseUrl: "http://127.0.0.1:1/v1" }));
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    closers.push(() => client.close(), () => server.close());

    const result = await client.listTools();
    expect(result.tools).toHaveLength(63);
    const tool = result.tools.find((entry) => entry.name === "audit_followup_gaps");
    expect(tool?.description).toContain("read-only");
    expect(tool?.inputSchema).toMatchObject({ type: "object", required: ["jobNumbers"], properties: { jobNumbers: { type: "array", minItems: 1, maxItems: 1000 }, concurrency: { type: "integer", minimum: 1, maximum: 10, default: 4 } } });
  });
});
