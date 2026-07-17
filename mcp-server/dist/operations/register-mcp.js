import { registerCommunicationTools } from "../tools/communication.js";
import { registerCustomerTools } from "../tools/customers.js";
import { registerFollowUpTools } from "../tools/followups.js";
import { registerInventoryTools } from "../tools/inventory.js";
import { registerJobTools } from "../tools/jobs.js";
import { registerLeadTools } from "../tools/leads.js";
import { registerOpportunityTools } from "../tools/opportunities.js";
import { registerReferenceTools } from "../tools/reference.js";
import { registerReportTools } from "../tools/reports.js";
/**
 * Registers the current MCP tool modules while the operation registry is being
 * introduced as metadata. This preserves all existing MCP behavior and names.
 */
export function registerOperationsWithMcp(server, client) {
    registerCustomerTools(server, client);
    registerLeadTools(server, client);
    registerOpportunityTools(server, client);
    registerJobTools(server, client);
    registerInventoryTools(server, client);
    registerFollowUpTools(server, client);
    registerCommunicationTools(server, client);
    registerReferenceTools(server, client);
    registerReportTools(server, client);
}
//# sourceMappingURL=register-mcp.js.map