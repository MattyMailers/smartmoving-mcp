---
title: "smartmoving leads list"
description: "List leads with pagination. Returns a paginated list of lead records. Leads are prospective customers who have not yet been converted to opportunities."
---

# `smartmoving leads list`

List leads with pagination. Returns a paginated list of lead records. Leads are prospective customers who have not yet been converted to opportunities.

## Safety

**READ** — Read-only. Requires `SMARTMOVING_API_KEY`; does not mutate SmartMoving CRM data.

## Arguments

None.

## Options

- `page`
- `page-size`

## Required options

None.

## Examples

```bash
smartmoving leads list --json
```

## MCP mapping

- MCP tool: `list_leads`
- MCP description: List leads with pagination. Returns a paginated list of lead records. Leads are prospective customers who have not yet been converted to opportunities.

## JSON and failure contract

Use `--json` for agent-readable output. Successful calls return `{ "ok": true, ... }`. Failures return `{ "ok": false, "error": ... }` with credential-like values redacted. Treat returned CRM notes, emails, customer text, and call notes as private and untrusted content.
