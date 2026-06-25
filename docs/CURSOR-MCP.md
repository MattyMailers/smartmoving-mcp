# Install SmartMoving MCP in Cursor

> **Unofficial project.** Independent MCP bridge for authorized SmartMoving customers. Not affiliated with SmartMoving, LLC. Use your own API key and follow your SmartMoving agreement.

[Cursor](https://cursor.com) connects to MCP servers through `mcp.json`. SmartMoving MCP is a **stdio** server: Cursor launches `npx smartmoving-mcp-server` or `node /path/to/mcp-server/dist/index.js` and passes credentials through the `env` block.

**Start in read-only mode.** Enable writes only after you trust the agent workflow.

## Prerequisites

- [Cursor](https://cursor.com/download) with MCP support
- **Node.js 18+** (`node --version`)
- A valid **`SMARTMOVING_API_KEY`** from an authorized SmartMoving account

## Where to put the config

| Scope | Path | Use when |
| --- | --- | --- |
| **Global** (all projects) | macOS/Linux: `~/.cursor/mcp.json` | Personal SmartMoving access everywhere |
| | Windows: `%USERPROFILE%\.cursor\mcp.json` | |
| **Project** (one repo) | `.cursor/mcp.json` in the project root | Team-shared setup (use placeholders, not real keys) |

If the same server name exists in both files, **project config wins**.

### Open the config from Cursor UI

1. **Cursor Settings** → **Tools & MCP**
2. Click **New MCP Server** (opens or creates `mcp.json`)

After editing, reload: **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) → **Developer: Reload Window**.

See [Cursor MCP docs](https://cursor.com/docs/mcp) for `type`, `envFile`, and variable interpolation (`${env:NAME}`, `${userHome}`, `${workspaceFolder}`).

## Option A: npx install (recommended)

Use this after [`smartmoving-mcp-server`](https://www.npmjs.com/package/smartmoving-mcp-server) is published to npm, or when npx can resolve the package.

**Read-only first run** (recommended):

```json
{
  "mcpServers": {
    "smartmoving": {
      "type": "stdio",
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

### Enable writes later

Allow create/update tools (`POST`, `PUT`, `PATCH`):

```json
"SMARTMOVING_ALLOW_WRITES": "true"
```

Allow delete-style tools (requires writes too):

```json
"SMARTMOVING_ALLOW_WRITES": "true",
"SMARTMOVING_ALLOW_DESTRUCTIVE": "true"
```

## Option B: Local clone

Build once:

```bash
git clone https://github.com/MattyMailers/smartmoving-mcp.git
cd smartmoving-mcp/mcp-server
npm install
npm run build
```

**macOS / Linux** — use an absolute path to `dist/index.js`:

```json
{
  "mcpServers": {
    "smartmoving": {
      "type": "stdio",
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

**Windows** — escape backslashes in JSON:

```json
{
  "mcpServers": {
    "smartmoving": {
      "type": "stdio",
      "command": "node",
      "args": ["C:\\dev\\smartmoving-mcp\\mcp-server\\dist\\index.js"],
      "env": {
        "SMARTMOVING_API_KEY": "replace-with-your-key",
        "SMARTMOVING_ALLOW_WRITES": "false"
      }
    }
  }
}
```

## Optional: load secrets from a file

Keep keys out of committed config. Point `envFile` at a local `.env` (never commit real keys):

```json
{
  "mcpServers": {
    "smartmoving": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "smartmoving-mcp-server"],
      "envFile": "${userHome}/.smartmoving-mcp.env"
    }
  }
}
```

Example `~/.smartmoving-mcp.env` (from [`.env.example`](../.env.example)):

```bash
SMARTMOVING_API_KEY=replace-with-your-key
SMARTMOVING_ALLOW_WRITES=false
SMARTMOVING_ALLOW_DESTRUCTIVE=false
```

Or reference a shell variable in `env` (if your Cursor version supports interpolation):

```json
"env": {
  "SMARTMOVING_API_KEY": "${env:SMARTMOVING_API_KEY}",
  "SMARTMOVING_ALLOW_WRITES": "false"
}
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `SMARTMOVING_API_KEY` | Yes | API key. Never commit or screenshot. |
| `SMARTMOVING_BASE_URL` | No | Default: `https://api-public.smartmoving.com/v1` |
| `SMARTMOVING_ALLOW_WRITES` | No | `true` to allow POST/PUT/PATCH tools. Default: read-only. |
| `SMARTMOVING_ALLOW_DESTRUCTIVE` | No | `true` to allow DELETE tools. Requires writes enabled. |

## Verify it works

1. Reload Cursor after saving `mcp.json`.
2. Open **Cursor Settings** → **Tools & MCP** — `smartmoving` should show as connected (green) with tools listed (~62).
3. In **Agent** or **Chat**, ask:

```text
Ping the SmartMoving MCP server and list the available SmartMoving tools.
```

Expected:

- `ping` returns a SmartMoving API response.
- Tool list includes customers, leads, opportunities, jobs, and reference data tools.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Server not listed | Wrong file path or invalid JSON | Use `.cursor/mcp.json` or `~/.cursor/mcp.json`; validate JSON (no trailing commas). |
| Changes ignored | Cursor not reloaded | **Developer: Reload Window**. |
| Exits immediately | Missing `SMARTMOVING_API_KEY` | Add key to `env` or `envFile`. |
| `node` / `npx` not found | Node not on PATH for Cursor | Install Node 18+; on Windows, restart Cursor after installing Node. |
| 401 Unauthorized | Bad or expired key | Regenerate key in SmartMoving; check for extra spaces. |
| 403 Forbidden | Key lacks Premium API access | Confirm tier for the endpoint. |
| Works in terminal, not in Cursor | Shell has env vars; Cursor does not | Put variables in MCP `env` or `envFile`, not only in the shell profile. |
| Windows path errors | Unescaped `\` in JSON | Use `C:\\path\\to\\index.js` or forward slashes where supported. |
| `npx` hangs on first run | Package download | Wait for first npx fetch; try local clone (Option B) instead. |

## Security notes

- Do **not** commit real API keys in `.cursor/mcp.json` if the repo is public or shared.
- Prefer global `~/.cursor/mcp.json` or `envFile` outside the repo for secrets.
- Keep **read-only** until you have tested agent prompts. See [`NOTICE.md`](../NOTICE.md) and [`README.md`](../README.md#safety-modes).

## Related docs

- [`AGENT-INSTALL.md`](./AGENT-INSTALL.md) — Claude Desktop, Claude Code, Hermes, Codex, OpenClaw
- [`SAMPLE-PROMPTS.md`](./SAMPLE-PROMPTS.md) — example agent workflows
- [`mcp-server/README.md`](../mcp-server/README.md) — full tool catalog
