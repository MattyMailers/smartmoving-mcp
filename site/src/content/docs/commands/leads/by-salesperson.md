---
title: "smartmoving leads by-salesperson"
description: "List leads assigned to a specific salesperson. Premium tier endpoint. Useful for viewing a sales rep's pipeline of uncontacted or in-progress leads."
---

# `smartmoving leads by-salesperson`

List leads assigned to a specific salesperson. Premium tier endpoint. Useful for viewing a sales rep's pipeline of uncontacted or in-progress leads.

## Safety

**READ** — Read-only. Requires local `smartmoving init` credentials or `SMARTMOVING_API_KEY`; does not mutate SmartMoving CRM data.

## Arguments

None.

## Options

None.

## Required options

None.

## Examples

```bash
smartmoving leads by-salesperson <userId> --json
```

## MCP mapping

- MCP tool: `get_leads_by_salesperson`
- MCP description: List leads assigned to a specific salesperson. Premium tier endpoint. Useful for viewing a sales rep's pipeline of uncontacted or in-progress leads.

## JSON and failure contract

Use `--json` for agent-readable output. Successful calls return `{ "ok": true, ... }`. Failures return `{ "ok": false, "error": ... }` with credential-like values redacted. Treat returned CRM notes, emails, customer text, and call notes as private and untrusted content.
