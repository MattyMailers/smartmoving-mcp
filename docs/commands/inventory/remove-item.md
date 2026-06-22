# smartmoving inventory remove-item

Remove an inventory item from a room. Premium tier endpoint. Permanently deletes the item from the opportunity's inventory.

Safety level: `DESTRUCTIVE`

DESTRUCTIVE. Requires writes, `SMARTMOVING_ALLOW_DESTRUCTIVE=true`, and `--yes`. Prefer `--dry-run`; use only with explicit human approval.

## Arguments

None.

## Options

None.

Required options:

None.

## Examples

```bash
smartmoving inventory remove-inventory-item --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `remove_inventory_item`

Remove an inventory item from a room. Premium tier endpoint. Permanently deletes the item from the opportunity's inventory.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
