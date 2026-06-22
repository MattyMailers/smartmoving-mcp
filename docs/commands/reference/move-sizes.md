# smartmoving reference move-sizes

Get all move size options (e.g. 'Studio', '1 Bedroom', '2-3 Bedroom', '4+ Bedroom'). Move sizes help categorize the scope of a move and are used when creating leads and opportunities.

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
smartmoving reference move-sizes --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `get_move_sizes`

Get all move size options (e.g. 'Studio', '1 Bedroom', '2-3 Bedroom', '4+ Bedroom'). Move sizes help categorize the scope of a move and are used when creating leads and opportunities.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
