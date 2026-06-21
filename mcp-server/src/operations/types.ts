import type { z } from "zod";
import type { SmartMovingClient } from "../client.js";

export type OperationGroup = "customers" | "leads" | "opportunities" | "jobs" | "inventory" | "followups" | "communication" | "reference";
export type OperationSafety = "read" | "write" | "destructive";

export interface CliMetadata {
  command: string;
  description: string;
  examples: readonly string[];
  arguments?: readonly string[];
  options?: readonly string[];
  requiredOptions?: readonly string[];
}

export interface McpMetadata {
  toolName: string;
  description: string;
}

export interface OperationDefinition {
  name: string;
  group: OperationGroup;
  safety: OperationSafety;
  cli: CliMetadata;
  mcp: McpMetadata;
  inputSchema: z.ZodObject<any>;
  handler: (client: SmartMovingClient, input: unknown) => Promise<unknown>;
}

export interface OperationSchemaEntry {
  name: string;
  group: OperationGroup;
  safety: OperationSafety;
  description: string;
  cli: Required<CliMetadata>;
  mcp: McpMetadata;
  outputModes: ["human", "json"];
  exitCodes: { success: 0; failure: 1 };
}

export interface OperationSchemaContract {
  ok: true;
  version: string;
  operations: OperationSchemaEntry[];
}
