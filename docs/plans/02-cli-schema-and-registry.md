# Loop 2: CLI schema and shared operation registry

## Objective

Create one source of truth for MCP tools, CLI commands, schema output, docs, and tests.

## Commands to add

```bash
smartmoving schema --json
smartmoving schema --group leads --json
smartmoving schema --safety read --json
```

## Files

- Create: `mcp-server/src/operations/types.ts`
- Create: `mcp-server/src/operations/registry.ts`
- Create: `mcp-server/src/operations/register-cli.ts`
- Create: `mcp-server/src/operations/register-mcp.ts`
- Modify: `mcp-server/src/tools/index.ts`
- Modify: `mcp-server/src/cli.ts`
- Test: `mcp-server/src/cli.test.ts`
- Test: `mcp-server/src/operations/registry.test.ts`
- Docs: `docs/CLI.md`

## Registry contract

Add an operation definition type:

```ts
export interface OperationDefinition {
  name: string;
  group: "customers" | "leads" | "opportunities" | "jobs" | "inventory" | "followups" | "communication" | "reference";
  safety: "read" | "write" | "destructive";
  cli: {
    command: string;
    description: string;
    examples: string[];
  };
  mcp: {
    toolName: string;
    description: string;
  };
  inputSchema: z.ZodObject<any>;
  handler: (client: SmartMovingClient, input: unknown) => Promise<unknown>;
}
```

## Task 1: Build metadata for existing 62 MCP tools

Move each MCP tool into the registry while preserving behavior.

Acceptance:

- MCP still registers exactly 62 tools.
- Tool names stay stable.
- Existing MCP tests still pass.

## Task 2: Generate CLI commands from registry

The CLI should use metadata instead of separately hand-written command behavior where possible.

Acceptance:

- Existing CLI commands still work.
- New registry registration does not change endpoint behavior.
- Command examples are available from metadata.

## Task 3: Add `schema --json`

Schema output must include:

- package version
- command name
- group
- safety level
- description
- examples
- required arguments/options
- output modes
- MCP tool name
- stable exit codes

Example shape:

```json
{
  "ok": true,
  "version": "0.1.0",
  "operations": [
    {
      "name": "list_leads",
      "group": "leads",
      "safety": "read",
      "cli": { "command": "leads list", "examples": ["smartmoving leads list --json"] },
      "mcp": { "toolName": "list_leads" }
    }
  ]
}
```

## Tests

Add tests that assert:

- registry has 62 operations
- all operation names are unique
- all CLI command strings are unique
- all safety levels are valid
- `schema --json` is valid JSON
- `schema --json` includes all 62 operations
- write and destructive operations are labeled correctly

## Verification

```bash
cd mcp-server
npm run build
npm test
node dist/cli.js schema --json
npm pack --dry-run
```

## Commit

```bash
git add mcp-server/src docs/CLI.md
git commit -m "feat: add SmartMoving CLI schema contract"
```
