import { describe, expect, it } from "vitest";
import { registerReportTools } from "./reports.js";

describe("registerReportTools", () => {
  it("registers one read-only batch follow-up gap tool", async () => {
    const registrations: Array<{ name: string; description: string; schema: Record<string, unknown>; handler: (input: { jobNumbers: string[]; concurrency?: number }) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> }> = [];
    const server = { tool(name: string, description: string, schema: Record<string, unknown>, handler: (input: { jobNumbers: string[]; concurrency?: number }) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>) { registrations.push({ name, description, schema, handler }); } };
    const client = { async get(path: string): Promise<unknown> { if (path === "/api/opportunities/quote/12345") return { id: "opp-12345" }; if (path === "/api/premium/opportunities/opp-12345/followups") return []; throw new Error(`Unexpected path ${path}`); } };

    registerReportTools(server as never, client as never);
    expect(registrations).toHaveLength(1);
    expect(registrations[0]).toMatchObject({ name: "audit_followup_gaps", description: expect.stringContaining("read-only") });
    expect(registrations[0].schema).toHaveProperty("jobNumbers");
    const result = await registrations[0].handler({ jobNumbers: ["12345-1"], concurrency: 1 });
    expect(result.isError).not.toBe(true);
    expect(JSON.parse(result.content[0].text)).toMatchObject({ readOnly: true, summary: { inputRows: 1, missingActiveFollowup: 1 } });
  });
});
