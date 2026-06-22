# smartmoving inventory master

Get the master inventory catalog. Premium tier endpoint. Returns all available inventory items that can be added to an opportunity (e.g. 'Sofa', 'Queen Bed', 'Box - Large'). Each item has a default weight and volume. Use the item IDs when calling add_inventory_items.

Safety level: `READ`

Read-only. Requires a valid API key from local `smartmoving init` credentials or `SMARTMOVING_API_KEY`; does not mutate SmartMoving data.

## Arguments

None.

## Options

None.

Required options:

None.

## Examples

```bash
smartmoving inventory get-master-inventory --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `get_master_inventory`

Get the master inventory catalog. Premium tier endpoint. Returns all available inventory items that can be added to an opportunity (e.g. 'Sofa', 'Queen Bed', 'Box - Large'). Each item has a default weight and volume. Use the item IDs when calling add_inventory_items.

## Failure modes

- Missing or invalid local credentials or `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
