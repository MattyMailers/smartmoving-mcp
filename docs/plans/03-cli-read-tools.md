# Loop 3: Expose all read-only tools in CLI

## Objective

Expose every read-only MCP operation as a safe CLI command before adding writes.

## Files

- Modify: `mcp-server/src/operations/registry.ts`
- Modify: `mcp-server/src/cli.ts`
- Test: `mcp-server/src/cli.test.ts`
- Docs: `docs/CLI.md`
- Generated docs later: `docs/commands/**`

## Command groups

### Customers

```bash
smartmoving customers list --json
smartmoving customers get <customerId> --json
smartmoving customers search <query> --json
smartmoving customers opportunities <customerId> --json
smartmoving customers storage-accounts <customerId> --json
smartmoving customers service-tickets <customerId> --json
```

### Leads

```bash
smartmoving leads list --page-size 25 --json
smartmoving leads get <leadId> --json
smartmoving leads by-salesperson <userId> --json
smartmoving leads statuses --json
```

### Opportunities

```bash
smartmoving opportunities get <opportunityId> --json
smartmoving opportunities by-quote <quoteNumber> --json
smartmoving opportunities audit <opportunityId> --json
smartmoving opportunities documents <opportunityId> --json
smartmoving opportunities payments <opportunityId> --json
```

### Jobs

```bash
smartmoving jobs by-opportunity <opportunityId> --json
smartmoving jobs get <jobId> --opportunity-id <opportunityId> --json
smartmoving jobs notes <jobId> --opportunity-id <opportunityId> --json
```

### Inventory

```bash
smartmoving inventory opportunity <opportunityId> --json
smartmoving inventory master --json
smartmoving inventory room-types --json
```

### Follow-ups

```bash
smartmoving followups list --opportunity-id <opportunityId> --json
smartmoving followups get <followupId> --opportunity-id <opportunityId> --json
smartmoving followups due --opportunity-id <opportunityId> --json
```

### Reference

```bash
smartmoving reference all --json
smartmoving reference branches --json
smartmoving reference move-sizes --json
smartmoving reference referral-sources --json
smartmoving reference service-types --json
smartmoving reference tariffs --json
smartmoving reference tariff-materials --json
smartmoving reference users --json
smartmoving reference arrival-windows --json
smartmoving reference bad-lead-reasons --json
smartmoving reference cancellation-reasons --json
smartmoving reference lost-reasons --json
```

## Output contract

Every read command supports:

```bash
--json
--plain
--quiet
--verbose
```

JSON shape:

```json
{
  "ok": true,
  "data": {}
}
```

## Tests

For each command:

- mocked HTTP route is called with expected method/path/query
- `--json` stdout parses as JSON
- missing required args fail with non-zero exit
- API errors return stable JSON when `--json` is used

## Verification

```bash
cd mcp-server
npm run build
npm test
node dist/cli.js schema --json
node dist/cli.js reference branches --json
npm pack --dry-run
```

## Commit

```bash
git add mcp-server/src docs/CLI.md
git commit -m "feat: expose read-only SmartMoving tools in CLI"
```
