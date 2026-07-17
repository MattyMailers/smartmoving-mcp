---
title: Commands index
description: Generated command reference entry point for the 63-operation SmartMoving CLI/MCP registry.
---

# SmartMoving command reference

The command reference is generated from `node mcp-server/dist/cli.js schema --json` and mirrors the MCP operation registry published at [`/schema.json`](/schema.json). This project is unofficial and intended only for authorized SmartMoving External API users.

## Safety gates

- **READ** commands require local `smartmoving init` credentials or `SMARTMOVING_API_KEY`; they do not mutate CRM data.
- **WRITE** commands are blocked unless `SMARTMOVING_ALLOW_WRITES=true` or `--allow-writes` is set. Use `--dry-run` first and require human approval before real writes.
- **DESTRUCTIVE** commands require writes, `SMARTMOVING_ALLOW_DESTRUCTIVE=true`, and explicit confirmation such as `--yes`. Use only after separate approval.

## Generated groups

- [Customers](/commands/customers/)
- [Leads](/commands/leads/)
- [Opportunities](/commands/opportunities/)
- [Jobs](/commands/jobs/)
- [Inventory](/commands/inventory/)
- [Followups](/commands/followups/)
- [Communication](/commands/communication/)
- [Reference](/commands/reference/)

Each group page lists commands, safety levels, generated examples, and the corresponding MCP tool name. Use `smartmoving schema --json` for the full machine-readable contract.

## Agent defaults

```bash
smartmoving doctor --json
smartmoving schema --json
```

Agents should prefer read-only commands, pass `--json` for machine-readable output, use `--wrap-untrusted` when feeding CRM text into an LLM, and never print API keys or customer data.
