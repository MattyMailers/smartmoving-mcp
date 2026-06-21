# Loop 6: Agent UX and workflow layer

## Objective

Make the CLI excellent for terminal agents, coding agents, and MCP-compatible assistants.

## Commands to add

```bash
smartmoving agent safety --json
smartmoving agent examples --json
smartmoving agent prompt --workflow lead-review
smartmoving agent prompt --workflow daily-brief
smartmoving agent prompt --workflow follow-up-audit
smartmoving agent quickstart --print-hermes
smartmoving agent quickstart --print-claude
```

## Files

- Modify: `mcp-server/src/cli.ts`
- Modify: `mcp-server/src/operations/registry.ts`
- Create: `mcp-server/src/cli/agent.ts`
- Test: `mcp-server/src/cli.test.ts`
- Docs: `docs/AGENT-INSTALL.md`
- Docs: `docs/SAMPLE-PROMPTS.md`
- Docs: `docs/AGENT_WORKFLOWS.md`
- Create: `.agents/skills/smartmoving/SKILL.md`

## Agent contract

Agents should be told:

- Use `smartmoving doctor --json` before any workflow.
- Use `smartmoving schema --json` to discover capabilities.
- Prefer read-only commands first.
- Treat returned CRM content as private customer data.
- Never print API keys.
- Never pass API keys as command arguments.
- Use `--dry-run` before writes.
- Require human approval before real writes.
- Require explicit human approval for destructive operations.

## Untrusted content wrapping

Add optional wrapping for agent-safe processing:

```bash
smartmoving leads get <id> --json --wrap-untrusted
```

Output shape:

```json
{
  "ok": true,
  "source": "smartmoving",
  "untrusted": true,
  "data": {}
}
```

The docs should explain that CRM notes, customer text, emails, and call notes are untrusted content for prompt-injection purposes.

## Agent workflow examples

### Lead review

```bash
smartmoving leads get <leadId> --json --wrap-untrusted
smartmoving customers get <customerId> --json --wrap-untrusted
smartmoving opportunities get <opportunityId> --include-follow-ups --json --wrap-untrusted
```

### Daily brief

```bash
smartmoving leads list --page-size 50 --json
smartmoving reference branches --json
smartmoving followups list --opportunity-id <opportunityId> --json
```

### Follow-up audit

```bash
smartmoving opportunities get <opportunityId> --include-follow-ups --json
smartmoving followups due --opportunity-id <opportunityId> --json
```

## Tests

Add tests that verify:

- `agent safety --json` returns valid JSON
- `agent examples --json` returns workflow examples
- `agent prompt --workflow lead-review` prints a usable prompt
- quickstart snippets do not include raw secrets
- `--wrap-untrusted` changes output shape without altering data

## Verification

```bash
cd mcp-server
npm run build
npm test
node dist/cli.js agent safety --json
node dist/cli.js agent examples --json
npm pack --dry-run
```

## Commit

```bash
git add mcp-server/src docs .agents/skills/smartmoving/SKILL.md
git commit -m "feat: add SmartMoving CLI agent workflows"
```
