# SmartMoving MCP Server

SmartMoving MCP Server exposes the SmartMoving External API v1 as MCP tools for AI agents. It lets Claude Desktop, Claude Code, Codex, Hermes Agent, OpenClaw, and other MCP-compatible agents read and update a moving-company CRM through a local stdio server.

Current status: release-prep branch for first public `0.1.0` launch. Production-used internally at iHaul iMove, with safety gates added for external adopters.

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

See [`mcp-server/README.md`](./mcp-server/README.md) for the full tool catalog and [`docs/SAMPLE-PROMPTS.md`](./docs/SAMPLE-PROMPTS.md) for copy-paste prompts and workflow ideas.

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
│   ├── FORK-AND-CONTRIBUTE.md
│   ├── SAMPLE-PROMPTS.md
│   ├── RELEASE.md
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

The easiest public install path is npm/npx:

```bash
npx smartmoving-mcp-server
```

For local development from source:

```bash
git clone https://github.com/MattyMailers/smartmoving-mcp.git
cd smartmoving-mcp/mcp-server
npm install
npm run build

export SMARTMOVING_API_KEY="replace-with-your-key"
export SMARTMOVING_ALLOW_WRITES="false"
npm start
```

The server uses stdio, so it is normally launched by an MCP client rather than run manually in a terminal.

## Safety modes

The public server is designed to be safe on first install:

- Read operations are always available with a valid `SMARTMOVING_API_KEY`.
- POST, PUT, and PATCH requests are blocked unless `SMARTMOVING_ALLOW_WRITES=true`.
- DELETE requests are blocked unless both `SMARTMOVING_ALLOW_WRITES=true` and `SMARTMOVING_ALLOW_DESTRUCTIVE=true`.

Recommended first-run config:

```bash
SMARTMOVING_API_KEY="replace-with-your-key"
SMARTMOVING_ALLOW_WRITES="false"
```

Only enable writes after you trust the agent workflow:

```bash
SMARTMOVING_ALLOW_WRITES="true"
```

Only enable destructive operations when you intentionally want delete-style tools available:

```bash
SMARTMOVING_ALLOW_DESTRUCTIVE="true"
```

## Secrets and API keys

Do **not** commit real SmartMoving API keys.

Use one of these safe patterns:

1. Store the key in your MCP client's private config `env` block.
2. Store the key in your shell, password manager, or agent `.env` file outside the repo.
3. Use `.env.example` only as a template.

The repo ignores `.env` and `.env.local`. The server only reads:

- `SMARTMOVING_API_KEY`, required
- `SMARTMOVING_BASE_URL`, optional override
- `SMARTMOVING_ALLOW_WRITES`, optional. Set to `true` to allow POST, PUT, and PATCH tools. Defaults to read-only.
- `SMARTMOVING_ALLOW_DESTRUCTIVE`, optional. Set to `true` to allow DELETE tools. Requires writes to be enabled too.

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
npm test
npm audit --audit-level=high
```

There is now a small mocked test harness for the SmartMoving HTTP client and safety gates. The highest-value next step is expanding mocked tests across every tool module.

## SmartMoving caveat discovered from live use

SmartMoving's public `v1` API behaves differently across old/new opportunity models:

- 1.0-style jobs can expose item-level `actualMaterials` and charge details.
- 2.0-style/type-4 jobs may expose only audit events like "Materials updated... Old total... new total..." while Premium job detail returns empty material/charge arrays.

Before using this as supply or revenue truth, read [`docs/OPPORTUNITY-V1-V2-LIMITATIONS.md`](./docs/OPPORTUNITY-V1-V2-LIMITATIONS.md).

## Contribution model

This project is meant to improve over time with feedback from operators, developers, and AI-agent builders.

Ways to help:

1. Open an issue for bugs, missing endpoints, confusing tool descriptions, install problems, or SmartMoving API quirks.
2. Share workflows your agent should be able to run, such as quote prep, dispatch summaries, billing checks, supply reconciliation, or revenue leakage reports.
3. Fork the repo, make a focused change, and submit a pull request.
4. Use your own AI coding agent to draft improvements, then review the diff before opening a PR.

Recommended open-source workflow:

1. Keep `main` protected.
2. Contributors fork the repo.
3. They open pull requests from their fork.
4. GitHub Actions runs build/audit/tests.
5. Maintainers review and merge.
6. Issues are used for bugs, missing endpoints, agent feedback, and SmartMoving API quirks.

AI-agent-assisted contributions are welcome from Claude Code, Codex, Cursor, OpenCode, Hermes Agent, or any MCP-capable coding workflow. Agents can draft patches. Humans should still review before submitting.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md), [`AGENTS.md`](./AGENTS.md), [`docs/FORK-AND-CONTRIBUTE.md`](./docs/FORK-AND-CONTRIBUTE.md), [`docs/SAMPLE-PROMPTS.md`](./docs/SAMPLE-PROMPTS.md), [`docs/ROADMAP.md`](./docs/ROADMAP.md), [`docs/RELEASE.md`](./docs/RELEASE.md), and [`CHANGELOG.md`](./CHANGELOG.md).

## License

MIT. See [`LICENSE`](./LICENSE).
