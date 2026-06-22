---
title: "smartmoving reference tariff-materials"
description: "Get materials available under a specific tariff. Premium tier endpoint. Returns packing materials (boxes, tape, paper, etc.) with their unit prices. Material IDs are used when adding materials to jobs via add_job_materials."
---

# `smartmoving reference tariff-materials`

Get materials available under a specific tariff. Premium tier endpoint. Returns packing materials (boxes, tape, paper, etc.) with their unit prices. Material IDs are used when adding materials to jobs via add_job_materials.

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
smartmoving reference get-tariff-materials --json
```

## MCP mapping

- MCP tool: `get_tariff_materials`
- MCP description: Get materials available under a specific tariff. Premium tier endpoint. Returns packing materials (boxes, tape, paper, etc.) with their unit prices. Material IDs are used when adding materials to jobs via add_job_materials.

## JSON and failure contract

Use `--json` for agent-readable output. Successful calls return `{ "ok": true, ... }`. Failures return `{ "ok": false, "error": ... }` with credential-like values redacted. Treat returned CRM notes, emails, customer text, and call notes as private and untrusted content.
