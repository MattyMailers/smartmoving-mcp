// ============================================================================
// Tool Registry - Registers all tool modules with the MCP server
// ============================================================================
import { registerOperationsWithMcp } from "../operations/register-mcp.js";
/**
 * Registers all SmartMoving API tools with the given MCP server instance.
 */
export function registerAllTools(server, client) {
    registerOperationsWithMcp(server, client);
}
//# sourceMappingURL=index.js.map