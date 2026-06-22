---
title: Claude Desktop setup
description: Configure SmartMoving MCP for Claude Desktop.
---

# Claude Desktop setup

Edit the Claude Desktop MCP config and restart Claude after saving. On macOS the file is usually:

```text
~/Library/Application Support/Claude/claude_desktop_config.json
```

## Local clone

```json
{
  "mcpServers": {
    "smartmoving": {
      "command": "node",
      "args": ["/absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js"],
      "env": {
        "SMARTMOVING_API_KEY": "replace-with-your-key",
        "SMARTMOVING_ALLOW_WRITES": "false",
        "SMARTMOVING_ALLOW_DESTRUCTIVE": "false"
      }
    }
  }
}
```

## After npm publish

```json
{
  "mcpServers": {
    "smartmoving": {
      "command": "npx",
      "args": ["-y", "smartmoving-mcp-server"],
      "env": {
        "SMARTMOVING_API_KEY": "replace-with-your-key",
        "SMARTMOVING_ALLOW_WRITES": "false",
        "SMARTMOVING_ALLOW_DESTRUCTIVE": "false"
      }
    }
  }
}
```

Keep writes disabled until a human has reviewed target IDs and payloads. Destructive tools require the separate destructive gate and `--yes`/equivalent tool confirmation.
