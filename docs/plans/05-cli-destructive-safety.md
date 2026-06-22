# Loop 5: Destructive and high-risk command safety

## Objective

Expose final parity commands that delete, remove, confirm, convert, or otherwise carry higher operational risk, with strong safety gates.

## Files

- Modify: `mcp-server/src/client.ts`
- Modify: `mcp-server/src/cli.ts`
- Modify: `mcp-server/src/operations/registry.ts`
- Test: `mcp-server/src/client.test.ts`
- Test: `mcp-server/src/cli.test.ts`
- Docs: `docs/CLI.md`
- Docs: `docs/BEST-PRACTICES.md`

## Safety gates

Destructive commands require all three:

```bash
SMARTMOVING_ALLOW_WRITES=true
SMARTMOVING_ALLOW_DESTRUCTIVE=true
--yes
```

Or equivalent explicit CLI flags if implemented:

```bash
smartmoving --allow-writes --allow-destructive followups delete <id> --opportunity-id <id> --yes
```

If either gate is missing, return stable JSON:

```json
{
  "ok": false,
  "error": {
    "code": "DESTRUCTIVE_DISABLED",
    "message": "Destructive operations are disabled by default.",
    "hint": "Set SMARTMOVING_ALLOW_WRITES=true and SMARTMOVING_ALLOW_DESTRUCTIVE=true, then pass --yes."
  }
}
```

## Destructive commands

```bash
smartmoving followups delete <followupId> --opportunity-id <opportunityId> --yes
smartmoving jobs delete <jobId> --opportunity-id <opportunityId> --yes
smartmoving inventory remove-item <itemId> --opportunity-id <opportunityId> --yes
```

## High-risk non-delete commands

Require writes, dry-run support, and clear confirmation, but not the destructive flag unless the operation truly deletes data.

```bash
smartmoving jobs confirm <jobId> --opportunity-id <opportunityId> --dry-run
smartmoving leads convert <leadId> --input convert.json --dry-run
smartmoving inventory submit-review <opportunityId> --dry-run
smartmoving jobs stops update <jobId> --opportunity-id <opportunityId> --input stops.json --dry-run
smartmoving jobs materials add <jobId> --opportunity-id <opportunityId> --input materials.json --dry-run
smartmoving opportunities attachments add <opportunityId> --file path.pdf --dry-run
smartmoving opportunities rooms create <opportunityId> --input rooms.json --dry-run
```

## Prompt behavior

- Human mode may prompt with a plain warning.
- `--json` mode must not prompt. It should fail unless `--yes` is supplied.
- `--dry-run` should not require `--yes`.
- Dry-run output must include method/path/body summary and safety level.

## Tests

Add tests that verify:

- destructive commands refuse without both env flags
- destructive commands refuse without `--yes`
- destructive dry-run does not call HTTP client
- high-risk non-delete commands require writes
- JSON mode never hangs on prompts
- all high-risk commands appear in schema with correct safety level

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
git commit -m "feat: add destructive command safety gates"
```
