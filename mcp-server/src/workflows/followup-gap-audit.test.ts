import { describe, expect, it } from "vitest";
import { classifyFollowups, normalizeJobOrQuoteNumber, runFollowupGapAudit } from "./followup-gap-audit.js";

describe("normalizeJobOrQuoteNumber", () => {
  it("converts SmartMoving job numbers to quote numbers", () => {
    expect(normalizeJobOrQuoteNumber("90001-1")).toEqual({ input: "90001-1", quoteNumber: "90001" });
    expect(normalizeJobOrQuoteNumber(" quote # Q-2024-00123 ")).toEqual({ input: "quote # Q-2024-00123", quoteNumber: "Q-2024-00123" });
    expect(normalizeJobOrQuoteNumber("Q-12345-2")).toEqual({ input: "Q-12345-2", quoteNumber: "Q-12345-2" });
    expect(normalizeJobOrQuoteNumber("Job Number 90002")).toEqual({ input: "Job Number 90002", quoteNumber: "90002" });
  });

  it("rejects blank or ambiguous values instead of guessing", () => {
    expect(normalizeJobOrQuoteNumber("  ")).toEqual({ input: "", error: "Job or quote number is blank." });
    expect(normalizeJobOrQuoteNumber("customer abc")).toEqual({ input: "customer abc", error: "Unrecognized SmartMoving job or quote number." });
    const tooLong = "1".repeat(101);
    expect(normalizeJobOrQuoteNumber(tooLong)).toEqual({ input: tooLong, error: "Job or quote number must not exceed 100 characters." });
  });
});

describe("classifyFollowups", () => {
  it("separates missing, completed-only, unassigned, and assigned follow-up states", () => {
    expect(classifyFollowups([])).toEqual({ classification: "no_followups", total: 0, open: 0, openAssigned: 0, openUnassigned: 0 });
    expect(classifyFollowups([{ isComplete: true, completedDate: "2026-07-01T12:00:00Z", assignedToId: "user-1" }])).toEqual({ classification: "completed_only", total: 1, open: 0, openAssigned: 0, openUnassigned: 0 });
    expect(classifyFollowups([{ completed: false, assignedToId: null }])).toEqual({ classification: "open_unassigned", total: 1, open: 1, openAssigned: 0, openUnassigned: 1 });
    expect(classifyFollowups([{ completed: false, assignedToId: "user-1" }, { completedAtUtc: "2026-07-01T12:00:00Z", assignedToId: "user-1" }])).toEqual({ classification: "ok", total: 2, open: 1, openAssigned: 1, openUnassigned: 0 });
  });

  it("accepts the supported items wrapper and refuses unknown shapes", () => {
    expect(classifyFollowups({ items: [] }).classification).toBe("no_followups");
    expect(() => classifyFollowups({ message: "unexpected" })).toThrow("Unexpected follow-up response shape");
  });
});

