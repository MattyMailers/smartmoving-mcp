export type NormalizedJobOrQuoteNumber = {
    input: string;
    quoteNumber: string;
} | {
    input: string;
    error: string;
};
export declare function normalizeJobOrQuoteNumber(value: string): NormalizedJobOrQuoteNumber;
export type FollowupClassification = "no_followups" | "completed_only" | "open_unassigned" | "ok";
export interface FollowupClassificationResult {
    classification: FollowupClassification;
    total: number;
    open: number;
    openAssigned: number;
    openUnassigned: number;
}
export declare function classifyFollowups(value: unknown): FollowupClassificationResult;
export type FollowupGapClassification = FollowupClassification | "invalid_input" | "not_found" | "api_error";
export interface FollowupGapRow {
    input: string;
    quoteNumber?: string;
    opportunityId?: string;
    opportunityStatus?: string | number | null;
    serviceDate?: string | number | null;
    classification: FollowupGapClassification;
    followups?: Omit<FollowupClassificationResult, "classification">;
    error?: {
        code: string;
        message: string;
    };
}
export interface FollowupGapAuditReport {
    readOnly: true;
    definition: "An opportunity is missing an active assigned follow-up when it has no follow-ups, only completed follow-ups, or open follow-ups with no assignedToId.";
    summary: {
        inputRows: number;
        uniqueQuotes: number;
        ok: number;
        missingActiveFollowup: number;
        gapRows: number;
        invalidInput: number;
        notFound: number;
        apiErrors: number;
    };
    rows: FollowupGapRow[];
    gaps: FollowupGapRow[];
}
export interface FollowupGapAuditClient {
    get(path: string): Promise<unknown>;
}
export interface FollowupGapAuditOptions {
    jobNumbers: string[];
    concurrency?: number;
    retryDelayMs?: number;
}
export declare function runFollowupGapAudit(client: FollowupGapAuditClient, options: FollowupGapAuditOptions): Promise<FollowupGapAuditReport>;
//# sourceMappingURL=followup-gap-audit.d.ts.map