# SmartMoving MCP Server

MCP (Model Context Protocol) server exposing the SmartMoving External API v1 as 55 tools for AI assistants (Claude, ChatGPT, etc.). Used internally at iHaul iMove for CRM automation.

## What's in here

```
smartmoving-api/
├── docs/                  # Full API reference
│   ├── AUTHENTICATION.md
│   ├── BEST-PRACTICES.md
│   ├── ENDPOINTS.md
│   ├── ENUMS.md
│   ├── README.md
│   ├── SCHEMAS.md
│   └── WORKFLOWS.md
├── mcp-server/            # The MCP server (Node 18+, TypeScript)
│   ├── src/
│   ├── dist/              # Pre-built (npm run build to refresh)
│   ├── package.json
│   └── README.md          # Tool catalog (55 tools)
└── openapi.json           # Full OpenAPI 3 spec
```

## Quick install

```bash
cd mcp-server
npm install
npm run build
```

## Use via mcporter

Add to `~/.mcporter/mcporter.json`:

```json
{
  "mcpServers": {
    "smartmoving": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "SMARTMOVING_API_KEY": "YOUR_KEY_HERE"
      }
    }
  }
}
```

Then verify: `mcporter list` should show `smartmoving — 60 tools healthy`.

## Use via Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "smartmoving": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "SMARTMOVING_API_KEY": "YOUR_KEY_HERE"
      }
    }
  }
}
```

## Key tools (most used)

| Tool | Purpose |
|---|---|
| `search_customers` | Find customer by name/phone/email |
| `get_customer_opportunities` | List jobs/quotes for a customer |
| `log_note` | Add internal note to opportunity (Premium) |
| `log_call` | Log a phone call to opportunity (Premium) |
| `update_job_notes` | Update notes on a specific job |
| `create_followup` | Schedule a callback reminder |

See `mcp-server/README.md` for the full 55-tool catalog organized by tier (Basic vs Premium).

## API auth

Header-based: `x-api-key: <YOUR_KEY>`. Premium tier required for write endpoints (notes, calls, follow-ups).

## License

Internal — MattyMailers / iHaul iMove.
