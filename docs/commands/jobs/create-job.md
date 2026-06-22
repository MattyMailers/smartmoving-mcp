# smartmoving jobs create-job

Add a new job to an opportunity. Premium tier endpoint. Use this to schedule a moving day, packing day, or other service. Job types: 1=Moving, 3=Packing, 4=MovingAndPacking, 5=LoadOnly, 6=UnloadOnly, 7=Commercial, 8=StorageInBound, 9=StorageOutBound, 10=InnerHouse, 11=JunkRemoval, 12=LaborOnly.

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
smartmoving jobs create-job --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `create_job`

Add a new job to an opportunity. Premium tier endpoint. Use this to schedule a moving day, packing day, or other service. Job types: 1=Moving, 3=Packing, 4=MovingAndPacking, 5=LoadOnly, 6=UnloadOnly, 7=Commercial, 8=StorageInBound, 9=StorageOutBound, 10=InnerHouse, 11=JunkRemoval, 12=LaborOnly.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
