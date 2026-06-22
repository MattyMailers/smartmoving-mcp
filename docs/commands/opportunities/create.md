# smartmoving opportunities create

Create a new opportunity (quote) directly, bypassing the lead stage. Premium tier endpoint. An opportunity represents a potential move that can be priced, scheduled, and booked. The referralSourceId is required - use get_referral_sources to find valid IDs. You can provide either firstName/lastName or the combined 'name' field.

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
smartmoving opportunities create-opportunity --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `create_opportunity`

Create a new opportunity (quote) directly, bypassing the lead stage. Premium tier endpoint. An opportunity represents a potential move that can be priced, scheduled, and booked. The referralSourceId is required - use get_referral_sources to find valid IDs. You can provide either firstName/lastName or the combined 'name' field.

## Failure modes

- Missing or invalid local credentials or `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
