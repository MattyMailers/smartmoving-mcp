// ============================================================================
// Job Tools
// ============================================================================

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartMovingClient } from "../client.js";

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

const jobStopSchema = z.object({
  stopType: z.number().int().min(0).max(1).describe("0=PickUp, 1=DropOff"),
  address: addressSchema.describe("Address for this stop"),
  sortOrder: z.number().int().optional().describe("Order of the stop (0-based)"),
});

export function registerJobTools(server: McpServer, client: SmartMovingClient): void {
  // ---------- get_jobs_by_opportunity ----------
  server.tool(
    "get_jobs_by_opportunity",
    "List all jobs for an opportunity. A job represents a specific service event (moving day, packing day, etc.) within an opportunity. An opportunity can have multiple jobs (e.g. separate packing and moving days).",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/opportunities/${params.opportunityId}/jobs`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- get_job ----------
  server.tool(
    "get_job",
    "Get detailed information about a specific job within an opportunity. Premium tier endpoint. Can include estimated/actual charges, estimated/actual materials, and stops. Use IncludeActualMaterials=true to pull supplies sold/used on completed jobs.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      jobId: z.string().uuid().describe("The job ID"),
      includeEstimatedCharges: z.boolean().optional().default(false).describe("Include estimated charge lines"),
      includeActualCharges: z.boolean().optional().default(false).describe("Include actual charge lines"),
      includeEstimatedMaterials: z.boolean().optional().default(false).describe("Include estimated materials/supplies"),
      includeActualMaterials: z.boolean().optional().default(false).describe("Include actual materials/supplies sold or used"),
      includeStops: z.boolean().optional().default(false).describe("Include pickup/dropoff stops"),
      includeDispatchInfo: z.boolean().optional().default(false).describe("Include dispatch/crew info"),
      includeCharges: z.boolean().optional().default(false).describe("Official SmartMoving catch-all IncludeCharges flag"),
      includeNotes: z.boolean().optional().default(false).describe("Include crew/customer/internal/accounting/dispatcher notes"),
    },
    async (params) => {
      try {
        const result = await client.get(`/api/premium/opportunities/${params.opportunityId}/jobs/${params.jobId}`, {
          IncludeEstimatedCharges: params.includeEstimatedCharges,
          IncludeActualCharges: params.includeActualCharges,
          IncludeEstimatedMaterials: params.includeEstimatedMaterials,
          IncludeActualMaterials: params.includeActualMaterials,
          IncludeStops: params.includeStops,
          IncludeDispatchInfo: params.includeDispatchInfo,
          IncludeCharges: params.includeCharges,
          IncludeNotes: params.includeNotes,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- create_job ----------
  server.tool(
    "create_job",
    "Add a new job to an opportunity. Premium tier endpoint. Use this to schedule a moving day, packing day, or other service. Job types: 1=Moving, 3=Packing, 4=MovingAndPacking, 5=LoadOnly, 6=UnloadOnly, 7=Commercial, 8=StorageInBound, 9=StorageOutBound, 10=InnerHouse, 11=JunkRemoval, 12=LaborOnly.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID to add the job to"),
      jobType: z.number().int().describe("Job type: 1=Moving, 3=Packing, 4=MovingAndPacking, 5=LoadOnly, 6=UnloadOnly, 7=Commercial, 8=StorageInBound, 9=StorageOutBound, 10=InnerHouse, 11=JunkRemoval, 12=LaborOnly"),
      jobDate: z.string().optional().describe("Job date (ISO 8601, e.g. 2024-06-15)"),
      startTime: z.string().optional().describe("Start time (e.g. '08:00:00' or '08:00 AM')"),
      crewSize: z.number().int().optional().describe("Number of crew members"),
      truckCount: z.number().int().optional().describe("Number of trucks"),
      estimatedHours: z.number().optional().describe("Estimated hours for the job"),
      notes: z.string().optional().describe("Job-specific notes"),
      stops: z.array(jobStopSchema).optional().describe("Array of pickup/dropoff stops with addresses"),
    },
    async (params) => {
      try {
        const { opportunityId, ...body } = params;
        const result = await client.post(`/api/premium/opportunities/${opportunityId}/jobs`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- delete_job ----------
  server.tool(
    "delete_job",
    "Delete a job from an opportunity. Premium tier endpoint. This permanently removes the job and its associated stops, materials, and crew assignments. Use with caution.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      jobId: z.string().uuid().describe("The job ID to delete"),
    },
    async (params) => {
      try {
        const result = await client.delete(`/api/premium/opportunities/${params.opportunityId}/jobs/${params.jobId}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- confirm_job ----------
  server.tool(
    "confirm_job",
    "Confirm a job on an opportunity. Premium tier endpoint. Marks the job as confirmed, indicating the customer has agreed to the scheduled date and services.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      jobId: z.string().uuid().describe("The job ID to confirm"),
    },
    async (params) => {
      try {
        const result = await client.post(`/api/premium/opportunities/${params.opportunityId}/jobs/${params.jobId}/confirm`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- update_job_notes ----------
  server.tool(
    "update_job_notes",
    "Update one or more note fields on a specific job. Premium tier endpoint. SmartMoving PATCH updates the provided note properties only, but each provided field value replaces that field. To add text below existing notes, use append_job_note instead.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      jobId: z.string().uuid().describe("The job ID"),
      crewNotes: z.string().optional().describe("Crew notes. Replaces the existing crewNotes field if provided."),
      customerNotes: z.string().optional().describe("Customer notes. Replaces the existing customerNotes field if provided."),
      internalNotes: z.string().optional().describe("Internal notes. Replaces the existing internalNotes field if provided."),
      accountingNotes: z.string().optional().describe("Accounting notes. Replaces the existing accountingNotes field if provided."),
      dispatcherNotes: z.string().optional().describe("Dispatcher notes. Replaces the existing dispatcherNotes field if provided."),
    },
    async (params) => {
      try {
        const { opportunityId, jobId, ...body } = params;
        const result = await client.patch(
          `/api/premium/opportunities/${opportunityId}/jobs/${jobId}/notes`,
          body,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- append_job_note ----------
  server.tool(
    "append_job_note",
    "Append text below an existing job note field without erasing the prior content. This reads the current notes, adds a blank line plus the new text, then PATCHes only the selected note field. Fails if the job is closed or SmartMoving rejects note updates.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      jobId: z.string().uuid().describe("The job ID"),
      field: z.enum(["crewNotes", "customerNotes", "internalNotes", "accountingNotes", "dispatcherNotes"]).describe("Which note field to append to"),
      text: z.string().min(1).describe("Text to append below the existing note"),
    },
    async (params) => {
      try {
        const job = await client.get<Record<string, unknown>>(
          `/api/premium/opportunities/${params.opportunityId}/jobs/${params.jobId}`,
          { IncludeNotes: true },
        );
        const notes = (job.notes ?? {}) as Record<string, unknown>;
        const existing = typeof notes[params.field] === "string" ? notes[params.field] as string : "";
        const nextValue = existing.trim().length > 0 ? `${existing}\n\n${params.text}` : params.text;
        const result = await client.patch(
          `/api/premium/opportunities/${params.opportunityId}/jobs/${params.jobId}/notes`,
          { [params.field]: nextValue },
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- update_job_stops ----------
  server.tool(
    "update_job_stops",
    "Replace all stops on a job. Premium tier endpoint. This is a PUT operation that replaces the entire list of stops. Each stop has a type (PickUp=0 or DropOff=1) and an address. Use sortOrder to control the route sequence.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      jobId: z.string().uuid().describe("The job ID"),
      stops: z.array(jobStopSchema).min(1).describe("Complete list of stops (replaces all existing stops)"),
    },
    async (params) => {
      try {
        const result = await client.put(
          `/api/premium/opportunities/${params.opportunityId}/jobs/${params.jobId}/stops`,
          { stops: params.stops },
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );

  // ---------- add_job_materials ----------
  server.tool(
    "add_job_materials",
    "Add estimated materials to a job. Premium tier endpoint. Materials are items like boxes, tape, wrapping paper, etc. that will be used during the job. Use get_tariff_materials to find valid material IDs for the opportunity's tariff.",
    {
      opportunityId: z.string().uuid().describe("The opportunity ID"),
      jobId: z.string().uuid().describe("The job ID"),
      materials: z.array(z.object({
        materialId: z.string().uuid().describe("Material ID from the tariff (use get_tariff_materials)"),
        quantity: z.number().int().min(1).describe("Quantity of this material"),
      })).min(1).describe("Array of materials to add"),
    },
    async (params) => {
      try {
        const result = await client.post(
          `/api/premium/opportunities/${params.opportunityId}/Estimated/jobs/${params.jobId}/materials`,
          { materials: params.materials },
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${(error as Error).message ?? JSON.stringify(error)}` }], isError: true };
      }
    },
  );
}
