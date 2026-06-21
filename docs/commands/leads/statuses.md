# smartmoving leads statuses

Get all possible lead status values. Returns the list of statuses a lead can be in (e.g. New, Contacted, Qualified, Lost, BadLead, Converted). Useful for understanding lead status codes.

Safety level: `READ`

Read-only. Requires a valid `SMARTMOVING_API_KEY`; does not mutate SmartMoving data.

## Arguments

None.

## Options

None.

Required options:

None.

## Examples

```bash
smartmoving leads statuses --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `get_lead_statuses`

Get all possible lead status values. Returns the list of statuses a lead can be in (e.g. New, Contacted, Qualified, Lost, BadLead, Converted). Useful for understanding lead status codes.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
