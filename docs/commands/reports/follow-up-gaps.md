# smartmoving reports follow-up-gaps

Audit up to 1000 SmartMoving job or quote numbers for an active assigned follow-up. Normalizes job-number suffixes, deduplicates quote lookups, and keeps missing follow-ups separate from invalid input, not-found records, and API errors.

Safety level: `READ`

Read-only. Requires a valid API key from local `smartmoving init` credentials or `SMARTMOVING_API_KEY`; does not mutate SmartMoving data.

## Arguments

None.

## Options

- `job-numbers`
- `input`
- `job-number-column`
- `concurrency`

Required options:

None.

## Examples

```bash
smartmoving reports follow-up-gaps --job-numbers '90001-1,90002-1' --json
```

```bash
smartmoving reports follow-up-gaps --input opportunity-by-move-date.csv --job-number-column 'Job Number' --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `audit_followup_gaps`

A read-only batch audit for up to 1000 SmartMoving job or quote numbers. Normalizes job numbers such as 90001-1, resolves opportunities, checks follow-ups, and returns explicit classifications for missing active assigned follow-ups, invalid input, not-found records, and API errors.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
