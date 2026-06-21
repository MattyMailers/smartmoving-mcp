import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SmartMovingClient } from "../client.js";
/**
 * Registers the current MCP tool modules while the operation registry is being
 * introduced as metadata. This preserves all existing MCP behavior and names.
 */
export declare function registerOperationsWithMcp(server: McpServer, client: SmartMovingClient): void;
//# sourceMappingURL=register-mcp.d.ts.map