---
title: CLI docs
description: Use the safety-gated smartmoving CLI for diagnostics, schema discovery, command docs, and smoke tests.
---

The `smartmoving` CLI is a guarded MVP built from the same TypeScript package as the MCP server. Use MCP for agent-native tool discovery; use the CLI for explicit terminal commands and machine-readable output.

## Core commands

```bash
smartmoving --help
smartmoving init --yes --profile default --api-key-env SMARTMOVING_API_KEY
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

`smartmoving schema --json` prints registry metadata for all 62 operations. Agents should use it to discover:

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
