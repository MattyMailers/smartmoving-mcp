// ============================================================================
// Lead Tools
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

const geocodedAddressSchema = z.object({
  fullAddress: z.string().optional(),
  street: z.string().optional(),
  unit: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  country: z.string().optional(),
});

export function registerLeadTools(server: McpServer, client: SmartMovingClient): void {
  // ---------- list_leads ----------
  server.tool(
    "list_leads",
    "List leads with pagination. Returns a paginated list of lead records. Leads are prospective customers who have not yet been converted to opportunities.",
    {
      page: z.number().int().min(1).default(1).describe("Page number (1-based)"),
      pageSize: z.number().int().min(1).max(100).default(25).describe("Number of records per page (max 100)"),
    },
    async (params) => {
      try {
        const result = await client.get("/api/leads", {
          page: params.page,
          pageSize: params.pageSize,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_lead ----------
  server.tool(
    "get_lead",
    "Get detailed information about a specific lead by ID. Returns all lead details including contact info, move details, origin/destination addresses, and current status.",
    {
      leadId: z.string().uuid().describe("The unique lead ID (UUID)"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/leads/${params.leadId}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- create_lead ----------
  server.tool(
    "create_lead",
    "Create a new lead in SmartMoving. Premium tier endpoint. A lead represents a potential customer inquiry. You can provide either separate firstName/lastName fields or a combined 'name' field. The referralSourceId is required - use get_referral_sources to find valid IDs.",
    {
      firstName: z.string().optional().describe("Lead first name (use this OR the 'name' field)"),
      lastName: z.string().optional().describe("Lead last name"),
      companyName: z.string().optional().describe("Company name for commercial leads"),
      name: z.string().optional().describe("Full name as a single field (alternative to firstName/lastName)"),
      phones: z.array(phoneSchema).optional().describe("Array of phone numbers"),
      emails: z.array(emailSchema).optional().describe("Array of email addresses"),
      moveDate: z.string().optional().describe("Requested move date (ISO 8601, e.g. 2024-06-15)"),
      originAddress: addressSchema.optional().describe("Moving-from address"),
      destinationAddress: addressSchema.optional().describe("Moving-to address"),
      referralSourceId: z.string().uuid().describe("Required: How the lead found the company. Use get_referral_sources to get valid IDs."),
      notes: z.string().optional().describe("Free-text notes about the lead"),
      branchId: z.string().uuid().optional().describe("Branch to assign the lead to"),
      serviceTypeId: z.string().uuid().optional().describe("Type of service requested (use get_service_types for IDs)"),
      moveSizeId: z.string().uuid().optional().describe("Size of move (use get_move_sizes for IDs)"),
      estimatedWeight: z.number().optional().describe("Estimated weight in lbs"),
      estimatedVolume: z.number().optional().describe("Estimated volume in cubic feet"),
    },
    async (params) => {
      try {
        const result = await client.post("/api/premium/leads", params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- update_lead ----------
  server.tool(
    "update_lead",
    "Fully update an existing lead record. Premium tier endpoint. This is a PUT operation - all fields will be set to the provided values (omitted fields may be cleared). For partial updates, use patch_lead instead.",
    {
      leadId: z.string().uuid().describe("The unique lead ID to update"),
      firstName: z.string().optional().describe("Lead first name"),
      lastName: z.string().optional().describe("Lead last name"),
      companyName: z.string().optional().describe("Company name"),
      name: z.string().optional().describe("Full name as a single field"),
      phones: z.array(phoneSchema).optional().describe("Array of phone numbers"),
      emails: z.array(emailSchema).optional().describe("Array of email addresses"),
      moveDate: z.string().optional().describe("Requested move date (ISO 8601)"),
      originAddress: addressSchema.optional().describe("Moving-from address"),
      destinationAddress: addressSchema.optional().describe("Moving-to address"),
      referralSourceId: z.string().uuid().optional().describe("Referral source ID"),
      notes: z.string().optional().describe("Free-text notes"),
      branchId: z.string().uuid().optional().describe("Branch ID"),
      serviceTypeId: z.string().uuid().optional().describe("Service type ID"),
      moveSizeId: z.string().uuid().optional().describe("Move size ID"),
      estimatedWeight: z.number().optional().describe("Estimated weight in lbs"),
      estimatedVolume: z.number().optional().describe("Estimated volume in cubic feet"),
    },
    async (params) => {
      try {
        const { leadId, ...body } = params;
        const result = await client.put(`/api/premium/leads/${leadId}`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- patch_lead ----------
  server.tool(
    "patch_lead",
    "Partially update an existing lead. Premium tier endpoint. Only the fields you provide will be modified; all other fields remain unchanged. Use this for small updates to a lead.",
    {
      leadId: z.string().uuid().describe("The unique lead ID to patch"),
      firstName: z.string().optional().describe("Updated first name"),
      lastName: z.string().optional().describe("Updated last name"),
      companyName: z.string().optional().describe("Updated company name"),
      phones: z.array(phoneSchema).optional().describe("Updated phone numbers"),
      emails: z.array(emailSchema).optional().describe("Updated email addresses"),
      moveDate: z.string().optional().describe("Updated move date (ISO 8601)"),
      originAddress: addressSchema.optional().describe("Updated origin address"),
      destinationAddress: addressSchema.optional().describe("Updated destination address"),
      referralSourceId: z.string().uuid().optional().describe("Updated referral source ID"),
      notes: z.string().optional().describe("Updated notes"),
      branchId: z.string().uuid().optional().describe("Updated branch ID"),
      serviceTypeId: z.string().uuid().optional().describe("Updated service type ID"),
      moveSizeId: z.string().uuid().optional().describe("Updated move size ID"),
    },
    async (params) => {
      try {
        const { leadId, ...body } = params;
        const result = await client.patch(`/api/premium/leads/${leadId}`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_leads_by_salesperson ----------
  server.tool(
    "get_leads_by_salesperson",
    "List leads assigned to a specific salesperson. Premium tier endpoint. Useful for viewing a sales rep's pipeline of uncontacted or in-progress leads.",
    {
      salesPersonId: z.string().uuid().describe("The user/salesperson ID (use get_users to find IDs)"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/premium/leads/sales/${params.salesPersonId}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- convert_lead_to_opportunity ----------
  server.tool(
    "convert_lead_to_opportunity",
    "Convert a lead into an opportunity. Premium tier endpoint. SmartMoving requires a complete conversion payload, not just the lead ID: customerId, referralSourceId, tariffId, moveDate, moveSizeId, salesPersonId, and serviceTypeId are required. Use search_customers/create_customer, get_referral_sources, get_tariffs, get_move_sizes, get_users, and get_service_types first. Follow-up reminders can only be created after this conversion because follow-ups are opportunity-only.",
    {
      leadId: z.string().uuid().describe("The lead ID to convert"),
      customerId: z.string().uuid().describe("Required customer ID. Search or create the customer first."),
      referralSourceId: z.string().uuid().describe("Required referral source ID"),
      tariffId: z.string().uuid().describe("Required tariff/rate sheet ID"),
      branchId: z.string().uuid().optional().describe("Branch ID"),
      moveDate: z.string().describe("Required move date in yyyy-MM-dd format; must be today or future"),
      moveSizeId: z.string().uuid().describe("Required move size ID"),
      salesPersonId: z.string().uuid().describe("Required salesperson/user ID"),
      serviceTypeId: z.number().int().describe("Required service type/job type ID; e.g. 1=Moving"),
      originAddress: geocodedAddressSchema.optional().describe("Optional origin address using SmartMoving's GeocodedAddress fields: fullAddress, street, unit, city, state, zip, lat, lng, country"),
      destinationAddress: geocodedAddressSchema.optional().describe("Optional destination address using SmartMoving's GeocodedAddress fields"),
    },
    async (params) => {
      try {
        const { leadId, ...body } = params;
        const result = await client.put(`/api/premium/lead/${leadId}/convert`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_lead_statuses ----------
  server.tool(
    "get_lead_statuses",
    "Get all possible lead status values. Returns the list of statuses a lead can be in (e.g. New, Contacted, Qualified, Lost, BadLead, Converted). Useful for understanding lead status codes.",
    {},
    async () => {
      try {
        const result = await client.get("/api/leads/statuses");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );
}
