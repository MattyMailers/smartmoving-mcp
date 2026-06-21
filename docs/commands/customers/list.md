# smartmoving customers list

List customers with pagination. Returns a paginated list of customer records from SmartMoving. Use this to browse or iterate through all customers in the system. Supports filtering by service date range.

Safety level: `READ`

Read-only. Requires a valid `SMARTMOVING_API_KEY`; does not mutate SmartMoving data.

## Arguments

None.

## Options

- `page`
- `page-size`
- `from-service-date`
- `to-service-date`
- `include-opportunity-info`

Required options:

None.

## Examples

```bash
smartmoving customers list --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `list_customers`

List customers with pagination. Returns a paginated list of customer records from SmartMoving. Use this to browse or iterate through all customers in the system. Supports filtering by service date range.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
