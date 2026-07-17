import { z } from "zod";
import { runFollowupGapAudit } from "../workflows/followup-gap-audit.js";
export function registerReportTools(server, client) {
    server.tool("audit_followup_gaps", "A read-only batch audit for SmartMoving job numbers or quote numbers. Normalizes job numbers such as 90001-1 to quote 90001, resolves each opportunity, checks its follow-ups, and separates missing active assigned follow-ups from invalid input, not-found records, and API errors. Use this instead of calling opportunity and follow-up tools hundreds of times.", {
        jobNumbers: z.array(z.string().min(1).max(100)).min(1).max(1000).describe("SmartMoving job or quote numbers. Maximum 1000 input rows."),
        concurrency: z.number().int().min(1).max(10).optional().default(4).describe("Maximum simultaneous quote audits."),
    }, async (params) => {
        try {
            const result = await runFollowupGapAudit(client, { jobNumbers: params.jobNumbers, concurrency: params.concurrency });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "The follow-up gap audit failed.";
            return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
        }
    });
}
//# sourceMappingURL=reports.js.map