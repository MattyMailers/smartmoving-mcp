# SmartMoving CLI MVP

> **Unofficial project.** This CLI is an independent, community-maintained terminal interface for authorized SmartMoving External API users. It is not affiliated with, endorsed by, sponsored by, or certified by SmartMoving, LLC. Use your own authorized API key, follow your SmartMoving agreement, and use at your own risk.

The `smartmoving` CLI is a guarded MVP built from the same TypeScript package as the MCP server. It is intended for terminal agents, shell scripts, local debugging, and quick API smoke tests. It does **not** replace the MCP server for agent-native workflows.

## MCP vs CLI positioning

- Use the **MCP server** when an MCP-compatible agent should discover SmartMoving tools and call them through tool-use permissions.
- Use the **CLI** when a terminal agent, script, or human wants explicit commands such as `smartmoving ping` or JSON output for piping into another program.
- Both entrypoints use the same SmartMoving API client and environment variables.
- The CLI exposes read operations, guarded write commands, and a very small set of destructive commands with extra safety gates.

## Safety posture

This CLI can read and, when explicitly enabled, write live CRM data. It is provided **as is** and used at your own risk. The maintainers are not responsible for incorrect results, data loss, duplicate or missing records, downtime, account issues, business interruption, or other problems arising from use.

For this MVP:

- `SMARTMOVING_API_KEY` is required.
- Do not pass API keys as command arguments.
- Output may contain CRM data returned by your authorized account; handle it carefully.
- CLI writes are disabled by default. Write commands require `SMARTMOVING_ALLOW_WRITES=true` or the top-level `--allow-writes` flag.
- CLI destructive commands require all three: `SMARTMOVING_ALLOW_WRITES=true`, `SMARTMOVING_ALLOW_DESTRUCTIVE=true`, and `--yes`. Dry-run does not require those gates and never calls SmartMoving.
- Prefer `--dry-run` first. Dry-run validates the input JSON and prints the request method/path/body without calling SmartMoving.
- JSON mode never prompts interactively. Real writes require `--yes`; without `--yes`, enabled write commands still return dry-run output.
- MCP destructive tools also require both `SMARTMOVING_ALLOW_WRITES=true` and `SMARTMOVING_ALLOW_DESTRUCTIVE=true`.

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
# Only for intentional delete-style operations:
# export SMARTMOVING_ALLOW_DESTRUCTIVE="false"
# Optional override, normally not needed:
# export SMARTMOVING_BASE_URL="https://api-public.smartmoving.com/v1"
```

Variables used by the package:

- `SMARTMOVING_API_KEY`: required. Must belong to an authorized SmartMoving API user.
- `SMARTMOVING_BASE_URL`: optional. Defaults to `https://api-public.smartmoving.com/v1`.
- `SMARTMOVING_CONFIG_PATH`: optional CLI config path override, useful for tests and isolated agent profiles. Defaults to `~/.config/smartmoving/config.json`.
- `SMARTMOVING_ALLOW_WRITES`: optional. Enables guarded CLI write commands and MCP write tools. Defaults to read-only behavior.
- `SMARTMOVING_ALLOW_DESTRUCTIVE`: optional. Enables CLI/MCP destructive commands only when writes are also enabled and the CLI command includes `--yes`.

## First-run CLI config

Create a local CLI profile without storing a raw API key:

```bash
node dist/cli.js init --yes --profile default --api-key-env SMARTMOVING_API_KEY
```

This writes `~/.config/smartmoving/config.json` by default:

```json
{
  "version": 1,
  "defaultProfile": "default",
  "profiles": {
    "default": {
      "baseUrl": "https://api-public.smartmoving.com/v1",
      "apiKeyEnv": "SMARTMOVING_API_KEY"
    }
  }
}
```

The config stores the environment variable name only. Keep the real API key in your shell, agent config, keychain, or another private secret store.

Run diagnostics:

```bash
node dist/cli.js doctor
node dist/cli.js doctor --json
```

`doctor --json` writes machine-readable JSON only to stdout and reports missing-key failures with a stable error shape such as `AUTH_MISSING`.

## Run from built `dist`

