// ============================================================================
// Tool Registry - Registers all tool modules with the MCP server
// ============================================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartMovingClient } from "../client.js";
import { registerOperationsWithMcp } from "../operations/register-mcp.js";

/**
 * Registers all SmartMoving API tools with the given MCP server instance.
 */
export function registerAllTools(server: McpServer, client: SmartMovingClient): void {
  registerOperationsWithMcp(server, client);
}
