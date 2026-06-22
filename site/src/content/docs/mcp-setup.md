---
title: MCP setup
description: Configure SmartMoving as a local stdio MCP server.
---

SmartMoving MCP is a local stdio server. Your agent launches a command, passes private environment variables, and discovers SmartMoving tools.

## Local clone command

```json
{
  "command": "node",
  "args": ["/absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js"],
  "env": {
    "SMARTMOVING_API_KEY": "replace-with-your-key",
    "SMARTMOVING_ALLOW_WRITES": "false"
  }
}
```

## Future npm command

After npm publish:

```json
{
  "command": "npx",
  "args": ["-y", "smartmoving-mcp-server"],
  "env": {
    "SMARTMOVING_API_KEY": "replace-with-your-key",
    "SMARTMOVING_ALLOW_WRITES": "false"
  }
}
```

## Claude Desktop

Config path on macOS:

```text
~/Library/Application Support/Claude/claude_desktop_config.json
```

Example:

```json
{
  "mcpServers": {
    "smartmoving": {
      "command": "node",
      "args": ["/absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js"],
      "env": {
        "SMARTMOVING_API_KEY": "replace-with-your-key",
        "SMARTMOVING_ALLOW_WRITES": "false"
      }
    }
  }
}
```

Restart Claude Desktop after editing.

## Hermes Agent

Add the server under `mcp_servers` in `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  smartmoving:
    command: "node"
    args:
      - "/absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js"
    env:
      SMARTMOVING_API_KEY: "replace-with-your-key"
      SMARTMOVING_ALLOW_WRITES: "false"
    timeout: 120
    connect_timeout: 60
```

Hermes registers tools with the `mcp_smartmoving_` prefix, such as `mcp_smartmoving_ping` and `mcp_smartmoving_get_opportunity_by_quote`.

## Generic MCP clients

Any MCP client needs the same three pieces:

- command: `node` or `npx`;
- args: local `dist/index.js` or `smartmoving-mcp-server`;
- env: at least `SMARTMOVING_API_KEY` and preferably `SMARTMOVING_ALLOW_WRITES=false` for first install.

## Smoke test prompt

Ask the agent:

```text
Ping the SmartMoving MCP server, then list the available SmartMoving tools. Do not make any write calls.
```

Expected result: `ping` succeeds and tool discovery shows roughly 62 tools.
