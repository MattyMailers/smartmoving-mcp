# smartmoving leads convert

Convert a lead into an opportunity. Premium tier endpoint. SmartMoving requires a complete conversion payload, not just the lead ID: customerId, referralSourceId, tariffId, moveDate, moveSizeId, salesPersonId, and serviceTypeId are required. Use search_customers/create_customer, get_referral_sources, get_tariffs, get_move_sizes, get_users, and get_service_types first. Follow-up reminders can only be created after this conversion because follow-ups are opportunity-only.

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
smartmoving leads convert-lead-to-opportunity --json
```

## JSON output notes

Use `--json` for machine-readable output. Successful read/write calls return `{ "ok": true, "data": ... }`. Dry-run writes return `{ "ok": true, "dryRun": true, "request": ... }`. Failures return `{ "ok": false, "error": { "code": ..., "message": ... } }` with API keys redacted.

## Related MCP tool

Related MCP tool: `convert_lead_to_opportunity`

Convert a lead into an opportunity. Premium tier endpoint. SmartMoving requires a complete conversion payload, not just the lead ID: customerId, referralSourceId, tariffId, moveDate, moveSizeId, salesPersonId, and serviceTypeId are required. Use search_customers/create_customer, get_referral_sources, get_tariffs, get_move_sizes, get_users, and get_service_types first. Follow-up reminders can only be created after this conversion because follow-ups are opportunity-only.

## Failure modes

- Missing or invalid `SMARTMOVING_API_KEY` returns an auth/read failure.
- Basic-tier keys may receive `403 Forbidden` on Premium endpoints.
- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.
- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.
