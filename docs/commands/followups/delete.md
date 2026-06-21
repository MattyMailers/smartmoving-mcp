# smartmoving followups delete

Delete a follow-up from an opportunity. Premium tier endpoint. Permanently removes the follow-up task. Use complete_followup instead if the task was actually performed.

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
smartmoving followups delete-followup --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `delete_followup`

Delete a follow-up from an opportunity. Premium tier endpoint. Permanently removes the follow-up task. Use complete_followup instead if the task was actually performed.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
