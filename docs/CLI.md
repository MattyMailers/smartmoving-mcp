# SmartMoving CLI MVP

> **Unofficial project.** This CLI is an independent, community-maintained terminal interface for authorized SmartMoving External API users. It is not affiliated with, endorsed by, sponsored by, or certified by SmartMoving, LLC. Use your own authorized API key, follow your SmartMoving agreement, and use at your own risk.

The `smartmoving` CLI is a read-only MVP built from the same TypeScript package as the MCP server. It is intended for terminal agents, shell scripts, local debugging, and quick API smoke tests. It does **not** replace the MCP server for agent-native workflows.

## MCP vs CLI positioning

- Use the **MCP server** when an MCP-compatible agent should discover SmartMoving tools and call them through tool-use permissions.
- Use the **CLI** when a terminal agent, script, or human wants explicit commands such as `smartmoving ping` or JSON output for piping into another program.
- Both entrypoints use the same SmartMoving API client and environment variables.
- This first CLI loop intentionally exposes a small read-only command set, not every MCP tool.

## Safety posture

This CLI can read live CRM data. It is provided **as is** and used at your own risk. The maintainers are not responsible for incorrect results, downtime, account issues, business interruption, or other problems arising from use.

For this MVP:

- `SMARTMOVING_API_KEY` is required.
- Do not pass API keys as command arguments.
- Output may contain CRM data returned by your authorized account; handle it carefully.
- CLI commands are read-only. No create, update, delete, payment, attachment, or job-closing commands are exposed.
- The package still supports MCP write tools only when `SMARTMOVING_ALLOW_WRITES=true` is set, and destructive MCP tools only when both `SMARTMOVING_ALLOW_WRITES=true` and `SMARTMOVING_ALLOW_DESTRUCTIVE=true` are set.

## Install from a local clone

```bash
git clone https://github.com/MattyMailers/smartmoving-mcp.git
cd smartmoving-mcp/mcp-server
npm install
npm run build
```

For Matt's existing local checkout:

```bash
cd /Users/matthewyoung/.hermes/plugins/smartmoving-mcp/smartmoving-api/mcp-server
npm install
npm run build
```

## Environment variables

```bash
export SMARTMOVING_API_KEY="replace-with-your-key"
export SMARTMOVING_ALLOW_WRITES="false"
# Optional override, normally not needed:
# export SMARTMOVING_BASE_URL="https://api-public.smartmoving.com/v1"
```

Variables used by the package:

- `SMARTMOVING_API_KEY`: required. Must belong to an authorized SmartMoving API user.
- `SMARTMOVING_BASE_URL`: optional. Defaults to `https://api-public.smartmoving.com/v1`.
- `SMARTMOVING_ALLOW_WRITES`: optional. Used by MCP write tools, not by the read-only CLI MVP. Defaults to read-only behavior.
- `SMARTMOVING_ALLOW_DESTRUCTIVE`: optional. Used by MCP destructive tools only when writes are also enabled.

## Run from built `dist`

```bash
node dist/cli.js --help
node dist/cli.js ping
node dist/cli.js leads list --page-size 10 --json
node dist/cli.js reference branches --json
```

With the required environment variable inline:

```bash
SMARTMOVING_API_KEY="replace-with-your-key" node dist/cli.js ping
SMARTMOVING_API_KEY="replace-with-your-key" node dist/cli.js reference branches --json
SMARTMOVING_API_KEY="replace-with-your-key" node dist/cli.js reference move-sizes --json
SMARTMOVING_API_KEY="replace-with-your-key" node dist/cli.js leads list --page-size 10 --json
```

## Commands in the MVP

```bash
smartmoving ping
smartmoving reference branches --json
smartmoving reference move-sizes --json
smartmoving customers get <customerId> --json
smartmoving leads list --page-size 25 --json
smartmoving opportunities get <opportunityId> --json
smartmoving jobs get <jobId> --opportunity-id <opportunityId> --json
smartmoving followups due --opportunity-id <opportunityId> --json
```

Notes:

- `jobs get` requires the parent opportunity ID because the SmartMoving v1 Premium job detail endpoint is nested under an opportunity.
- `followups due` is scoped to one opportunity because the current SmartMoving v1 API surface does not expose an account-wide due-followups endpoint.
- Use `--json` for machine-readable output. Without `--json`, the CLI prints a simple human-readable wrapper around the API response.

## Future npm/npx usage

This PR must not publish to npm. After maintainers decide to publish a package version, the package binary is expected to expose both:

```bash
smartmoving-mcp-server
smartmoving
```

Possible future usage after publication:

```bash
SMARTMOVING_API_KEY="replace-with-your-key" npx -y --package smartmoving-mcp-server smartmoving ping
```

Depending on npm binary resolution, users may also install globally or run the package-provided `smartmoving` binary directly. The first PR is only meant to prove local clone, build, and packed-package behavior.

## Deferred intentionally

- Write commands.
- Destructive commands.
- Full coverage of all 62 MCP tools.
- Live API tests in CI.
- npm publishing.
- Splitting a dedicated `smartmoving-cli` package.
