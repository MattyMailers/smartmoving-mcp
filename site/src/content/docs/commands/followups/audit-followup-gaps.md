---
title: "smartmoving reports follow-up-gaps"
description: "Audit up to 1,000 SmartMoving job or quote numbers for missing active assigned follow-ups without converting lookup failures into operational gaps."
---

# `smartmoving reports follow-up-gaps`

Read-only batch audit for SmartMoving Opportunity by Move Date CSV exports or direct job/quote-number lists.

## Safety

**READ**. Performs GET requests only. It does not create, update, complete, or delete follow-ups.

## Options

- `--input <csv>`: Opportunity by Move Date CSV export
- `--job-numbers <numbers>`: comma-separated job or quote numbers
- `--job-number-column <name>`: explicit CSV column; auto-detected when omitted
- `--concurrency <count>`: simultaneous quote audits, 1 through 10

Provide either `--input` or `--job-numbers`. A batch may contain at most 1,000 rows.

## Examples

```bash
smartmoving reports follow-up-gaps --job-numbers "90001-1,90002-1" --json
```

```bash
smartmoving reports follow-up-gaps --input opportunity-by-move-date.csv --job-number-column "Job Number" --json
```

## Classification contract

Operational gaps are `no_followups`, `completed_only`, and `open_unassigned`. Keep `invalid_input`, `not_found`, and `api_error` separate so lookup failures are never reported as missing follow-ups.

`summary.missingActiveFollowup` counts unique quote opportunities. `summary.gapRows` counts submitted job rows.

## MCP mapping

- MCP tool: `audit_followup_gaps`
- Input: `jobNumbers` with 1 to 1,000 values and optional `concurrency` from 1 to 10

The implementation normalizes numeric job suffixes, preserves Q-prefixed formats such as `Q-2024-00123`, deduplicates quote lookups, retries transient `429` and `5xx` failures, and preserves input order.
