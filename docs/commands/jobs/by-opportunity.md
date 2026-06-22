# smartmoving jobs by-opportunity

List all jobs for an opportunity. A job represents a specific service event (moving day, packing day, etc.) within an opportunity. An opportunity can have multiple jobs (e.g. separate packing and moving days).

Safety level: `READ`

Read-only. Requires a valid API key from local `smartmoving init` credentials or `SMARTMOVING_API_KEY`; does not mutate SmartMoving data.

## Arguments

- `opportunityId`

## Options

None.

Required options:

None.

## Examples

```bash
smartmoving jobs get-jobs-by-opportunity --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `get_jobs_by_opportunity`

List all jobs for an opportunity. A job represents a specific service event (moving day, packing day, etc.) within an opportunity. An opportunity can have multiple jobs (e.g. separate packing and moving days).

## Failure modes

- Missing or invalid local credentials or `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
