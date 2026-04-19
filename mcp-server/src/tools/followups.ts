// ============================================================================
// Follow-Up Tools
// ============================================================================

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartMovingClient } from "../client.js";

export function registerFollowUpTools(server: McpServer, client: SmartMovingClient): void {
  // ---------- list_followups ----------
  server.tool(
    "list_followups",
    "List all follow-ups for an opportunity. Premium tier endpoint. Follow-ups are scheduled tasks like callbacks, emails to send, or in-home estimates. Returns both pending and completed follow-ups.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/premium/opportunities/${params.opportunityId}/followups`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_followup ----------
  server.tool(
    "get_followup",
    "Get details of a specific follow-up. Premium tier endpoint. Returns full information including type, due date, assigned user, completion status, and notes.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      followupId: z.string().uuid().describe("The follow-up ID"),
    },
    async (params) => {
      try {
        const result = await client.get(
          `/api/premium/opportunities/${params.opportunityId}/followups/${params.followupId}`,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- create_followup ----------
  server.tool(
    "create_followup",
    "Create a new follow-up task on an opportunity. Premium tier endpoint. Use this to schedule a callback, email, text, or in-home estimate. Types: 0=Email, 1=Call, 2=Text, 3=Other, 4=CMET (Customer Move Estimate/Tour).",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      followUpType: z.number().int().min(0).max(4).describe("Follow-up type: 0=Email, 1=Call, 2=Text, 3=Other, 4=CMET"),
      dueDate: z.string().describe("When the follow-up is due (ISO 8601 datetime, e.g. '2024-06-15T10:00:00')"),
      notes: z.string().optional().describe("Notes about what to discuss or do"),
      assignedToId: z.string().uuid().optional().describe("User ID to assign the follow-up to (use get_users for IDs)"),
    },
    async (params) => {
      try {
        const { opportunityId, ...body } = params;
        const result = await client.post(
          `/api/premium/opportunities/${opportunityId}/followups`,
          body,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- update_followup ----------
  server.tool(
    "update_followup",
    "Update an existing follow-up. Premium tier endpoint. Use this to reschedule, reassign, change type, or update notes on a follow-up task.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      followupId: z.string().uuid().describe("The follow-up ID to update"),
      followUpType: z.number().int().min(0).max(4).optional().describe("Updated type: 0=Email, 1=Call, 2=Text, 3=Other, 4=CMET"),
      dueDate: z.string().optional().describe("Updated due date (ISO 8601 datetime)"),
      notes: z.string().optional().describe("Updated notes"),
      assignedToId: z.string().uuid().optional().describe("Updated assignee user ID"),
    },
    async (params) => {
      try {
        const { opportunityId, followupId, ...body } = params;
        const result = await client.put(
          `/api/premium/opportunities/${opportunityId}/followups/${followupId}`,
          body,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- delete_followup ----------
  server.tool(
    "delete_followup",
    "Delete a follow-up from an opportunity. Premium tier endpoint. Permanently removes the follow-up task. Use complete_followup instead if the task was actually performed.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      followupId: z.string().uuid().describe("The follow-up ID to delete"),
    },
    async (params) => {
      try {
        const result = await client.delete(
          `/api/premium/opportunities/${params.opportunityId}/followups/${params.followupId}`,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- complete_followup ----------
  server.tool(
    "complete_followup",
    "Mark a follow-up as complete. Premium tier endpoint. Use this when the scheduled callback, email, or task has been performed. The follow-up remains in the history but is flagged as completed.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      followupId: z.string().uuid().describe("The follow-up ID to mark as complete"),
    },
    async (params) => {
      try {
        const result = await client.post(
          `/api/premium/opportunities/${params.opportunityId}/followups/${params.followupId}/mark-complete`,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );
}
