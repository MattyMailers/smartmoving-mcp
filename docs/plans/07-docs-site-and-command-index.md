# Loop 7: Documentation site and generated command index

## Objective

Make the project feel easy to install, easy to trust, and easy to contribute to, with generated command docs similar in spirit to gogcli.sh.

## Files

- Modify: `docs/README.md`
- Modify: `docs/CLI.md`
- Modify: `docs/AUTHENTICATION.md`
- Modify: `docs/AGENT-INSTALL.md`
- Create: `docs/SAFETY-PROFILES.md`
- Create: `docs/commands/README.md`
- Create or generate: `docs/commands/<group>/<command>.md`
- Create: `mcp-server/src/cli/docs.ts`
- Test: `mcp-server/src/cli.test.ts`

## Docs to create or expand

- Overview
- Install
- Quickstart
- Authentication
- Safety profiles
- CLI command index
- MCP setup
- Agent workflows
- Live testing
- Release process
- Contributing
- Unofficial SmartMoving notice

## Command docs generation

Add:

```bash
smartmoving docs generate
```

Inputs:

```bash
smartmoving schema --json
```

Outputs:

```txt
docs/commands/README.md
docs/commands/reference/branches.md
docs/commands/leads/list.md
...
```

Each generated command page should include:

- command
- description
- safety level
- arguments
- options
- examples
- JSON output notes
- related MCP tool
- failure modes

## `docs/commands/README.md` shape

Group commands by area:

- setup
- reference
- customers
- leads
- opportunities
- jobs
- inventory
- follow-ups
- communication
- agent
- mcp

Include safety badges:

```txt
READ
WRITE, requires SMARTMOVING_ALLOW_WRITES=true
DESTRUCTIVE, requires writes + destructive + --yes
```

## Tests

Add tests that verify:

- `docs generate` runs from schema
- docs generation is deterministic
- command docs include safety level
- command docs include at least one example
- no docs page includes raw API keys

## Verification

```bash
cd mcp-server
npm run build
npm test
node dist/cli.js docs generate
node dist/cli.js schema --json
npm pack --dry-run
```

Then check:

```bash
git diff --check
git diff --stat
```

## Commit

```bash
git add docs mcp-server/src
git commit -m "docs: add SmartMoving CLI command index plan"
```
