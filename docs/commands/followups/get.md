# smartmoving followups get

Get details of a specific follow-up. Premium tier endpoint. Returns full information including type, due date, assigned user, completion status, and notes.

Safety level: `READ`

Read-only. Requires a valid `SMARTMOVING_API_KEY`; does not mutate SmartMoving data.

## Arguments

- `opportunityId`
- `followupId`

## Options

None.

Required options:

None.

## Examples

```bash
smartmoving followups get --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `get_followup`

Get details of a specific follow-up. Premium tier endpoint. Returns full information including type, due date, assigned user, completion status, and notes.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
