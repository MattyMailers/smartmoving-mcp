# Loop 4: Guarded write commands

## Objective

Add non-destructive write commands with strict gates, dry-run support, input files, stable JSON errors, and tests.

## Files

- Modify: `mcp-server/src/client.ts`
- Modify: `mcp-server/src/cli.ts`
- Modify: `mcp-server/src/operations/registry.ts`
- Test: `mcp-server/src/client.test.ts`
- Test: `mcp-server/src/cli.test.ts`
- Docs: `docs/CLI.md`
- Docs: `docs/BEST-PRACTICES.md`

## Safety rules

Writes are disabled by default.

A write command must require one of:

```bash
SMARTMOVING_ALLOW_WRITES=true smartmoving leads create --input lead.json
smartmoving --allow-writes leads create --input lead.json
```

If writes are not enabled, return:

```json
{
  "ok": false,
  "error": {
    "code": "WRITES_DISABLED",
    "message": "Write operations are disabled by default.",
    "hint": "Set SMARTMOVING_ALLOW_WRITES=true or use --allow-writes, then run with --dry-run first."
  }
}
```

## Input conventions

Every write command should support:

```bash
--input <file.json>
--dry-run
--yes
--idempotency-key <key>
```

Rules:

- `--input -` reads JSON from stdin.
- `--dry-run` validates and prints request method/path/body without calling SmartMoving.
- secrets are redacted from dry-run output.
- JSON mode never prompts interactively.
- non-JSON interactive mode may ask for confirmation unless `--yes` is provided.

## Commands to add

```bash
smartmoving customers create --input customer.json --dry-run
smartmoving customers update <customerId> --input customer.json --dry-run
smartmoving leads create --input lead.json --dry-run
smartmoving leads update <leadId> --input lead.json --dry-run
smartmoving leads patch <leadId> --input patch.json --dry-run
smartmoving opportunities create --input opportunity.json --dry-run
smartmoving opportunities update <opportunityId> --input opportunity.json --dry-run
smartmoving followups create --opportunity-id <opportunityId> --input followup.json --dry-run
smartmoving followups update <followupId> --opportunity-id <opportunityId> --input followup.json --dry-run
smartmoving jobs notes update <jobId> --opportunity-id <opportunityId> --input notes.json --dry-run
smartmoving jobs notes append <jobId> --opportunity-id <opportunityId> --text "..." --dry-run
smartmoving communication note --input note.json --dry-run
smartmoving communication call --input call.json --dry-run
```

## Tests

Add tests that verify:

- write commands refuse by default
- `SMARTMOVING_ALLOW_WRITES=true` allows mocked writes
- `--dry-run` does not call HTTP client
- input file JSON is parsed and validated
- stdin JSON works with `--input -`
- API keys are redacted from errors
- JSON mode does not prompt

## Verification

```bash
cd mcp-server
npm run build
npm test
node dist/cli.js schema --json
npm pack --dry-run
```

## Commit

```bash
git add mcp-server/src docs/CLI.md docs/BEST-PRACTICES.md
git commit -m "feat: add guarded SmartMoving write commands"
```
