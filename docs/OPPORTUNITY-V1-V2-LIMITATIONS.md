# SmartMoving Opportunity 1.0 vs 2.0 Limitations

[Back to Overview](./README.md)

This note captures live iHaul iMove testing against SmartMoving's public `v1` External API. SmartMoving does not expose a separate public `v2` API in the developer portal, but the UI appears to have at least two opportunity/job data models. Internally we call these "1.0" and "2.0" opportunities for practical debugging.

## Tested records

### Working / 1.0-style opportunity

- Quote/job: `10356-2`
- Opportunity type: `1`
- Job type: `1`
- Result: Premium job detail returned labor charges, a summarized Materials actual charge, and item-level `actualMaterials` after materials were added.

Observed item lines:

- `Mattress Bag - King`, quantity `3`, rate `$15.50`
- `Dish Pack`, quantity `2`, rate `$13.50`

### Limited / 2.0-style opportunity

- Quote/job: `10701-3`
- Opportunity type: `4`
- Job type: `4`
- Result: Premium job detail returned stops, dates, completion/closed timestamps, and notes, but returned empty charge/material arrays even though audit activity showed material updates in the UI/accounting workflow.

## What is exposed reliably

For both styles, these surfaces are useful:

- `GET /api/opportunities/quote/{quoteNumber}`: quote lookup and opportunity ID discovery.
- `GET /api/opportunities/{opportunityId}` with include flags: customer, branch, jobs, payments, documents metadata, trip info, tasks/surveys if present.
- `GET /api/opportunities/{opportunityId}/jobs`: authoritative job list with completed/closed timestamps.
- `GET /api/payments/opportunities/{opportunityId}`: payments by opportunity/job.
- `GET /api/opportunities/{opportunityId}/audit-activity`: audit timeline.
- `GET /api/premium/opportunities/{opportunityId}/documents`: document metadata. Live tests often returned document titles with `url: null`, so do not assume document download is available.
- `GET /api/premium/opportunities/{opportunityId}/inventory`: opportunity inventory shell, rooms, boxes when populated.
- `GET /api/premium/opportunities/{opportunityId}/followups`: follow-up records.
- `POST /api/premium/opportunities/{opportunityId}/communication/notes`: opportunity-level note logging.

## What differs by opportunity/job model

### 1.0-style jobs

`GET /api/premium/opportunities/{opportunityId}/jobs/{jobId}` can expose:

- `estimatedCharges`
- `actualCharges`
- `estimatedMaterials`
- `actualMaterials`
- `stops`
- `notes`

Use these flags when reconciling supplies:

```text
IncludeEstimatedCharges=true
IncludeActualCharges=true
IncludeEstimatedMaterials=true
IncludeActualMaterials=true
IncludeStops=true
IncludeNotes=true
IncludeDispatchInfo=true
IncludeCharges=true
```

When `actualMaterials` exists, it is the best available API source for sold/used supplies.

### 2.0-style jobs

The same Premium job endpoint may return:

- `stops`: populated
- `notes`: populated/readable
- `completedAtUtc` / `closedAtUtc`: populated
- `estimatedCharges`: `[]`
- `actualCharges`: `[]`
- `estimatedMaterials`: `[]`
- `actualMaterials`: `[]`

Do not interpret empty material arrays as proof that no materials were sold. For `10701`, audit activity showed material updates such as:

```text
Materials updated on Moving And Packing job. Old total: $0.00, new total: $510.50.
Materials updated on Moving And Packing job. Old total: $510.50, new total: $645.50.
Materials updated on Load Only job. Old total: $645.50, new total: $793.00.
Materials updated on Load Only job. Old total: $793.00, new total: $508.00.
```

This recovers material total movement, date, user ID, and job type from the audit description, but not item-level names or quantities.

## Notes behavior

### Job notes

Endpoint:

```text
PATCH /api/premium/opportunities/{opportunityId}/jobs/{jobId}/notes
```

Request fields:

- `crewNotes`
- `customerNotes`
- `internalNotes`
- `accountingNotes`
- `dispatcherNotes`

Important behavior:

- Provided fields replace the entire existing field value.
- To append, first read current notes with `IncludeNotes=true`, then send the old value plus `\n\n` plus new text.
- Closed jobs reject writes with:

```json
{"message":"Job is closed and cannot be updated."}
```

- Live testing showed a split-brain state after reopening `10701-3`: `GET /api/opportunities/{opportunityId}` embedded jobs showed `closedAtUtc: null`, but `GET /api/opportunities/{opportunityId}/jobs` and Premium job detail still showed the job as closed. The notes PATCH still rejected the write. Trust Premium job detail / jobs endpoint for write eligibility.

### Opportunity communication notes

Endpoint:

```text
POST /api/premium/opportunities/{opportunityId}/communication/notes
```

Works with:

```json
{"notes":"text to log"}
```

Returns:

```json
{"noteId":"..."}
```

Do not send a human-readable `createdBy` string. If provided, `createdBy` must be a GUID. Omitting it works with the API key's default context.

## Recommended MCP usage for supply/revenue reconciliation

1. Start from quote number with `get_opportunity_by_quote`.
2. Fetch standard opportunity details with all useful includes.
3. Fetch jobs with `get_jobs_by_opportunity` and match exact `jobNumber`.
4. Deep-fetch each job with `get_job` and all material/charge/note flags.
5. If `actualMaterials` is populated, import item-level usage.
6. If `actualMaterials` is empty, fetch `get_opportunity_audit` and parse `Materials updated on ... Old total ... new total ...` lines.
7. Treat audit material totals as a fallback signal, not item-level truth.
8. Use `log_note` for opportunity-level integration notes, especially on closed/2.0 jobs.
9. Use `append_job_note` or `update_job_notes` only when Premium job detail says the job is writable/not closed.

## Product implication

For supply tracking and shrink dashboards, SmartMoving should be a reconciliation source, not the only inventory truth:

- 1.0-style jobs can provide item-level actual materials.
- 2.0-style jobs may only provide material total changes through audit activity.
- Manual sold/used supply entry, CSV import, OCR/document import, and physical counts remain necessary.
- Always keep raw API payloads so old records can be reprocessed if SmartMoving exposes more fields later.