describe("runFollowupGapAudit", () => {
  it("audits unique quotes once while preserving input order and duplicate job rows", async () => {
    const calls: string[] = [];
    const client = {
      async get(path: string): Promise<unknown> {
        calls.push(path);
        if (path === "/api/opportunities/quote/90001") return { id: "opp-90001", quoteNumber: "90001", status: 10, serviceDate: 20260701 };
        if (path === "/api/premium/opportunities/opp-90001/followups") return [{ completed: true, assignedToId: "user-1" }];
        if (path === "/api/opportunities/quote/90002") return { id: "opp-90002", quoteNumber: "90002", status: 4, serviceDate: "2026-08-01" };
        if (path === "/api/premium/opportunities/opp-90002/followups") return [{ completed: false, assignedToId: "user-2" }];
        if (path === "/api/opportunities/quote/90099") throw { statusCode: 400, message: "SmartMoving API error: The specified opportunity was not found. customer-specific response must not leak" };
        throw new Error(`Unexpected path ${path}`);
      },
    };

    const report = await runFollowupGapAudit(client, { jobNumbers: ["90001-1", "90001-2", "90002-1", "customer abc", "90099-1"], concurrency: 2, retryDelayMs: 0 });

    expect(report.summary).toEqual({ inputRows: 5, uniqueQuotes: 3, ok: 1, missingActiveFollowup: 1, gapRows: 2, invalidInput: 1, notFound: 1, apiErrors: 0 });
    expect(report.rows.map((row) => ({ input: row.input, quoteNumber: row.quoteNumber, classification: row.classification }))).toEqual([
      { input: "90001-1", quoteNumber: "90001", classification: "completed_only" },
      { input: "90001-2", quoteNumber: "90001", classification: "completed_only" },
      { input: "90002-1", quoteNumber: "90002", classification: "ok" },
      { input: "customer abc", quoteNumber: undefined, classification: "invalid_input" },
      { input: "90099-1", quoteNumber: "90099", classification: "not_found" },
    ]);
    expect(report.gaps.map((row) => row.input)).toEqual(["90001-1", "90001-2"]);
    expect(report.rows[0].serviceDate).toBe(20260701);
    expect(report.rows[4].error).toEqual({ code: "NOT_FOUND", message: "No SmartMoving opportunity was found for quote 90099." });
    expect(JSON.stringify(report)).not.toContain("customer-specific response");
    expect(calls.filter((path) => path === "/api/opportunities/quote/90001")).toHaveLength(1);
    expect(calls).toHaveLength(5);
  });

  it("also classifies normal 404 responses as not found", async () => {
    const report = await runFollowupGapAudit({ get: async () => { throw { statusCode: 404, message: "not found" }; } }, { jobNumbers: ["12345-1"], retryDelayMs: 0 });
    expect(report.rows[0].classification).toBe("not_found");
  });

  it("does not misclassify unrelated HTTP 400 failures as not found", async () => {
    const report = await runFollowupGapAudit({ get: async () => { throw { statusCode: 400, message: "Invalid branch configuration" }; } }, { jobNumbers: ["12345-1"], retryDelayMs: 0 });
    expect(report.rows[0]).toMatchObject({ classification: "api_error", error: { code: "API_ERROR" } });
  });

  it("does not misclassify follow-up endpoint failures as a missing opportunity", async () => {
    const client = {
      async get(path: string): Promise<unknown> {
        if (path === "/api/opportunities/quote/12345") return { id: "opp-12345" };
        throw { statusCode: 404, message: "follow-up endpoint unavailable" };
      },
    };
    const report = await runFollowupGapAudit(client, { jobNumbers: ["12345-1"], retryDelayMs: 0 });
    expect(report.rows[0]).toMatchObject({ classification: "api_error", error: { code: "API_ERROR" } });
    expect(report.summary).toMatchObject({ notFound: 0, apiErrors: 1 });
  });

  it("retries 429 and 5xx failures, but not permanent failures", async () => {
    let attempts = 0;
    const client = {
      async get(path: string): Promise<unknown> {
        if (path === "/api/opportunities/quote/12345") {
          attempts += 1;
          if (attempts === 1) throw { statusCode: 429, message: "rate limited" };
          if (attempts === 2) throw { statusCode: 503, message: "unavailable" };
          return { id: "opp-12345" };
        }
        return [];
      },
    };
    const report = await runFollowupGapAudit(client, { jobNumbers: ["12345-1"], concurrency: 1, retryDelayMs: 0 });
    expect(attempts).toBe(3);
    expect(report.rows[0].classification).toBe("no_followups");
  });

  it("validates batch, concurrency, and retry limits before calling SmartMoving", async () => {
    const client = { get: async () => ({}) };
    await expect(runFollowupGapAudit(client, { jobNumbers: [] })).rejects.toThrow("At least one");
    await expect(runFollowupGapAudit(client, { jobNumbers: Array.from({ length: 1001 }, () => "12345-1") })).rejects.toThrow("maximum of 1000");
    await expect(runFollowupGapAudit(client, { jobNumbers: ["12345-1"], concurrency: 11 })).rejects.toThrow("1 to 10");
    await expect(runFollowupGapAudit(client, { jobNumbers: ["12345-1"], retryDelayMs: -1 })).rejects.toThrow("Retry delay");
  });
});
