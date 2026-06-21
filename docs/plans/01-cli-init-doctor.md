# Loop 1: CLI init, doctor, and output contract

## Objective

Make the CLI feel installable, diagnosable, and safe before expanding tool coverage.

## Commands to add

```bash
smartmoving init
smartmoving doctor
smartmoving doctor --json
smartmoving mcp config --print-hermes
smartmoving mcp config --print-claude
smartmoving mcp config --print-json
```

## Files

- Modify: `mcp-server/src/cli.ts`
- Modify: `mcp-server/src/cli/format.ts`
- Create: `mcp-server/src/cli/config.ts`
- Create: `mcp-server/src/cli/doctor.ts`
- Test: `mcp-server/src/cli.test.ts`
- Docs: `docs/CLI.md`
- Docs: `docs/AGENT-INSTALL.md`

## Task 1: Standardize global output

Add global options:

```bash
--json
--plain
--quiet
--verbose
--no-color
--profile <name>
```

Acceptance:

- `--json` writes JSON only to stdout.
- warnings, prompts, and progress write to stderr.
- errors redact API keys.
- JSON errors use stable shape:

```json
{
  "ok": false,
  "error": {
    "code": "AUTH_MISSING",
    "message": "SMARTMOVING_API_KEY is required",
    "hint": "Run smartmoving init or export SMARTMOVING_API_KEY."
  }
}
```

## Task 2: Add `smartmoving init`

Interactive behavior:

```bash
smartmoving init
```

Prompt for:

- profile name, default `default`
- API key environment variable, default `SMARTMOVING_API_KEY`
- optional base URL
- whether to run `doctor`

Default config path:

```txt
~/.config/smartmoving/config.json
```

Default config shape:

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

Do not store raw API keys by default.

Non-interactive behavior:

```bash
smartmoving init --api-key-env SMARTMOVING_API_KEY --profile default --yes
smartmoving init --api-key-stdin --profile default --yes
```

## Task 3: Add `smartmoving doctor`

Checks:

- Node version
- package version
- config readable
- profile selected
- API key present without printing value
- base URL valid
- API ping succeeds
- write/destructive safety flags
- MCP server binary available

JSON output example:

```json
{
  "ok": true,
  "checks": [
    { "name": "node", "ok": true, "detail": "v22.12.0" },
    { "name": "apiKey", "ok": true, "detail": "present via SMARTMOVING_API_KEY" },
    { "name": "ping", "ok": true }
  ],
  "safety": {
    "writesEnabled": false,
    "destructiveEnabled": false
  }
}
```

## Task 4: Add MCP config helpers

Commands:

```bash
smartmoving mcp config --print-hermes
smartmoving mcp config --print-claude
smartmoving mcp config --print-json
```

Output must reference env vars, never raw API keys.

## Verification

```bash
cd mcp-server
npm run build
npm test
node dist/cli.js --help
node dist/cli.js doctor --json
npm pack --dry-run
```

## Commit

```bash
git add mcp-server/src docs/CLI.md docs/AGENT-INSTALL.md
git commit -m "feat: add SmartMoving CLI init and doctor"
```
