import { describe, expect, it } from "vitest";
import { operationRegistry, operationSchemaContract } from "./registry.js";

const validGroups = new Set(["customers", "leads", "opportunities", "jobs", "inventory", "followups", "communication", "reference"]);
const validSafety = new Set(["read", "write", "destructive"]);

describe("operation registry", () => {
  it("contains metadata for the existing 62 MCP tools", () => {
    expect(operationRegistry).toHaveLength(62);
  });

  it("has unique operation names and CLI commands", () => {
    const names = operationRegistry.map((operation) => operation.name);
    const commands = operationRegistry.map((operation) => operation.cli.command);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(commands).size).toBe(commands.length);
  });

  it("uses valid groups, safety levels, and stable MCP tool names", () => {
    for (const operation of operationRegistry) {
      expect(validGroups.has(operation.group)).toBe(true);
      expect(validSafety.has(operation.safety)).toBe(true);
      expect(operation.mcp.toolName).toBe(operation.name);
      expect(operation.cli.description.length).toBeGreaterThan(0);
      expect(operation.cli.examples.length).toBeGreaterThan(0);
    }
  });

  it("labels write and destructive operations explicitly", () => {
    expect(operationRegistry.find((operation) => operation.name === "list_leads")?.safety).toBe("read");
    expect(operationRegistry.find((operation) => operation.name === "create_lead")?.safety).toBe("write");
    expect(operationRegistry.find((operation) => operation.name === "delete_job")?.safety).toBe("destructive");
    expect(operationRegistry.find((operation) => operation.name === "remove_inventory_item")?.safety).toBe("destructive");
    expect(operationRegistry.find((operation) => operation.name === "delete_followup")?.safety).toBe("destructive");
  });

  it("serializes the public schema contract with filters", () => {
    const schema = operationSchemaContract({ group: "leads", safety: "read" });

    expect(schema).toMatchObject({ ok: true, version: "0.1.0" });
    expect(schema.operations).toHaveLength(4);
    expect(schema.operations.every((operation) => operation.group === "leads" && operation.safety === "read")).toBe(true);
    expect(schema.operations[0]).toMatchObject({
      name: expect.any(String),
      cli: { command: expect.any(String), examples: expect.any(Array) },
      mcp: { toolName: expect.any(String) },
      outputModes: ["human", "json"],
      exitCodes: { success: 0, failure: 1 },
    });
  });

  it("includes agent guidance for schema consumers", () => {
    expect(operationSchemaContract()).toMatchObject({
      agentGuidance: {
        startWith: ["smartmoving doctor --json", "smartmoving schema --json"],
        readOnlyFirst: true,
        wrapUntrustedFlag: "--wrap-untrusted",
        secretHandling: expect.stringContaining("Never print API keys"),
      },
    });
  });
});
