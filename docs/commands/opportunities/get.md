# smartmoving opportunities get

Get detailed information about a specific opportunity (quote/move). This is the core entity in SmartMoving representing a potential or booked move. Use the Include* boolean params to control which related data is returned (jobs, follow-ups, payments, documents, rooms). Including everything may result in large responses.

Safety level: `READ`

Read-only. Requires a valid `SMARTMOVING_API_KEY`; does not mutate SmartMoving data.

## Arguments

- `opportunityId`

## Options

- `include-jobs`
- `include-follow-ups`
- `include-payments`
- `include-documents`
- `include-rooms`
- `include-audit`

Required options:

None.

## Examples

```bash
smartmoving opportunities get --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `get_opportunity`

Get detailed information about a specific opportunity (quote/move). This is the core entity in SmartMoving representing a potential or booked move. Use the Include* boolean params to control which related data is returned (jobs, follow-ups, payments, documents, rooms). Including everything may result in large responses.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
