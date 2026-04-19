// ============================================================================
// Tool Registry - Registers all tool modules with the MCP server
// ============================================================================
import { registerCustomerTools } from "./customers.js";
import { registerLeadTools } from "./leads.js";
import { registerOpportunityTools } from "./opportunities.js";
import { registerJobTools } from "./jobs.js";
import { registerInventoryTools } from "./inventory.js";
import { registerFollowUpTools } from "./followups.js";
import { registerCommunicationTools } from "./communication.js";
import { registerReferenceTools } from "./reference.js";
/**
 * Registers all SmartMoving API tools with the given MCP server instance.
 */
export function registerAllTools(server, client) {
    registerCustomerTools(server, client);
    registerLeadTools(server, client);
    registerOpportunityTools(server, client);
    registerJobTools(server, client);
    registerInventoryTools(server, client);
    registerFollowUpTools(server, client);
    registerCommunicationTools(server, client);
    registerReferenceTools(server, client);
}
//# sourceMappingURL=index.js.map