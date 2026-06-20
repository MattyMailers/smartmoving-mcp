# Sample agent prompts

Use these prompts with Claude, Codex, Hermes Agent, OpenClaw, Cursor, or any MCP-capable agent after installing SmartMoving MCP.

Start in read-only mode first:

```bash
SMARTMOVING_ALLOW_WRITES=false
SMARTMOVING_ALLOW_DESTRUCTIVE=false
```

Only enable writes after you trust the agent workflow:

```bash
SMARTMOVING_ALLOW_WRITES=true
```

Only enable destructive tools when you intentionally want delete-style operations available:

```bash
SMARTMOVING_ALLOW_DESTRUCTIVE=true
```

Never paste real API keys, customer data, phone numbers, addresses, quote numbers, or payment details into GitHub issues, docs, tests, or public agent transcripts.

## Smoke test prompts

### Verify installation

```text
Use the SmartMoving MCP server. Run ping, then list the SmartMoving tools you can see. Do not write or update anything.
```

### Check read-only behavior

```text
Confirm whether SmartMoving MCP is running in read-only mode. Do not create, update, delete, or log anything. If write tools are blocked, explain which environment variables would enable them.
```

## Lookup and research prompts

### Find a quote or opportunity

```text
Look up SmartMoving quote number 123456. Include the customer, opportunity status, service date, jobs, payments, job addresses, notes, and any audit activity. Read-only only. Summarize risks and missing information.
```

### Customer context packet

```text
Search for a customer named Synthetic Customer. If found, pull their opportunities, recent jobs, open follow-ups, payments, and notes. Return a concise customer context packet for an operations manager. Read-only only.
```

### Job briefing

```text
Prepare a job brief for opportunity UUID 00000000-0000-0000-0000-000000000000 and job UUID 11111111-1111-1111-1111-111111111111. Include crew notes, customer notes, dispatch info, stops, estimated charges, actual charges, materials, payments, and unresolved risks. Do not update anything.
```

### Dispatch day snapshot

```text
For service date 2026-07-15, list jobs, customers, move types, crew/dispatch notes, balances due, missing addresses, and any red flags. Read-only only. If pagination is needed, continue until every page is checked.
```

### Stale follow-up report

```text
List overdue SmartMoving follow-ups by salesperson. Group by salesperson, show customer/opportunity context, due date, and recommended next action. Read-only only.
```

## Write-enabled prompts

Only use these after setting `SMARTMOVING_ALLOW_WRITES=true`.

### Log an internal note

```text
Log an internal note on opportunity UUID 00000000-0000-0000-0000-000000000000 saying: "Synthetic note for testing MCP write access." Before writing, confirm the opportunity exists. After writing, read back the audit/activity or note evidence if available.
```

### Append a job note safely

```text
Append this dispatcher note to job UUID 11111111-1111-1111-1111-111111111111 on opportunity UUID 00000000-0000-0000-0000-000000000000: "Synthetic dispatch note for testing." First read the existing job notes. Append without erasing existing text. Do not replace other note fields.
```

### Create a follow-up

```text
Create a follow-up on opportunity UUID 00000000-0000-0000-0000-000000000000 for tomorrow at 9 AM with the title "Synthetic follow-up from MCP test". Then read it back if the API supports it.
```

## Destructive prompts

These require both:

```bash
SMARTMOVING_ALLOW_WRITES=true
SMARTMOVING_ALLOW_DESTRUCTIVE=true
```

Avoid destructive operations unless you are using a sandbox or you are absolutely sure. Prefer asking the agent to explain the exact DELETE/replace operation it would perform before enabling destructive mode.

### Dry-run style destructive review

```text
I am considering deleting job UUID 11111111-1111-1111-1111-111111111111 from opportunity UUID 00000000-0000-0000-0000-000000000000. Do not delete it. First read the job, summarize what would be lost, and tell me the exact tool call you would make only if I later confirm.
```

### Replace stops review

```text
I need to replace all stops on a job, but do not write yet. Read the current stops, compare them to this proposed stop list, and explain exactly what would change. Warn me if existing stops would be removed.
```

## Operator workflow ideas

These are good issues or PRs for contributors:

- Daily dispatch snapshot by branch/service date.
- Quote prep packet for salespeople before a call.
- Customer dispute packet with notes, audit activity, payments, documents, and job details.
- Revenue leakage report for missing charges, unpaid balances, or odd discounts.
- Supply/material reconciliation from estimated materials, actual materials, charges, and audit activity.
- Stale follow-up report by salesperson.
- Closed-job write guard that explains why a write failed and suggests a safe note/log alternative.
- Reference snapshot tool that fetches branches, users, move sizes, tariffs, service types, and reasons in one call.

## Contributing prompts for coding agents

### Add a missing endpoint

```text
You are working in the smartmoving-mcp repo. Add one missing SmartMoving endpoint as an MCP tool. Keep the PR focused. Use fake data only. Add or update mocked tests. Update mcp-server/README.md and docs if behavior changes. Run npm run verify before summarizing.
```

### Add mocked tests

```text
You are working in the smartmoving-mcp repo. Add Vitest tests for one tool module. Mock SmartMovingClient. Assert endpoint paths, query params, request body shape, and error responses. Do not call the live SmartMoving API. Run npm run verify.
```

### Improve docs

```text
You are working in the smartmoving-mcp repo. Improve the install docs for one MCP client. Include local clone setup, npx setup, read-only first-run mode, write/destructive flags, and troubleshooting. Do not include real secrets or screenshots.
```
