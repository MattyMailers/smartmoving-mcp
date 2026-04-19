// ============================================================================
// Customer Tools
// ============================================================================

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartMovingClient } from "../client.js";

// Shared Zod schemas for reuse
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

export function registerCustomerTools(server: McpServer, client: SmartMovingClient): void {
  // ---------- list_customers ----------
  server.tool(
    "list_customers",
    "List customers with pagination. Returns a paginated list of customer records from SmartMoving. Use this to browse or iterate through all customers in the system. Supports filtering by service date range.",
    {
      page: z.number().int().min(1).default(1).describe("Page number (1-based)"),
      pageSize: z.number().int().min(1).max(100).default(25).describe("Number of records per page (max 100)"),
      fromServiceDate: z.string().optional().describe("Filter: only customers with service on or after this date (ISO 8601, e.g. 2024-01-01)"),
      toServiceDate: z.string().optional().describe("Filter: only customers with service on or before this date (ISO 8601)"),
      includeOpportunityInfo: z.boolean().optional().default(false).describe("Include opportunity count and total revenue for each customer"),
    },
    async (params) => {
      try {
        const result = await client.get("/api/customers", {
          page: params.page,
          pageSize: params.pageSize,
          fromServiceDate: params.fromServiceDate,
          toServiceDate: params.toServiceDate,
          includeOpportunityInfo: params.includeOpportunityInfo,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_customer ----------
  server.tool(
    "get_customer",
    "Get detailed information about a specific customer by their ID. Returns full customer profile including contact info, address, notes, and dates.",
    {
      customerId: z.string().uuid().describe("The unique customer ID (UUID)"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/customers/${params.customerId}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- search_customers ----------
  server.tool(
    "search_customers",
    "Search customers by name, phone, or email. Premium tier endpoint. The search query must be at least 3 characters. Use this when you need to find a customer by partial information rather than browsing the full list.",
    {
      searchQuery: z.string().min(3).describe("Search term (min 3 characters). Matches against name, phone number, and email."),
    },
    async (params) => {
      try {
        const result = await client.get("/api/premium/customers/search", {
          searchQuery: params.searchQuery,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- create_customer ----------
  server.tool(
    "create_customer",
    "Create a new customer record in SmartMoving. Premium tier endpoint. At minimum a name (first/last or company) should be provided. Returns the created customer with its new ID.",
    {
      firstName: z.string().optional().describe("Customer first name"),
      lastName: z.string().optional().describe("Customer last name"),
      companyName: z.string().optional().describe("Company name (for commercial customers)"),
      phones: z.array(phoneSchema).optional().describe("Array of phone numbers"),
      emails: z.array(emailSchema).optional().describe("Array of email addresses"),
      address: addressSchema.optional().describe("Customer mailing / home address"),
      notes: z.string().optional().describe("Free-text notes about the customer"),
    },
    async (params) => {
      try {
        const result = await client.post("/api/premium/customers", params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- update_customer ----------
  server.tool(
    "update_customer",
    "Update an existing customer record. Premium tier endpoint. Provide the customer ID and any fields you want to change. Fields not included will remain unchanged.",
    {
      customerId: z.string().uuid().describe("The unique customer ID to update"),
      firstName: z.string().optional().describe("Updated first name"),
      lastName: z.string().optional().describe("Updated last name"),
      companyName: z.string().optional().describe("Updated company name"),
      phones: z.array(phoneSchema).optional().describe("Replacement array of phone numbers (replaces all existing)"),
      emails: z.array(emailSchema).optional().describe("Replacement array of email addresses (replaces all existing)"),
      address: addressSchema.optional().describe("Updated address"),
      notes: z.string().optional().describe("Updated notes"),
    },
    async (params) => {
      try {
        const { customerId, ...body } = params;
        const result = await client.put(`/api/premium/customers/${customerId}`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_customer_opportunities ----------
  server.tool(
    "get_customer_opportunities",
    "List all opportunities (quotes/moves) associated with a specific customer. Returns an array of opportunity summaries for the given customer ID.",
    {
      customerId: z.string().uuid().describe("The unique customer ID"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/customers/${params.customerId}/opportunities`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_customer_storage_accounts ----------
  server.tool(
    "get_customer_storage_accounts",
    "List storage accounts for a specific customer. Returns storage unit details, monthly rates, and account status for the customer.",
    {
      customerId: z.string().uuid().describe("The unique customer ID"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/customers/${params.customerId}/storage-accounts`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_customer_service_tickets ----------
  server.tool(
    "get_customer_service_tickets",
    "List service tickets for a specific customer. Premium tier endpoint. Returns any open or resolved service tickets (claims, complaints, etc.) for the customer.",
    {
      customerId: z.string().uuid().describe("The unique customer ID"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/premium/customers/${params.customerId}/service-tickets`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );
}
