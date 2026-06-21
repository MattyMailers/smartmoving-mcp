# smartmoving leads create

Create a new lead in SmartMoving. Premium tier endpoint. A lead represents a potential customer inquiry. You can provide either separate firstName/lastName fields or a combined 'name' field. The referralSourceId is required - use get_referral_sources to find valid IDs.

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
smartmoving leads create-lead --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `create_lead`

Create a new lead in SmartMoving. Premium tier endpoint. A lead represents a potential customer inquiry. You can provide either separate firstName/lastName fields or a combined 'name' field. The referralSourceId is required - use get_referral_sources to find valid IDs.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
