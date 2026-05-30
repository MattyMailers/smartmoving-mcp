# Install SmartMoving MCP in AI agents

This server is a local stdio MCP server. Your AI agent launches `node /absolute/path/to/mcp-server/dist/index.js`, passes `SMARTMOVING_API_KEY` privately through environment variables, then discovers the SmartMoving tools.

## Build once

```bash
git clone https://github.com/MattyMailers/smartmoving-mcp.git
cd smartmoving-mcp/mcp-server
npm install
npm run build
```

Use an absolute path in client configs. Example:

```text
/Users/you/dev/smartmoving-mcp/mcp-server/dist/index.js
```

## Required environment

- `SMARTMOVING_API_KEY`: required. Never commit this.
- `SMARTMOVING_BASE_URL`: optional. Defaults to `https://api-public.smartmoving.com/v1`.

Recommended secret pattern:

- Keep the real key in the agent's private config, a local `.env`, macOS Keychain, 1Password, or your shell profile.
- Commit only `.env.example` with placeholders.
- Rotate the SmartMoving API key immediately if it is ever pasted into GitHub, chat, logs, or screenshots.

## Claude Desktop

macOS config path:

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
        "SMARTMOVING_API_KEY": "replace-with-your-key"
      }
    }
  }
}
```

Restart Claude Desktop after editing.

## Claude Code

Claude Code supports MCP servers through its MCP configuration commands and config files. The exact command shape can change by version, so use the built-in help as the source of truth:

```bash
claude mcp --help
```

The target configuration is this stdio server:

```json
{
  "mcpServers": {
    "smartmoving": {
      "command": "node",
      "args": ["/absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js"],
      "env": {
        "SMARTMOVING_API_KEY": "replace-with-your-key"
      }
    }
  }
}
```

If your Claude Code version supports CLI registration, it will be equivalent to:

```bash
claude mcp add smartmoving \
  --env SMARTMOVING_API_KEY="$SMARTMOVING_API_KEY" \
  -- node /absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js
```

## Hermes Agent

Hermes has a native MCP client. Add the server under `mcp_servers` in `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  smartmoving:
    command: "node"
    args:
      - "/absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js"
    env:
      SMARTMOVING_API_KEY: "replace-with-your-key"
    timeout: 120
    connect_timeout: 60
```

Then restart Hermes. Tools will be registered with the prefix:

```text
mcp_smartmoving_
```

Examples:

- `mcp_smartmoving_ping`
- `mcp_smartmoving_search_customers`
- `mcp_smartmoving_get_opportunity_by_quote`
- `mcp_smartmoving_log_note`

Hermes intentionally passes a filtered environment to MCP subprocesses, so explicitly include `SMARTMOVING_API_KEY` in the server config or load it from the server command wrapper.

## Codex-style MCP config

For Codex or other OpenAI-agent clients that support MCP, use the client's MCP server config and point it at the same stdio command:

```toml
[mcp_servers.smartmoving]
command = "node"
args = ["/absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js"]

[mcp_servers.smartmoving.env]
SMARTMOVING_API_KEY = "replace-with-your-key"
```

If your Codex build uses JSON instead of TOML, use the generic JSON block from Claude Desktop.

## OpenClaw-style MCP config

For OpenClaw or OpenClaw-derived agents, add SmartMoving to the agent's MCP server list:

```json
{
  "mcpServers": {
    "smartmoving": {
      "command": "node",
      "args": ["/absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js"],
      "env": {
        "SMARTMOVING_API_KEY": "replace-with-your-key"
      }
    }
  }
}
```

Restart the agent after changing config.

## Generic MCP stdio clients

Any MCP client needs these three values:

- Command: `node`
- Args: `["/absolute/path/to/mcp-server/dist/index.js"]`
- Env: `SMARTMOVING_API_KEY=...`

## Smoke test

Ask the agent:

```text
Ping the SmartMoving MCP server and list the available SmartMoving tools.
```

Expected result:

- `ping` succeeds with a SmartMoving API response.
- Tool discovery shows roughly 62 tools.

## Common troubleshooting

**Server exits immediately:** `SMARTMOVING_API_KEY` is missing.

**401 Unauthorized:** key is invalid, expired, or copied with whitespace.

**403 Forbidden:** key exists but does not have Premium API tier for that endpoint.

**Tool not visible in Hermes:** restart Hermes after editing `config.yaml`; MCP discovery happens at startup.

**Node error:** install Node 18+ and run `npm install && npm run build` inside `mcp-server`.

**Works in shell but not in agent:** your shell has the key, but the agent process does not. Put the key in the MCP server `env` block or launch the agent from a shell that has the variable.
