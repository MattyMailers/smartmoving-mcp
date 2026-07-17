---
title: CLI docs
description: Use the safety-gated smartmoving CLI for onboarding, diagnostics, schema discovery, command docs, and smoke tests.
---

The `smartmoving` CLI is a first-class surface built from the same operation registry as the MCP server. Use MCP for agent-native tool calls; use the CLI for terminal agents, humans, JSON scripts, smoke tests, and install diagnostics.

## Core commands

```bash
smartmoving --help
smartmoving init
smartmoving doctor --json
smartmoving mcp config --print-hermes
smartmoving mcp config --print-claude
smartmoving schema --json
smartmoving schema --group leads --json
smartmoving schema --safety read --json
smartmoving docs generate --json
smartmoving smoke read --json
smartmoving smoke write --dry-run --json
```

From a source checkout before npm publish, replace `smartmoving` with `node dist/cli.js` from `mcp-server/`.

## Local credential onboarding

Interactive setup:

```bash
smartmoving init
```

The CLI asks whether to store the API key locally on this machine. If yes, it writes:

| File | Contains |
| --- | --- |
| `~/.config/smartmoving/config.json` | Profile name, base URL, auth source. |
| `~/.config/smartmoving/credentials.json` | API key for that profile, local file mode `0600` where supported. |

Non-interactive local storage, without putting the key in shell history:

```bash
printf '%s' "$SMARTMOVING_API_KEY" \
  | smartmoving init --yes --store-api-key --api-key-stdin --profile default
```

Environment-variable mode is still supported and preferred for CI, Docker, server processes, and MCP client configs:

```bash
smartmoving init --yes --profile default --api-key-env SMARTMOVING_API_KEY
export SMARTMOVING_API_KEY="replace-with-your-key"
```

The CLI resolves auth in this order:

1. The configured environment variable, default `SMARTMOVING_API_KEY`.
2. Local credentials for the selected profile when `apiKeySource` is `local`.

API keys are never accepted as command arguments and are redacted from errors.

## CLI and MCP parity

The package uses one shared operation registry:

```text
SmartMoving API client
  -> operation registry
    -> MCP tools
    -> CLI commands
    -> schema --json
    -> generated docs
```

That means `smartmoving schema --json` is the stable contract terminal agents should inspect before running commands, and each CLI command maps back to a related MCP tool.

## JSON output contract

Successful JSON reads are wrapped for scripts:

```json
{
  "ok": true,
  "data": {}
}
```

Write commands disabled by default return a stable error without making an HTTP request:

```json
{
  "ok": false,
  "error": {
    "code": "WRITES_DISABLED",
    "message": "Write operations are disabled by default."
  }
}
```

Dry-runs return request metadata and do not call SmartMoving:

```json
{
  "ok": true,
  "dryRun": true,
  "request": {
    "method": "POST",
    "path": "/api/premium/leads",
    "body": {}
  }
}
```

## Schema for agents

`smartmoving schema --json` prints registry metadata for all 63 operations. Agents should use it to discover:

- operation name and group;
- safety level: read, write, or destructive;
- CLI command text;
- related MCP tool name;
- required arguments and options;
- stable exit codes and output modes.

## Agent-safe content wrapping

Some SmartMoving fields can contain user-entered CRM notes, emails, or customer text. Treat that data as untrusted. For read commands that support JSON, use:

```bash
smartmoving leads get <leadId> --json --wrap-untrusted
```

This returns an envelope that flags CRM content as untrusted for downstream agent handling.

## Full command list

See [Commands index](/commands/) for grouped commands and safety badges.
