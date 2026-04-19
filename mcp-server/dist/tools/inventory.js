// ============================================================================
// Inventory Tools
// ============================================================================
import { z } from "zod";
export function registerInventoryTools(server, client) {
    // ---------- get_opportunity_inventory ----------
    server.tool("get_opportunity_inventory", "Get the full inventory for an opportunity. Premium tier endpoint. Returns all rooms and their inventory items with quantities, weights, and volumes. This gives a complete picture of what the customer is moving.", {
        opportunityId: z.string().uuid().describe("The opportunity ID"),
    }, async (params) => {
        try {
            const result = await client.get(`/api/premium/opportunities/${params.opportunityId}/inventory`);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- add_inventory_items ----------
    server.tool("add_inventory_items", "Add inventory items to a specific room in an opportunity. Premium tier endpoint. Items reference the master inventory catalog (use get_master_inventory to find valid item IDs). Each item needs a masterInventoryItemId and a quantity.", {
        opportunityId: z.string().uuid().describe("The opportunity ID"),
        roomId: z.string().uuid().describe("The room ID to add items to (use create_rooms first if needed, or get rooms from get_opportunity_inventory)"),
        items: z.array(z.object({
            masterInventoryItemId: z.string().uuid().describe("Master inventory item ID (use get_master_inventory for valid IDs)"),
            quantity: z.number().int().min(1).describe("How many of this item"),
            notes: z.string().optional().describe("Notes about this specific item (e.g. 'fragile', 'disassemble')"),
        })).min(1).describe("Array of items to add to the room"),
    }, async (params) => {
        try {
            const result = await client.post(`/api/premium/opportunities/${params.opportunityId}/inventory/rooms/${params.roomId}`, { items: params.items });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- update_inventory_item ----------
    server.tool("update_inventory_item", "Update an existing inventory item in a room. Premium tier endpoint. Use this to change the quantity or notes for an item already in the inventory.", {
        opportunityId: z.string().uuid().describe("The opportunity ID"),
        roomId: z.string().uuid().describe("The room ID containing the item"),
        inventoryItemId: z.string().uuid().describe("The inventory item ID to update"),
        quantity: z.number().int().min(0).optional().describe("Updated quantity (set to 0 to effectively remove)"),
        notes: z.string().optional().describe("Updated notes for the item"),
    }, async (params) => {
        try {
            const body = {};
            if (params.quantity !== undefined)
                body.quantity = params.quantity;
            if (params.notes !== undefined)
                body.notes = params.notes;
            const result = await client.put(`/api/premium/opportunities/${params.opportunityId}/inventory/rooms/${params.roomId}/items/${params.inventoryItemId}`, body);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- remove_inventory_item ----------
    server.tool("remove_inventory_item", "Remove an inventory item from a room. Premium tier endpoint. Permanently deletes the item from the opportunity's inventory.", {
        opportunityId: z.string().uuid().describe("The opportunity ID"),
        roomId: z.string().uuid().describe("The room ID containing the item"),
        inventoryItemId: z.string().uuid().describe("The inventory item ID to remove"),
    }, async (params) => {
        try {
            const result = await client.delete(`/api/premium/opportunities/${params.opportunityId}/inventory/rooms/${params.roomId}/items/${params.inventoryItemId}`);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- submit_inventory_review ----------
    server.tool("submit_inventory_review", "Submit the inventory for review / finalization. Premium tier endpoint. Call this after all inventory items have been added and the inventory is complete. This typically triggers weight/volume calculations and may affect pricing.", {
        opportunityId: z.string().uuid().describe("The opportunity ID whose inventory to submit"),
    }, async (params) => {
        try {
            const result = await client.post(`/api/premium/opportunities/${params.opportunityId}/inventory/submit`);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_master_inventory ----------
    server.tool("get_master_inventory", "Get the master inventory catalog. Premium tier endpoint. Returns all available inventory items that can be added to an opportunity (e.g. 'Sofa', 'Queen Bed', 'Box - Large'). Each item has a default weight and volume. Use the item IDs when calling add_inventory_items.", {}, async () => {
        try {
            const result = await client.get("/api/premium/inventory");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- get_room_types ----------
    server.tool("get_room_types", "Get all available room types. Premium tier endpoint. Returns the catalog of room types (e.g. 'Living Room', 'Master Bedroom', 'Kitchen', 'Garage') that can be used when creating rooms for an opportunity's inventory.", {}, async () => {
        try {
            const result = await client.get("/api/premium/room-types");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
}
//# sourceMappingURL=inventory.js.map