# smartmoving jobs notes

Read all note fields on a specific job. This calls Premium job detail with IncludeNotes=true and returns crew, customer, internal, accounting, dispatcher notes, plus crew feedback when present. Use this before update_job_notes so you don't accidentally replace existing note text.

Safety level: `READ`

Read-only. Requires a valid API key from local `smartmoving init` credentials or `SMARTMOVING_API_KEY`; does not mutate SmartMoving data.

## Arguments

- `opportunityId`
- `jobId`

## Options

None.

Required options:

None.

## Examples

```bash
smartmoving jobs get-job-notes --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `get_job_notes`

Read all note fields on a specific job. This calls Premium job detail with IncludeNotes=true and returns crew, customer, internal, accounting, dispatcher notes, plus crew feedback when present. Use this before update_job_notes so you don't accidentally replace existing note text.

## Failure modes

- Missing or invalid local credentials or `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
