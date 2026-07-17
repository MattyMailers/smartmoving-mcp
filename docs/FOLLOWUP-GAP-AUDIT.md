# Follow-up Gap Audit

Use this read-only workflow to audit a SmartMoving Opportunity by Move Date CSV export, or a bounded list of job/quote numbers, for active assigned follow-ups.

## CLI

```bash
smartmoving reports follow-up-gaps \
  --input opportunity-by-move-date.csv \
  --job-number-column "Job Number" \
  --concurrency 4 \
  --json
```

For a smaller ad hoc list:

```bash
smartmoving reports follow-up-gaps \
  --job-numbers "90001-1,90002-1" \
  --json
```

## MCP

Tool: `audit_followup_gaps`

Input:

- `jobNumbers`: 1 to 1,000 SmartMoving job or quote numbers
- `concurrency`: integer from 1 to 10, default `4`

## Classification contract

| Classification | Meaning | Counts as a gap |
|---|---|---:|
| `ok` | At least one open follow-up has an assignee | No |
| `no_followups` | The opportunity has no follow-ups | Yes |
| `completed_only` | All follow-ups are completed | Yes |
| `open_unassigned` | Open follow-ups exist, but none has `assignedToId` | Yes |
| `invalid_input` | The submitted value is not a recognized job/quote number | No |
| `not_found` | SmartMoving did not find the opportunity | No |
| `api_error` | The lookup or follow-up request failed | No |

`summary.missingActiveFollowup` counts unique quote opportunities. `summary.gapRows` counts submitted job rows, so a two-job opportunity does not look like two separate operational misses.

Never combine `invalid_input`, `not_found`, or `api_error` with operational follow-up misses. That would turn a lookup problem into a false accusation.

## Reliability behavior

- Normalizes numeric job numbers such as `90001-1` to quote `90001`.
- Preserves Q-prefixed quote formats such as `Q-2024-00123` instead of stripping internal segments.
- Preserves every submitted row while fetching each unique quote once.
- Uses bounded concurrency and stable input-order output.
- Retries HTTP `429` and `5xx` failures up to three attempts with exponential backoff.
- Treats SmartMoving's specific HTTP `400` response, `The specified opportunity was not found`, as `not_found`.
- Redacts upstream error details from row output.
- Performs GET requests only.

## Limits

The SmartMoving public API does not expose the UI's Opportunity by Move Date report directly. Daily automation needs that CSV exported or delivered to a stable private location before this audit runs.
