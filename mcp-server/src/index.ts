#!/usr/bin/env node
// ============================================================================
// SmartMoving MCP Server - Main Entry Point
// ============================================================================
//
// This server exposes the SmartMoving External API v1 as MCP tools so that
// AI assistants (Claude, etc.) can interact with a moving company's CRM.
//
// Usage:
//   SMARTMOVING_API_KEY=<your-key> node dist/index.js
//
// Or via Claude Desktop config:
//   {
//     "mcpServers": {
//       "smartmoving": {
//         "command": "node",
//         "args": ["/path/to/mcp-server/dist/index.js"],
//         "env": { "SMARTMOVING_API_KEY": "<your-key>" }
//       }
//     }
//   }
// ============================================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SmartMovingClient } from "./client.js";
import { registerAllTools } from "./tools/index.js";

async function main(): Promise<void> {
  // ---------------------------------------------------------------------------
  // Read configuration from environment
  // ---------------------------------------------------------------------------
  const apiKey = process.env.SMARTMOVING_API_KEY;
  if (!apiKey) {
    console.error(
      "Error: SMARTMOVING_API_KEY environment variable is required.\n" +
        "Set it before starting the server:\n" +
        "  export SMARTMOVING_API_KEY=your-api-key-here\n",
    );
    process.exit(1);
  }

  const baseUrl = process.env.SMARTMOVING_BASE_URL; // optional override
  const truthyValues = new Set(["1", "true", "yes", "on"]);
  const envFlag = (name: string): boolean => {
    const value = process.env[name];
    return value ? truthyValues.has(value.trim().toLowerCase()) : false;
  };

  // ---------------------------------------------------------------------------
  // Initialize the SmartMoving HTTP client
  // ---------------------------------------------------------------------------
  const client = new SmartMovingClient({
    apiKey,
    baseUrl,
    allowWrites: envFlag("SMARTMOVING_ALLOW_WRITES"),
    allowDestructive: envFlag("SMARTMOVING_ALLOW_DESTRUCTIVE"),
  });

  // ---------------------------------------------------------------------------
  // Create and configure the MCP server
  // ---------------------------------------------------------------------------
  const server = new McpServer({
    name: "smartmoving",
    version: "0.1.0",
    description:
      "MCP server for the SmartMoving External API v1. " +
      "Provides tools for managing customers, leads, opportunities, jobs, " +
      "inventory, follow-ups, communication logging, and reference data " +
      "in a moving company CRM.",
  });

  // Register all tools from every module
  registerAllTools(server, client);

  // ---------------------------------------------------------------------------
  // Start the server over stdio transport
  // ---------------------------------------------------------------------------
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // The server is now running and listening on stdin/stdout.
  // It will shut down when the parent process closes the pipe.
}

main().catch((err) => {
  console.error("Fatal error starting SmartMoving MCP server:", err);
  process.exit(1);
});
