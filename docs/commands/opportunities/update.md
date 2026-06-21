# smartmoving opportunities update

Update an existing opportunity. Premium tier endpoint. This is a PATCH operation - only the fields you provide will be modified. Use this to update customer info, move details, pricing, status changes, etc. To mark as lost/cancelled, set the status and provide the corresponding reason ID.

Safety level: `WRITE`

WRITE. Blocked unless `SMARTMOVING_ALLOW_WRITES=true` or `--allow-writes` is used. Prefer `--dry-run` before `--yes`.

## Arguments

None.

## Options

None.

Required options:

None.

## Examples

```bash
smartmoving opportunities update-opportunity --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `update_opportunity`

Update an existing opportunity. Premium tier endpoint. This is a PATCH operation - only the fields you provide will be modified. Use this to update customer info, move details, pricing, status changes, etc. To mark as lost/cancelled, set the status and provide the corresponding reason ID.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
