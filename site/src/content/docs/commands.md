---
title: Commands index
description: High-level command index for the 62-operation SmartMoving CLI/MCP registry.
---

The command reference is generated from `smartmoving schema --json` in the repository's `docs/commands/` directory. This docs-site page gives the launch scaffold a readable overview; Loop B can add generated per-command pages and `schema.json`.

## Safety badges

- **READ**: requires `SMARTMOVING_API_KEY`; does not mutate CRM data.
- **WRITE**: requires `SMARTMOVING_ALLOW_WRITES=true` or `--allow-writes`; dry-run first.
- **DESTRUCTIVE**: requires writes, `SMARTMOVING_ALLOW_DESTRUCTIVE=true`, and `--yes`.

## Reference data

READ commands:

```bash
smartmoving ping
smartmoving reference branches --json
smartmoving reference move-sizes --json
smartmoving reference referral-sources --json
smartmoving reference service-types --json
smartmoving reference tariffs --json
smartmoving reference tariff-materials <tariffId> --json
smartmoving reference users --json
smartmoving reference arrival-windows --json
smartmoving reference bad-lead-reasons --json
smartmoving reference cancellation-reasons --json
smartmoving reference lost-reasons --json
```

## Customers

```bash
smartmoving customers list --page-size 25 --json
smartmoving customers get <customerId> --json
smartmoving customers search <query> --json
smartmoving customers opportunities <customerId> --json
smartmoving customers storage-accounts <customerId> --json
smartmoving customers service-tickets <customerId> --json
smartmoving customers create --input customer.json --dry-run --json
smartmoving customers update <customerId> --input customer.json --dry-run --json
```

## Leads

```bash
smartmoving leads list --page-size 25 --json
smartmoving leads get <leadId> --json
smartmoving leads statuses --json
smartmoving leads by-salesperson <userId> --json
smartmoving leads create --input lead.json --dry-run --json
smartmoving leads update <leadId> --input lead.json --dry-run --json
smartmoving leads patch <leadId> --input patch.json --dry-run --json
smartmoving leads convert <leadId> --input convert.json --dry-run --json
```

## Opportunities

```bash
smartmoving opportunities get <opportunityId> --json
smartmoving opportunities by-quote <quoteNumber> --json
smartmoving opportunities audit <opportunityId> --json
smartmoving opportunities documents <opportunityId> --json
smartmoving opportunities payments <opportunityId> --json
smartmoving opportunities create --input opportunity.json --dry-run --json
smartmoving opportunities update <opportunityId> --input opportunity.json --dry-run --json
smartmoving opportunities attachments add <opportunityId> --file path.pdf --dry-run --json
smartmoving opportunities rooms create <opportunityId> --input rooms.json --dry-run --json
```

## Jobs

```bash
smartmoving jobs by-opportunity <opportunityId> --json
smartmoving jobs get <jobId> --opportunity-id <opportunityId> --json
smartmoving jobs notes <jobId> --opportunity-id <opportunityId> --json
smartmoving jobs create-job --input job.json --dry-run --json
smartmoving jobs confirm <jobId> --opportunity-id <opportunityId> --dry-run --json
smartmoving jobs notes update <jobId> --opportunity-id <opportunityId> --input notes.json --dry-run --json
smartmoving jobs notes append <jobId> --opportunity-id <opportunityId> --text "Synthetic note" --dry-run --json
smartmoving jobs stops update <jobId> --opportunity-id <opportunityId> --input stops.json --dry-run --json
smartmoving jobs materials add <jobId> --opportunity-id <opportunityId> --input materials.json --dry-run --json
smartmoving jobs delete <jobId> --opportunity-id <opportunityId> --dry-run --json
```

## Inventory, follow-ups, communication

```bash
smartmoving inventory opportunity <opportunityId> --json
smartmoving inventory master --json
smartmoving inventory room-types --json
smartmoving inventory remove-item <itemId> --opportunity-id <opportunityId> --room-id <roomId> --dry-run --json
smartmoving inventory submit-review <opportunityId> --dry-run --json
smartmoving followups list --opportunity-id <opportunityId> --json
smartmoving followups get <followupId> --opportunity-id <opportunityId> --json
smartmoving followups due --opportunity-id <opportunityId> --json
smartmoving followups create --opportunity-id <opportunityId> --input followup.json --dry-run --json
smartmoving followups update <followupId> --opportunity-id <opportunityId> --input followup.json --dry-run --json
smartmoving followups delete <followupId> --opportunity-id <opportunityId> --dry-run --json
smartmoving communication note --input note.json --dry-run --json
smartmoving communication call --input call.json --dry-run --json
```

For exact generated pages in the repo, see `docs/commands/README.md` and the per-group command markdown files.
