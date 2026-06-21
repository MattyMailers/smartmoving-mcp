# smartmoving opportunities rooms create

Create rooms for an opportunity's inventory. Premium tier endpoint. Rooms are used to organize inventory items (e.g. 'Living Room', 'Master Bedroom'). Use get_room_types to find valid room type IDs.

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
smartmoving opportunities create-rooms --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `create_rooms`

Create rooms for an opportunity's inventory. Premium tier endpoint. Rooms are used to organize inventory items (e.g. 'Living Room', 'Master Bedroom'). Use get_room_types to find valid room type IDs.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
