export type NormalizedJobOrQuoteNumber =
  | { input: string; quoteNumber: string }
  | { input: string; error: string };

export function normalizeJobOrQuoteNumber(value: string): NormalizedJobOrQuoteNumber {
  const input = value.trim();
  if (!input) return { input, error: "Job or quote number is blank." };
  if (input.length > 100) return { input, error: "Job or quote number must not exceed 100 characters." };

  const candidate = input.replace(/^(?:job(?:\s+number)?|quote)\s*#?\s*/i, "").trim();
  const qPrefixed = /^Q-\d+(?:-\d+)*$/i.exec(candidate);
  if (qPrefixed) return { input, quoteNumber: candidate.toUpperCase() };

  const numeric = /^(\d+)(?:-\d+)?$/.exec(candidate);
  if (!numeric) return { input, error: "Unrecognized SmartMoving job or quote number." };
  return { input, quoteNumber: numeric[1] };
}

export type FollowupClassification = "no_followups" | "completed_only" | "open_unassigned" | "ok";
export interface FollowupClassificationResult {
  classification: FollowupClassification;
  total: number;
  open: number;
  openAssigned: number;
  openUnassigned: number;
}

function followupList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && Array.isArray((value as Record<string, unknown>).items)) {
    return (value as Record<string, unknown>).items as unknown[];
  }
  throw new Error("Unexpected follow-up response shape.");
}

function completedFollowup(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.completed === true || record.isCompleted === true || record.isComplete === true || Boolean(record.completedAtUtc) || Boolean(record.completedDate);
}

function assignedFollowup(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const assignedToId = (value as Record<string, unknown>).assignedToId;
  return typeof assignedToId === "string" && assignedToId.trim().length > 0;
}

export function classifyFollowups(value: unknown): FollowupClassificationResult {
  const list = followupList(value);
  const openFollowups = list.filter((followup) => !completedFollowup(followup));
  const openAssigned = openFollowups.filter(assignedFollowup).length;
  const openUnassigned = openFollowups.length - openAssigned;
  const classification: FollowupClassification = list.length === 0
    ? "no_followups"
    : openFollowups.length === 0
      ? "completed_only"
      : openAssigned === 0
        ? "open_unassigned"
        : "ok";
  return { classification, total: list.length, open: openFollowups.length, openAssigned, openUnassigned };
}

export type FollowupGapClassification = FollowupClassification | "invalid_input" | "not_found" | "api_error";
export interface FollowupGapRow {
  input: string;
  quoteNumber?: string;
  opportunityId?: string;
  opportunityStatus?: string | number | null;
  serviceDate?: string | number | null;
  classification: FollowupGapClassification;
  followups?: Omit<FollowupClassificationResult, "classification">;
  error?: { code: string; message: string };
}
export interface FollowupGapAuditReport {
  readOnly: true;
  definition: "An opportunity is missing an active assigned follow-up when it has no follow-ups, only completed follow-ups, or open follow-ups with no assignedToId.";
  summary: { inputRows: number; uniqueQuotes: number; ok: number; missingActiveFollowup: number; gapRows: number; invalidInput: number; notFound: number; apiErrors: number };
  rows: FollowupGapRow[];
  gaps: FollowupGapRow[];
}
export interface FollowupGapAuditClient { get(path: string): Promise<unknown>; }
export interface FollowupGapAuditOptions { jobNumbers: string[]; concurrency?: number; retryDelayMs?: number; }

function responseRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  for (const key of ["data", "result", "opportunity"]) {
    const nested = record[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) return nested as Record<string, unknown>;
  }
  return record;
}

function statusCodeOf(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const statusCode = (error as Record<string, unknown>).statusCode;
  return typeof statusCode === "number" ? statusCode : null;
}

function isOpportunityNotFound(error: unknown): boolean {
  const statusCode = statusCodeOf(error);
  if (statusCode === 404) return true;
  if (statusCode !== 400 || !error || typeof error !== "object") return false;
  const message = (error as Record<string, unknown>).message;
  return typeof message === "string" && /(?:specified\s+)?opportunity\s+was\s+not\s+found/i.test(message);
}

function delay(milliseconds: number): Promise<void> {
  return milliseconds > 0 ? new Promise((resolve) => setTimeout(resolve, milliseconds)) : Promise.resolve();
}

async function getWithRetry(client: FollowupGapAuditClient, path: string, retryDelayMs: number): Promise<unknown> {
  const maximumAttempts = 3;
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      return await client.get(path);
    } catch (error) {
      const statusCode = statusCodeOf(error);
      const transient = statusCode === 429 || (statusCode !== null && statusCode >= 500 && statusCode <= 599);
      if (!transient || attempt === maximumAttempts) throw error;
      await delay(retryDelayMs * 2 ** (attempt - 1));
    }
  }
  throw new Error("Unreachable retry state.");
}

