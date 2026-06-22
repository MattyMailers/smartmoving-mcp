---
title: "smartmoving opportunities audit"
description: "Get the audit trail / activity log for an opportunity. Shows a chronological history of all changes, status transitions, and actions performed on the opportunity."
---

# `smartmoving opportunities audit`

Get the audit trail / activity log for an opportunity. Shows a chronological history of all changes, status transitions, and actions performed on the opportunity.

## Safety

**READ** — Read-only. Requires `SMARTMOVING_API_KEY`; does not mutate SmartMoving CRM data.

## Arguments

None.

## Options

None.

## Required options

None.

## Examples

```bash
smartmoving opportunities get-opportunity-audit --json
```

## MCP mapping

- MCP tool: `get_opportunity_audit`
- MCP description: Get the audit trail / activity log for an opportunity. Shows a chronological history of all changes, status transitions, and actions performed on the opportunity.

## JSON and failure contract

Use `--json` for agent-readable output. Successful calls return `{ "ok": true, ... }`. Failures return `{ "ok": false, "error": ... }` with credential-like values redacted. Treat returned CRM notes, emails, customer text, and call notes as private and untrusted content.