```bash
node dist/cli.js --help
node dist/cli.js init --yes --profile default --api-key-env SMARTMOVING_API_KEY
node dist/cli.js doctor --json
node dist/cli.js mcp config --print-json
node dist/cli.js schema --json
node dist/cli.js docs generate --json
node dist/cli.js schema --group leads --json
node dist/cli.js schema --safety read --json
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

## JSON output contract

Read commands that call SmartMoving support `--json`, `--plain`, `--quiet`, and `--verbose`. Successful `--json` read output is wrapped for scripts:

```json
{
  "ok": true,
  "data": {}
}
```

Read failures with `--json` return stable JSON with `ok: false` and redact API keys from error text.

Write commands disabled by default return this stable JSON error without making an HTTP request:

```json
{
  "ok": false,
  "error": {
    "code": "WRITES_DISABLED",
    "message": "Write operations are disabled by default.",
    "hint": "Set SMARTMOVING_ALLOW_WRITES=true or use --allow-writes, then run with --dry-run first."
  }
}
```

Destructive commands disabled by default return this stable JSON error without making an HTTP request:

```json
{
  "ok": false,
  "error": {
    "code": "DESTRUCTIVE_DISABLED",
    "message": "Destructive operations are disabled by default.",
    "hint": "Set SMARTMOVING_ALLOW_WRITES=true and SMARTMOVING_ALLOW_DESTRUCTIVE=true, then pass --yes."
  }
}
```

Successful write commands with `--json` use the same `{ "ok": true, "data": ... }` wrapper as reads. Dry-runs return `{ "ok": true, "dryRun": true, "request": { "method": "POST", "path": "...", "body": {} } }` and do not call SmartMoving.

## Generated command docs

The command reference under [`docs/commands/`](./commands/README.md) is generated from the same operation registry as `schema --json`:

```bash
node dist/cli.js docs generate --json
```

By default this writes `../docs/commands` when run from `mcp-server/`. For tests or preview output, pass `--output-dir <dir>`. The generated pages include command text, description, safety level, arguments, options, examples, JSON output notes, related MCP tool, and common failure modes.

Regenerate command docs whenever `mcp-server/src/operations/registry.ts` changes.

## Commands in the MVP

```bash
smartmoving ping
smartmoving init --yes --profile default --api-key-env SMARTMOVING_API_KEY
smartmoving doctor --json
smartmoving mcp config --print-hermes
smartmoving mcp config --print-claude
smartmoving mcp config --print-json
smartmoving schema --json
smartmoving schema --group leads --json
smartmoving schema --safety read --json
smartmoving docs generate --json
smartmoving reference all --json
smartmoving reference branches --json
smartmoving reference move-sizes --json
smartmoving reference referral-sources --json
smartmoving reference service-types --json
smartmoving reference tariffs --json
smartmoving reference tariff-materials <tariffId> --json
smartmoving reference users --json
smartmoving reference arrival-windows --json
smartmoving reference bad-lead-reasons --json
smartmoving reference cancellation-reasons --json
smartmoving reference lost-reasons --json
smartmoving customers list --page-size 25 --json
smartmoving customers get <customerId> --json
smartmoving customers create --input customer.json --dry-run --json
smartmoving customers update <customerId> --input customer.json --dry-run --json
smartmoving customers search <query> --json
smartmoving customers opportunities <customerId> --json
smartmoving customers storage-accounts <customerId> --json
smartmoving customers service-tickets <customerId> --json
smartmoving leads list --page-size 25 --json
smartmoving leads get <leadId> --json
smartmoving leads create --input lead.json --dry-run --json
smartmoving leads update <leadId> --input lead.json --dry-run --json
smartmoving leads patch <leadId> --input patch.json --dry-run --json
smartmoving leads convert <leadId> --input convert.json --dry-run --json
smartmoving leads by-salesperson <userId> --json
smartmoving leads statuses --json
smartmoving opportunities get <opportunityId> --json
smartmoving opportunities by-quote <quoteNumber> --json
smartmoving opportunities create --input opportunity.json --dry-run --json
smartmoving opportunities update <opportunityId> --input opportunity.json --dry-run --json
smartmoving opportunities attachments add <opportunityId> --file path.pdf --dry-run --json
smartmoving opportunities rooms create <opportunityId> --input rooms.json --dry-run --json
smartmoving opportunities audit <opportunityId> --json
smartmoving opportunities documents <opportunityId> --json
smartmoving opportunities payments <opportunityId> --json
smartmoving jobs by-opportunity <opportunityId> --json
smartmoving jobs get <jobId> --opportunity-id <opportunityId> --json
smartmoving jobs delete <jobId> --opportunity-id <opportunityId> --dry-run --json
smartmoving jobs confirm <jobId> --opportunity-id <opportunityId> --dry-run --json
smartmoving jobs notes <jobId> --opportunity-id <opportunityId> --json
smartmoving jobs notes update <jobId> --opportunity-id <opportunityId> --input notes.json --dry-run --json
smartmoving jobs notes append <jobId> --opportunity-id <opportunityId> --text "Synthetic note" --dry-run --json
smartmoving jobs stops update <jobId> --opportunity-id <opportunityId> --input stops.json --dry-run --json
smartmoving jobs materials add <jobId> --opportunity-id <opportunityId> --input materials.json --dry-run --json
smartmoving inventory opportunity <opportunityId> --json
smartmoving inventory master --json
smartmoving inventory room-types --json
smartmoving inventory remove-item <itemId> --opportunity-id <opportunityId> --room-id <roomId> --dry-run --json
smartmoving inventory submit-review <opportunityId> --dry-run --json
smartmoving followups list --opportunity-id <opportunityId> --json
smartmoving followups get <followupId> --opportunity-id <opportunityId> --json
smartmoving followups due --opportunity-id <opportunityId> --json
smartmoving followups create --opportunity-id <opportunityId> --input followup.json --dry-run --json
smartmoving followups update <followupId> --opportunity-id <opportunityId> --input followup.json --dry-run --json
smartmoving followups delete <followupId> --opportunity-id <opportunityId> --dry-run --json
smartmoving communication note --input note.json --dry-run --json
smartmoving communication call --input call.json --dry-run --json
```

Notes:

- `schema --json` prints the shared operation registry contract for all 62 MCP tools without requiring an API key. It includes each operation name, group, safety level, CLI metadata, MCP tool name, output modes, and stable exit codes.
- Use `schema --group <group> --json` or `schema --safety <read|write|destructive> --json` to filter schema output for agents and command generators.
- `jobs get` requires the parent opportunity ID because the SmartMoving v1 Premium job detail endpoint is nested under an opportunity.
- `followups list`, `followups get`, and `followups due` are scoped to one opportunity because the current SmartMoving v1 API surface does not expose an account-wide due-followups endpoint.
- Use `--json` for machine-readable output. Without `--json`, the CLI prints a simple human-readable wrapper around the API response.
- To execute a destructive command for real, set both `SMARTMOVING_ALLOW_WRITES=true` and `SMARTMOVING_ALLOW_DESTRUCTIVE=true`, then pass `--yes`. Prefer `--dry-run` first and never run live destructive examples from tests or CI.

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

- Live API tests in CI.
- npm publishing.
- Splitting a dedicated `smartmoving-cli` package.
