# SmartMoving CLI epic roadmap

> Unofficial project. This roadmap is for the independent SmartMoving MCP/CLI project. It does not imply SmartMoving endorsement, sponsorship, certification, or support.

## Goal

Turn the package into a first-class command line tool plus MCP server for humans, scripts, CI, and AI agents.

The package should feel like a serious CLI:

```bash
npm install -g smartmoving-mcp-server
smartmoving init
smartmoving doctor
smartmoving ping
smartmoving schema --json
smartmoving leads list --page-size 10 --json
smartmoving opportunities get <id> --include-jobs --json
smartmoving mcp config --print-hermes
```

One-line onboarding should work after npm publish:

```bash
npx -y smartmoving-mcp-server init
```

Non-interactive agent setup should work too:

```bash
SMARTMOVING_API_KEY="..." npx -y smartmoving-mcp-server doctor --json
```

## Current state

The CLI MVP exposes a small read-only command set:

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

The MCP server exposes 62 tools:

| Group | Count |
| --- | ---: |
| communication | 2 |
| customers | 8 |
| followups | 6 |
| inventory | 7 |
| jobs | 10 |
| leads | 8 |
| opportunities | 9 |
| reference | 12 |

## Product principles

1. One package, two great interfaces: CLI and MCP.
2. CLI and MCP share one operation registry.
3. CLI eventually exposes all 62 MCP tools as commands.
4. `--json` prints stable machine-readable stdout only.
5. Human progress, warnings, and prompts go to stderr.
6. Read-only commands work by default.
7. Writes require explicit enablement.
8. Destructive actions require a second explicit gate and confirmation.
9. Every command has help, schema, examples, tests, and docs.
10. AI agents can discover the command contract without scraping help text.
11. API keys are never printed, committed, or passed as command arguments.
12. CI uses mocked tests. Live API tests are opt-in only.

## Shared architecture

Avoid writing the same operation twice.

Target architecture:

```txt
operation registry
  -> MCP tool registration
  -> CLI command registration
  -> schema output
  -> generated docs
  -> coverage tests
```

Suggested registry entry:

```ts
export interface OperationDefinition {
  name: string;
  group: "customers" | "leads" | "opportunities" | "jobs" | "inventory" | "followups" | "communication" | "reference";
  cli: {
    command: string;
    description: string;
    examples: string[];
  };
  safety: "read" | "write" | "destructive";
  inputSchema: z.ZodObject<any>;
  handler: (client: SmartMovingClient, input: unknown) => Promise<unknown>;
}
```

## Safety model

Default posture:

```txt
writes: disabled
destructive: disabled
```

Writes require one of:

```bash
SMARTMOVING_ALLOW_WRITES=true smartmoving leads create --input lead.json --dry-run
smartmoving --allow-writes leads create --input lead.json --dry-run
```

Destructive commands require both gates and explicit confirmation:

```bash
SMARTMOVING_ALLOW_WRITES=true \
SMARTMOVING_ALLOW_DESTRUCTIVE=true \
smartmoving jobs delete <jobId> --opportunity-id <opportunityId> --yes
```

JSON mode must never hang on an interactive confirmation. If a write or destructive command needs confirmation and `--yes` is absent, JSON mode should fail with a stable error.

## Core commands to add

### Setup and diagnostics

```bash
smartmoving init
smartmoving doctor
smartmoving profiles list
smartmoving profiles use <name>
smartmoving mcp config --print-hermes
smartmoving mcp config --print-claude
smartmoving mcp config --print-json
```

### Discovery and automation

```bash
smartmoving --help
smartmoving schema --json
smartmoving reference all --json
smartmoving agent safety --json
smartmoving agent examples --json
```

### Read-only operations

```bash
smartmoving leads list --page-size 25 --json
smartmoving leads get <leadId> --json
smartmoving customers search "John Smith" --json
smartmoving opportunities get <id> --include-jobs --include-follow-ups --json
smartmoving jobs by-opportunity <opportunityId> --json
smartmoving inventory opportunity <opportunityId> --json
smartmoving followups list --opportunity-id <id> --json
```

### Safe writes

```bash
smartmoving leads create --input lead.json --dry-run
smartmoving followups create --opportunity-id <id> --input followup.json --dry-run
smartmoving jobs notes append <jobId> --opportunity-id <oppId> --text "Customer requested morning arrival." --dry-run
```

## Loop plan index

Detailed loop plans live in `docs/plans/`:

1. `docs/plans/01-cli-init-doctor.md`
2. `docs/plans/02-cli-schema-and-registry.md`
3. `docs/plans/03-cli-read-tools.md`
4. `docs/plans/04-cli-write-tools.md`
5. `docs/plans/05-cli-destructive-safety.md`
6. `docs/plans/06-agent-ux.md`
7. `docs/plans/07-docs-site-and-command-index.md`
8. `docs/plans/08-packaging-release-smoke.md`

## Required verification for every CLI PR

```bash
cd mcp-server
npm run build
npm test
npm audit --audit-level=high
node dist/cli.js --help
npm pack --dry-run
```

After Loop 2 lands, also run:

```bash
node dist/cli.js schema --json
node dist/cli.js doctor --json
```

## Definition of epic

The CLI is epic when this works safely and predictably:

```bash
npm install -g smartmoving-mcp-server
smartmoving init
smartmoving doctor
smartmoving schema --json
smartmoving reference branches --json
smartmoving leads list --page-size 10 --json
smartmoving mcp config --print-hermes
```

And an AI agent can report:

> I discovered 62 SmartMoving operations. Writes are disabled. Destructive operations are disabled. I can read leads, customers, opportunities, jobs, inventory, follow-ups, reference data, and communication records. To mutate data, enable writes explicitly and approve a dry-run first.
