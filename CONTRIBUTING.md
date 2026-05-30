# Contributing to SmartMoving MCP

Thanks for helping improve the SmartMoving MCP server. This project exists so AI agents can safely and reliably work with the SmartMoving External API.

## Contribution workflow

You can contribute with code, docs, agent feedback, or plain operational notes. If something is missing, confusing, or fragile, open an issue. If you already know the fix, fork the repo and send a pull request.

1. Fork the repository.
2. Create a branch from `main`.
3. Make your change.
4. Run verification locally.
5. Open a pull request.
6. A maintainer reviews, requests changes if needed, then merges.

AI-agent-assisted contributions are welcome. You may use Claude Code, Codex, Cursor, OpenCode, Hermes Agent, or another coding agent to draft changes. Please review generated code before submitting. Agents can write the patch, but the human contributor owns the PR.

Maintainers should keep `main` protected and require pull requests for external contributions.

For agent-specific repo instructions, see [`AGENTS.md`](./AGENTS.md).

## Good first contributions

No code required:

- Report confusing install steps.
- Report tools your agent could not discover or use correctly.
- Suggest workflows that would save time in sales, dispatch, billing, inventory, or follow-ups.
- Document SmartMoving API quirks discovered from real use, using fake examples only.

Code/docs contributions:

- Add missing SmartMoving endpoints as MCP tools.
- Add mocked tests for existing tools.
- Improve schemas and tool descriptions so agents call the API correctly.
- Document SmartMoving API quirks discovered from live use.
- Improve error messages and validation.
- Add workflow examples for sales, dispatch, billing, supply reconciliation, and customer communication.

## Local setup

```bash
git clone https://github.com/MattyMailers/smartmoving-mcp.git
cd smartmoving-mcp/mcp-server
npm install
npm run build
npm audit --audit-level=high
```

## Secrets policy

Never commit:

- SmartMoving API keys
- Customer names, phone numbers, emails, addresses, quote numbers, or payment data from a real account
- Screenshots containing private CRM data
- Agent logs containing real API responses

Use placeholders in docs and tests.

## Pull request checklist

Before opening a PR:

- [ ] `npm run build` passes from `mcp-server/`.
- [ ] `npm audit --audit-level=high` passes or the PR explains why not.
- [ ] New tools include Zod schemas with useful descriptions.
- [ ] New tools return JSON text through MCP content blocks.
- [ ] Write endpoints are clearly labeled Premium and destructive tools are described as destructive.
- [ ] Docs are updated if behavior, tools, or setup changed.
- [ ] No secrets or real customer data are committed.

## Tool design standards

Every tool should have:

- A clear name using snake_case.
- A practical description that tells an agent when to use it.
- Parameter descriptions with enum meanings when applicable.
- Conservative defaults.
- Explicit warnings for replace/delete/closed-job behavior.
- Error responses marked with `isError: true`.

## Testing direction

The repo currently relies on TypeScript build and npm audit. The next serious upgrade is a mocked test suite:

- Mock `SmartMovingClient` for each tool module.
- Assert correct endpoint paths and query parameter casing.
- Assert request body shape for create/update tools.
- Assert failure paths return `isError: true`.
- Add live tests only behind an explicit env flag, never by default.

## Maintainer merge workflow

Recommended GitHub settings before going public:

- Protect `main`.
- Require PR review before merge.
- Require status checks.
- Require branches to be up to date before merge.
- Disable force-pushes to `main`.
- Use squash merge for clean history.

Suggested labels:

- `bug`
- `docs`
- `good first issue`
- `help wanted`
- `missing endpoint`
- `smartmoving quirk`
- `security`
- `tests`
