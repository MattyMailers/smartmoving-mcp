// ============================================================================
// Reference Data Tools (Branches, Move Sizes, Tariffs, Users, etc.)
// ============================================================================
import { z } from "zod";
export function registerReferenceTools(server, client) {
    // ---------- get_branches ----------
    server.tool("get_branches", "Get all branches (office locations) configured in SmartMoving. Branches are used to segment operations by location. Branch IDs are needed when creating leads, opportunities, or filtering data.", {}, async () => {
        try {
            const result = await client.get("/api/branches");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_move_sizes ----------
    server.tool("get_move_sizes", "Get all move size options (e.g. 'Studio', '1 Bedroom', '2-3 Bedroom', '4+ Bedroom'). Move sizes help categorize the scope of a move and are used when creating leads and opportunities.", {}, async () => {
        try {
            const result = await client.get("/api/move-sizes");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_referral_sources ----------
    server.tool("get_referral_sources", "Get all referral sources (how customers find the company). Examples: 'Google', 'Yelp', 'Referral', 'Website'. A referral source ID is REQUIRED when creating leads and opportunities. Always call this first to get valid IDs.", {}, async () => {
        try {
            const result = await client.get("/api/referral-sources");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_service_types ----------
    server.tool("get_service_types", "Get all service types offered (e.g. 'Local Moving', 'Long Distance', 'Packing Only', 'Storage'). Service type IDs are used when creating leads and opportunities to categorize the type of service requested.", {}, async () => {
        try {
            const result = await client.get("/api/service-types");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_tariffs ----------
    server.tool("get_tariffs", "Get all tariffs (rate sheets / pricing structures). Tariffs define hourly rates, minimums, and material pricing. A tariff ID can be assigned to an opportunity to control pricing. Each tariff may be tied to a specific branch.", {}, async () => {
        try {
            const result = await client.get("/api/tariffs");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_tariff_materials ----------
    server.tool("get_tariff_materials", "Get materials available under a specific tariff. Premium tier endpoint. Returns packing materials (boxes, tape, paper, etc.) with their unit prices. Material IDs are used when adding materials to jobs via add_job_materials.", {
        tariffId: z.string().uuid().describe("The tariff ID (use get_tariffs to find IDs)"),
    }, async (params) => {
        try {
            const result = await client.get(`/api/premium/tariffs/${params.tariffId}/materials`);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_users ----------
    server.tool("get_users", "Get all users in the SmartMoving account. Returns salespeople, dispatchers, managers, and other staff. User IDs are needed when assigning leads, opportunities, follow-ups, or filtering by salesperson.", {}, async () => {
        try {
            const result = await client.get("/api/users");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_arrival_windows ----------
    server.tool("get_arrival_windows", "Get all arrival window options (e.g. '8AM-10AM', '10AM-12PM'). Arrival windows define the time range when the crew is expected to arrive at the customer's location. IDs are used when creating or updating opportunities.", {}, async () => {
        try {
            const result = await client.get("/api/arrival-windows");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_bad_lead_reasons ----------
    server.tool("get_bad_lead_reasons", "Get all bad lead reason options. These are used when marking a lead as 'Bad Lead' to categorize why (e.g. 'Spam', 'Out of Service Area', 'Duplicate').", {}, async () => {
        try {
            const result = await client.get("/api/bad-lead-reasons");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_cancellation_reasons ----------
    server.tool("get_cancellation_reasons", "Get all cancellation reason options. These are required when changing an opportunity's status to Cancelled (status=20). Examples: 'Customer Changed Plans', 'Price Too High', 'Went With Competitor'.", {}, async () => {
        try {
            const result = await client.get("/api/cancellation-reasons");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_lost_reasons ----------
    server.tool("get_lost_reasons", "Get all lost reason options. These are required when changing an opportunity's status to Lost (status=30). Similar to cancellation reasons but for opportunities that were never booked.", {}, async () => {
        try {
            const result = await client.get("/api/lost-reasons");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- ping ----------
    server.tool("ping", "Health check endpoint. Use this to verify the SmartMoving API connection and that your API key is valid. Returns a simple success response if everything is working.", {}, async () => {
        try {
            const result = await client.get("/api/ping");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
}
//# sourceMappingURL=reference.js.map