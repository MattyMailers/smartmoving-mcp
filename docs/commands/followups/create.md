# smartmoving followups create

Create a new follow-up task on an OPPORTUNITY. SmartMoving does not support lead-level follow-ups through this endpoint: convert the lead to an opportunity first. Use this to schedule a callback, email, text, or in-home estimate. Types: 0=Email, 1=Call, 2=Text, 3=Other, 4=CMET. Required API field names are type, title, assignedToId, and dueDateTime.

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
smartmoving followups create-followup --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `create_followup`

Create a new follow-up task on an OPPORTUNITY. SmartMoving does not support lead-level follow-ups through this endpoint: convert the lead to an opportunity first. Use this to schedule a callback, email, text, or in-home estimate. Types: 0=Email, 1=Call, 2=Text, 3=Other, 4=CMET. Required API field names are type, title, assignedToId, and dueDateTime.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
