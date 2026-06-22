# smartmoving jobs get

Get detailed information about a specific job within an opportunity. Premium tier endpoint. Can include estimated/actual charges, estimated/actual materials, and stops. Use IncludeActualMaterials=true to pull supplies sold/used on completed jobs.

Safety level: `READ`

Read-only. Requires a valid `SMARTMOVING_API_KEY`; does not mutate SmartMoving data.

## Arguments

- `jobId`

## Options

- `include-estimated-charges`
- `include-actual-charges`
- `include-estimated-materials`
- `include-actual-materials`
- `include-stops`
- `include-dispatch-info`
- `include-charges`
- `include-notes`

Required options:

- `opportunity-id`

## Examples

```bash
smartmoving jobs get --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `get_job`

Get detailed information about a specific job within an opportunity. Premium tier endpoint. Can include estimated/actual charges, estimated/actual materials, and stops. Use IncludeActualMaterials=true to pull supplies sold/used on completed jobs.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
