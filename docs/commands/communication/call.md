# smartmoving communication call

Log a phone call on an opportunity. Premium tier endpoint. Records an inbound or outbound call with its outcome. Use this to track all phone interactions with the customer. Call types: 0=Outbound, 1=Inbound. Outcomes: 0=NoAnswer, 1=Busy, 2=WrongNumber, 3=LeftLiveMessage, 4=LeftVoicemail, 5=Connected, 6=NumberDisconnected.

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
smartmoving communication log-call --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `log_call`

Log a phone call on an opportunity. Premium tier endpoint. Records an inbound or outbound call with its outcome. Use this to track all phone interactions with the customer. Call types: 0=Outbound, 1=Inbound. Outcomes: 0=NoAnswer, 1=Busy, 2=WrongNumber, 3=LeftLiveMessage, 4=LeftVoicemail, 5=Connected, 6=NumberDisconnected.

## Failure modes

- Missing or invalid local credentials or `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
