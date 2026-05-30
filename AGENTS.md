# AI Agent Contribution Guide

This repo welcomes AI-agent-assisted contributions. You can use Claude Code, Codex, Cursor, OpenCode, Hermes Agent, or another coding agent to inspect the repo, draft changes, improve docs, or add missing SmartMoving API coverage.

Agents can help move fast. Humans still own the judgment.

## Project purpose

SmartMoving MCP Server exposes the SmartMoving External API v1 as local MCP tools so AI agents can safely work with moving-company CRM data.

The MCP server lives in:

```text
mcp-server/
```

## Before editing

1. Read `README.md`.
2. Read `CONTRIBUTING.md`.
3. Read `mcp-server/README.md` for the current tool catalog.
4. If changing setup docs, read `docs/AGENT-INSTALL.md`.
5. If changing SmartMoving behavior, check `docs/OPPORTUNITY-V1-V2-LIMITATIONS.md` and `docs/ROADMAP.md`.

## Safe contribution lanes

Good agent-assisted contributions:

- Add missing SmartMoving endpoints as MCP tools.
- Improve tool descriptions so agents call the right tool at the right time.
- Tighten Zod schemas and parameter descriptions.
- Add mocked tests for endpoint paths, query params, request bodies, and errors.
- Document SmartMoving API quirks found during real use.
- Add workflow examples for sales, dispatch, billing, follow-ups, supply reconciliation, and revenue leakage.
- Improve error handling and make failures easier for agents to recover from.

High-value future tools:

- `get_quote_context`
- `find_customer_context`
- `daily_dispatch_snapshot`
- `stale_followup_report`
- `jobs_missing_materials`
- `revenue_leakage_report`
- `supply_reconciliation_summary`

## Hard safety rules

Never commit:

- SmartMoving API keys.
- `.env` or `.env.local` with real values.
- Real customer names, phone numbers, emails, addresses, quote numbers, or payment data.
- Screenshots containing CRM data.
- Agent logs containing live API responses.
- Production data samples from a real moving company account.

Use placeholders and mocked fixtures only.

If a secret or real customer data is exposed, stop immediately and tell the human maintainer before doing anything else.

## Coding standards

- Use TypeScript.
- Keep tool names snake_case.
- Keep tool descriptions practical for agents, not just humans.
- Add clear warnings to destructive, replace, delete, or close-job operations.
- Return JSON text through MCP content blocks.
- Mark failure responses with `isError: true`.
- Prefer small PRs over giant mixed changes.
- Update docs when behavior, tools, install steps, or safety expectations change.

## Verification

From `mcp-server/`, run:

```bash
npm install
npm run verify
```

`npm run verify` currently runs:

```bash
npm run build
npm audit --audit-level=high
```

If adding tests, wire them into `npm run verify` or document the extra command in the PR.

## Pull request behavior

For external contributors and agents:

1. Fork the repo.
2. Create a branch from `main`.
3. Make the smallest useful change.
4. Run verification.
5. Open a PR with:
   - what changed
   - why it matters
   - how it was tested
   - any SmartMoving API caveats

Do not push directly to `main`.

## Feedback without code

Feedback is welcome even without a code change. Open an issue if:

- Your agent could not install or discover the tools.
- A tool name or description confused your agent.
- A SmartMoving endpoint is missing.
- You found an API quirk.
- You have an operational workflow this server should support.
- You have ideas for safer write-mode, read-only mode, or approval workflows.

The goal is an ever-improving SmartMoving agent layer. Forks, PRs, issues, workflow notes, and weird edge-case reports all help.