async function mapWithConcurrency<T, R>(values: T[], concurrency: number, worker: (value: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= values.length) return;
      results[index] = await worker(values[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function auditQuote(client: FollowupGapAuditClient, quoteNumber: string, retryDelayMs: number): Promise<Omit<FollowupGapRow, "input">> {
  let opportunityRecord: Record<string, unknown>;
  let opportunityId: string;
  try {
    const opportunityResponse = await getWithRetry(client, `/api/opportunities/quote/${encodeURIComponent(quoteNumber)}`, retryDelayMs);
    opportunityRecord = responseRecord(opportunityResponse) ?? {};
    const id = opportunityRecord.id;
    if (typeof id !== "string" || !id.trim()) {
      return { quoteNumber, classification: "api_error", error: { code: "INVALID_OPPORTUNITY_RESPONSE", message: `SmartMoving returned no opportunity ID for quote ${quoteNumber}.` } };
    }
    opportunityId = id;
  } catch (error) {
    if (isOpportunityNotFound(error)) {
      return { quoteNumber, classification: "not_found", error: { code: "NOT_FOUND", message: `No SmartMoving opportunity was found for quote ${quoteNumber}.` } };
    }
    return { quoteNumber, classification: "api_error", error: { code: "API_ERROR", message: `SmartMoving could not audit quote ${quoteNumber}.` } };
  }

  try {
    const followupResponse = await getWithRetry(client, `/api/premium/opportunities/${encodeURIComponent(opportunityId)}/followups`, retryDelayMs);
    const followupResult = classifyFollowups(followupResponse);
    const { classification, ...followups } = followupResult;
    return {
      quoteNumber,
      opportunityId,
      opportunityStatus: typeof opportunityRecord.status === "string" || typeof opportunityRecord.status === "number" || opportunityRecord.status === null ? opportunityRecord.status : undefined,
      serviceDate: typeof opportunityRecord.serviceDate === "string" || typeof opportunityRecord.serviceDate === "number" || opportunityRecord.serviceDate === null ? opportunityRecord.serviceDate : undefined,
      classification,
      followups,
    };
  } catch {
    return { quoteNumber, opportunityId, classification: "api_error", error: { code: "API_ERROR", message: `SmartMoving could not audit follow-ups for quote ${quoteNumber}.` } };
  }
}

export async function runFollowupGapAudit(client: FollowupGapAuditClient, options: FollowupGapAuditOptions): Promise<FollowupGapAuditReport> {
  if (!Array.isArray(options.jobNumbers) || options.jobNumbers.length === 0) throw new Error("At least one job or quote number is required.");
  if (options.jobNumbers.length > 1000) throw new Error("A maximum of 1000 job or quote numbers can be audited at once.");
  const concurrency = options.concurrency ?? 4;
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 10) throw new Error("Concurrency must be an integer from 1 to 10.");
  const retryDelayMs = options.retryDelayMs ?? 250;
  if (!Number.isFinite(retryDelayMs) || retryDelayMs < 0 || retryDelayMs > 60_000) throw new Error("Retry delay must be between 0 and 60000 milliseconds.");

  const normalized = options.jobNumbers.map(normalizeJobOrQuoteNumber);
  const uniqueQuotes = [...new Set(normalized.flatMap((item) => "quoteNumber" in item ? [item.quoteNumber] : []))];
  const quoteResults = await mapWithConcurrency(uniqueQuotes, concurrency, (quoteNumber) => auditQuote(client, quoteNumber, retryDelayMs));
  const byQuote = new Map(quoteResults.map((row) => [row.quoteNumber as string, row]));
  const rows: FollowupGapRow[] = normalized.map((item) => "error" in item
    ? { input: item.input, classification: "invalid_input", error: { code: "INVALID_INPUT", message: item.error } }
    : { input: item.input, ...byQuote.get(item.quoteNumber)! });
  const missingClassifications = new Set<FollowupGapClassification>(["no_followups", "completed_only", "open_unassigned"]);
  const gaps = rows.filter((row) => missingClassifications.has(row.classification));
  const uniqueGapQuotes = new Set(gaps.flatMap((row) => row.quoteNumber ? [row.quoteNumber] : []));

  return {
    readOnly: true,
    definition: "An opportunity is missing an active assigned follow-up when it has no follow-ups, only completed follow-ups, or open follow-ups with no assignedToId.",
    summary: {
      inputRows: rows.length,
      uniqueQuotes: uniqueQuotes.length,
      ok: rows.filter((row) => row.classification === "ok").length,
      missingActiveFollowup: uniqueGapQuotes.size,
      gapRows: gaps.length,
      invalidInput: rows.filter((row) => row.classification === "invalid_input").length,
      notFound: rows.filter((row) => row.classification === "not_found").length,
      apiErrors: rows.filter((row) => row.classification === "api_error").length,
    },
    rows,
    gaps,
  };
}
