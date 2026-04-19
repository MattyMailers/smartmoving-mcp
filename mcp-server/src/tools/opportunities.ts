// ============================================================================
// Opportunity Tools
// ============================================================================

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartMovingClient } from "../client.js";

const phoneSchema = z.object({
  phoneNumber: z.string().optional(),
  phoneType: z.number().int().min(0).max(3).optional().describe("0=Mobile, 1=Home, 2=Office, 3=Other"),
  isPrimary: z.boolean().optional(),
});

const emailSchema = z.object({
  email: z.string().email().optional(),
  isPrimary: z.boolean().optional(),
});

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  propertyType: z.number().int().optional().describe("1=Apartment, 2=House, 3=Commercial, 4=Storage, 5=Warehouse, 6=AssistedLiving, 7=HighRise, 8=TownHouse, 10=Other"),
  floor: z.number().int().optional(),
  hasElevator: z.boolean().optional(),
  flightsOfStairs: z.number().int().optional(),
  walkDistance: z.number().optional(),
  apartmentNumber: z.string().optional(),
});

export function registerOpportunityTools(server: McpServer, client: SmartMovingClient): void {
  // ---------- get_opportunity ----------
  server.tool(
    "get_opportunity",
    "Get detailed information about a specific opportunity (quote/move). This is the core entity in SmartMoving representing a potential or booked move. Use the Include* boolean params to control which related data is returned (jobs, follow-ups, payments, documents, rooms). Including everything may result in large responses.",
    {
      opportunityId: z.string().uuid().describe("The unique opportunity ID (UUID)"),
      includeJobs: z.boolean().optional().default(false).describe("Include job details (moves, packing, etc.)"),
      includeFollowUps: z.boolean().optional().default(false).describe("Include scheduled follow-ups"),
      includePayments: z.boolean().optional().default(false).describe("Include payment records"),
      includeDocuments: z.boolean().optional().default(false).describe("Include attached documents"),
      includeRooms: z.boolean().optional().default(false).describe("Include room inventory data"),
      includeAudit: z.boolean().optional().default(false).describe("Include audit/activity trail"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/opportunities/${params.opportunityId}`, {
          IncludeJobs: params.includeJobs,
          IncludeFollowUps: params.includeFollowUps,
          IncludePayments: params.includePayments,
          IncludeDocuments: params.includeDocuments,
          IncludeRooms: params.includeRooms,
          IncludeAudit: params.includeAudit,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_opportunity_by_quote ----------
  server.tool(
    "get_opportunity_by_quote",
    "Look up an opportunity by its quote number (e.g. 'Q-12345'). Use this when you have a quote number but not the opportunity UUID. Returns the same detailed view as get_opportunity.",
    {
      quoteNumber: z.string().describe("The quote number (e.g. 'Q-12345')"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/opportunities/quote/${encodeURIComponent(params.quoteNumber)}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- create_opportunity ----------
  server.tool(
    "create_opportunity",
    "Create a new opportunity (quote) directly, bypassing the lead stage. Premium tier endpoint. An opportunity represents a potential move that can be priced, scheduled, and booked. The referralSourceId is required - use get_referral_sources to find valid IDs. You can provide either firstName/lastName or the combined 'name' field.",
    {
      firstName: z.string().optional().describe("Customer first name"),
      lastName: z.string().optional().describe("Customer last name"),
      companyName: z.string().optional().describe("Company name for commercial moves"),
      name: z.string().optional().describe("Full name as a single field (alternative to firstName/lastName)"),
      phones: z.array(phoneSchema).optional().describe("Array of phone numbers"),
      emails: z.array(emailSchema).optional().describe("Array of email addresses"),
      moveDate: z.string().optional().describe("Requested move date (ISO 8601)"),
      originAddress: addressSchema.optional().describe("Moving-from address"),
      destinationAddress: addressSchema.optional().describe("Moving-to address"),
      referralSourceId: z.string().uuid().describe("Required: How the customer found the company. Use get_referral_sources for valid IDs."),
      notes: z.string().optional().describe("Free-text notes"),
      branchId: z.string().uuid().optional().describe("Branch to assign the opportunity to"),
      serviceTypeId: z.string().uuid().optional().describe("Service type (use get_service_types for IDs)"),
      moveSizeId: z.string().uuid().optional().describe("Move size (use get_move_sizes for IDs)"),
      tariffId: z.string().uuid().optional().describe("Tariff/rate sheet (use get_tariffs for IDs)"),
      salesPersonId: z.string().uuid().optional().describe("Salesperson to assign (use get_users for IDs)"),
      estimatedWeight: z.number().optional().describe("Estimated weight in lbs"),
      estimatedVolume: z.number().optional().describe("Estimated volume in cubic feet"),
      arrivalWindowId: z.string().uuid().optional().describe("Arrival window (use get_arrival_windows for IDs)"),
    },
    async (params) => {
      try {
        const result = await client.post("/api/premium/opportunity", params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- update_opportunity ----------
  server.tool(
    "update_opportunity",
    "Update an existing opportunity. Premium tier endpoint. This is a PATCH operation - only the fields you provide will be modified. Use this to update customer info, move details, pricing, status changes, etc. To mark as lost/cancelled, set the status and provide the corresponding reason ID.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID to update"),
      firstName: z.string().optional().describe("Updated first name"),
      lastName: z.string().optional().describe("Updated last name"),
      companyName: z.string().optional().describe("Updated company name"),
      phones: z.array(phoneSchema).optional().describe("Updated phone numbers"),
      emails: z.array(emailSchema).optional().describe("Updated email addresses"),
      moveDate: z.string().optional().describe("Updated move date (ISO 8601)"),
      originAddress: addressSchema.optional().describe("Updated origin address"),
      destinationAddress: addressSchema.optional().describe("Updated destination address"),
      referralSourceId: z.string().uuid().optional().describe("Updated referral source ID"),
      notes: z.string().optional().describe("Updated customer-facing notes"),
      internalNotes: z.string().optional().describe("Updated internal notes (not shown to customer)"),
      branchId: z.string().uuid().optional().describe("Updated branch ID"),
      serviceTypeId: z.string().uuid().optional().describe("Updated service type ID"),
      moveSizeId: z.string().uuid().optional().describe("Updated move size ID"),
      tariffId: z.string().uuid().optional().describe("Updated tariff ID"),
      salesPersonId: z.string().uuid().optional().describe("Updated salesperson ID"),
      estimatedWeight: z.number().optional().describe("Updated estimated weight in lbs"),
      estimatedVolume: z.number().optional().describe("Updated estimated volume in cubic feet"),
      status: z.number().int().optional().describe("Change status: 0=NewLead, 1=LeadInProgress, 3=Opportunity, 4=Booked, 10=Completed, 11=Closed, 20=Cancelled, 30=Lost, 50=BadLead"),
      arrivalWindowId: z.string().uuid().optional().describe("Updated arrival window ID"),
      lostReasonId: z.string().uuid().optional().describe("Reason for marking as lost (required when status=30)"),
      cancellationReasonId: z.string().uuid().optional().describe("Reason for cancellation (required when status=20)"),
    },
    async (params) => {
      try {
        const { opportunityId, ...body } = params;
        const result = await client.patch(`/api/premium/opportunities/${opportunityId}`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_opportunity_audit ----------
  server.tool(
    "get_opportunity_audit",
    "Get the audit trail / activity log for an opportunity. Shows a chronological history of all changes, status transitions, and actions performed on the opportunity.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/opportunities/${params.opportunityId}/audit-activity`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_opportunity_documents ----------
  server.tool(
    "get_opportunity_documents",
    "List all documents attached to an opportunity. Premium tier endpoint. Returns file metadata including name, category, URL, and upload date.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/premium/opportunities/${params.opportunityId}/documents`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_opportunity_payments ----------
  server.tool(
    "get_opportunity_payments",
    "List all payments recorded for an opportunity. Returns payment details including type, amount, date, and reference numbers.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/payments/opportunities/${params.opportunityId}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- add_attachment ----------
  server.tool(
    "add_attachment",
    "Upload a file attachment to an opportunity. Premium tier endpoint. The file must be provided as a base64-encoded string. Use fileCategory to classify the document type.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID to attach the file to"),
      fileName: z.string().describe("File name with extension (e.g. 'contract.pdf')"),
      fileCategory: z.number().int().min(0).max(6).describe("File category: 0=Documents, 1=Customer, 2=Survey, 3=PreMove, 4=PostMove, 5=Claims, 6=DescriptiveInventory"),
      fileBase64: z.string().describe("The file content encoded as a base64 string"),
      notes: z.string().optional().describe("Optional notes about the attachment"),
    },
    async (params) => {
      try {
        const { opportunityId, ...body } = params;
        const result = await client.post(`/api/premium/opportunities/${opportunityId}/attachments`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- create_rooms ----------
  server.tool(
    "create_rooms",
    "Create rooms for an opportunity's inventory. Premium tier endpoint. Rooms are used to organize inventory items (e.g. 'Living Room', 'Master Bedroom'). Use get_room_types to find valid room type IDs.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      rooms: z.array(z.object({
        roomTypeId: z.string().uuid().describe("Room type ID (use get_room_types for valid IDs)"),
        name: z.string().optional().describe("Custom room name (overrides room type default name)"),
      })).min(1).describe("Array of rooms to create"),
    },
    async (params) => {
      try {
        const result = await client.post(`/api/premium/opportunities/${params.opportunityId}/rooms`, params.rooms);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );
}
