# SmartMoving MCP Server

SmartMoving MCP Server exposes the SmartMoving External API v1 as MCP tools for AI agents. It lets Claude Desktop, Claude Code, Codex, Hermes Agent, OpenClaw, and other MCP-compatible agents read and update a moving-company CRM through a local stdio server.

Current status: private repo, production-used internally at iHaul iMove, prepared for eventual open-source release.

## What it can do

The server currently registers **62 MCP tools** across eight areas:

- **Customers:** list, get, search, create, update, customer opportunities, storage accounts, service tickets
- **Leads:** list, get, create, update, patch, salesperson lead lookup, convert to opportunity, lead statuses
- **Opportunities:** get by ID or quote number, create, update, audit activity, documents, payments, attachments, rooms
- **Jobs:** list by opportunity, get detailed job, create, delete, confirm, notes, stops, estimated materials
- **Inventory:** opportunity inventory, room items, master inventory, room types, submit review
- **Follow-ups:** list, get, create, update, delete, complete
- **Communication:** log calls, log notes
- **Reference data:** branches, move sizes, referral sources, service types, tariffs, tariff materials, users, arrival windows, reasons, ping

See [`mcp-server/README.md`](./mcp-server/README.md) for the full tool catalog.

## Repository layout

```text
smartmoving-api/
├── README.md
├── .env.example
├── openapi.json
├── docs/
│   ├── AGENT-INSTALL.md
│   ├── AUTHENTICATION.md
│   ├── BEST-PRACTICES.md
│   ├── ENDPOINTS.md
│   ├── ENUMS.md
│   ├── OPPORTUNITY-V1-V2-LIMITATIONS.md
│   ├── ROADMAP.md
│   ├── SCHEMAS.md
│   └── WORKFLOWS.md
└── mcp-server/
    ├── src/
    ├── dist/
    ├── package.json
    └── README.md
```

## Quick start

```bash
git clone https://github.com/MattyMailers/smartmoving-mcp.git
cd smartmoving-mcp/mcp-server
npm install
npm run build

export SMARTMOVING_API_KEY="replace-with-your-key"
npm start
```

The server uses stdio, so it is normally launched by an MCP client rather than run manually in a terminal.

## Secrets and API keys

Do **not** commit real SmartMoving API keys.

Use one of these safe patterns:

1. Store the key in your MCP client's private config `env` block.
2. Store the key in your shell, password manager, or agent `.env` file outside the repo.
3. Use `.env.example` only as a template.

The repo ignores `.env` and `.env.local`. The server only reads:

- `SMARTMOVING_API_KEY`, required
- `SMARTMOVING_BASE_URL`, optional override

Matt's local key is stored privately in `~/.hermes/.env`, not in this repo.

## Agent install guides

Use [`docs/AGENT-INSTALL.md`](./docs/AGENT-INSTALL.md) for copy-paste setup examples for:

- Claude Desktop
- Claude Code
- Codex-style MCP config
- Hermes Agent
- OpenClaw-style MCP config
- Any generic MCP stdio client

## Development

```bash
cd mcp-server
npm install
npm run build
npm audit --audit-level=high
```

There is no dedicated test suite yet. TypeScript build plus npm audit are the current verification gates. The highest-value next step is adding mocked HTTP-client tests around every tool module.

## SmartMoving caveat discovered from live use

SmartMoving's public `v1` API behaves differently across old/new opportunity models:

- 1.0-style jobs can expose item-level `actualMaterials` and charge details.
- 2.0-style/type-4 jobs may expose only audit events like "Materials updated... Old total... new total..." while Premium job detail returns empty material/charge arrays.

Before using this as supply or revenue truth, read [`docs/OPPORTUNITY-V1-V2-LIMITATIONS.md`](./docs/OPPORTUNITY-V1-V2-LIMITATIONS.md).

## Contribution model

Recommended open-source workflow:

1. Keep `main` protected.
2. Contributors fork the repo.
3. They open pull requests from their fork.
4. GitHub Actions runs build/audit/tests.
5. Maintainers review and merge.
6. Issues are used for bugs, missing endpoints, and SmartMoving API quirks.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`docs/ROADMAP.md`](./docs/ROADMAP.md).

## License

MIT. See [`LICENSE`](./LICENSE).
