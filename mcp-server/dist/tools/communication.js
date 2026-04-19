// ============================================================================
// Communication Tools (Call & Note Logging)
// ============================================================================
import { z } from "zod";
export function registerCommunicationTools(server, client) {
    // ---------- log_call ----------
    server.tool("log_call", "Log a phone call on an opportunity. Premium tier endpoint. Records an inbound or outbound call with its outcome. Use this to track all phone interactions with the customer. Call types: 0=Outbound, 1=Inbound. Outcomes: 0=NoAnswer, 1=Busy, 2=WrongNumber, 3=LeftLiveMessage, 4=LeftVoicemail, 5=Connected, 6=NumberDisconnected.", {
        opportunityId: z.string().uuid().describe("The opportunity ID"),
        callType: z.number().int().min(0).max(1).describe("Call direction: 0=Outbound, 1=Inbound"),
        callOutcome: z.number().int().min(0).max(6).describe("Call result: 0=NoAnswer, 1=Busy, 2=WrongNumber, 3=LeftLiveMessage, 4=LeftVoicemail, 5=Connected, 6=NumberDisconnected"),
        notes: z.string().optional().describe("Notes about what was discussed or attempted"),
        durationSeconds: z.number().int().optional().describe("Call duration in seconds"),
        calledNumber: z.string().optional().describe("Phone number that was called or received the call"),
    }, async (params) => {
        try {
            const { opportunityId, ...body } = params;
            const result = await client.post(`/api/premium/opportunities/${opportunityId}/communication/calls`, body);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
    // ---------- log_note ----------
    server.tool("log_note", "Log a note on an opportunity. Premium tier endpoint. Use this to record any interaction, observation, or update that isn't a phone call. Notes appear in the opportunity's activity timeline.", {
        opportunityId: z.string().uuid().describe("The opportunity ID"),
        notes: z.string().describe("The note content to log"),
    }, async (params) => {
        try {
            const result = await client.post(`/api/premium/opportunities/${params.opportunityId}/communication/notes`, { notes: params.notes });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error: ${error.message ?? JSON.stringify(error)}` }], isError: true };
        }
    });
}
//# sourceMappingURL=communication.js.map