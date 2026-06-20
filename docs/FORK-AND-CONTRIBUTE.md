# Fork and agent contribution guide

This guide is for movers, operators, and developers who want to use their own AI agents to improve SmartMoving MCP.

## Who can contribute

You can help even if you do not write code.

| Contributor | Useful contribution |
|---|---|
| Moving-company operator | Describe workflows your agent should run |
| SmartMoving power user | Report API quirks, missing fields, odd endpoint behavior |
| Developer | Add tools, schemas, docs, tests |
| AI-agent user | Test install with Claude, Codex, Hermes, OpenClaw, Cursor |

## Fork workflow

1. Fork the repo on GitHub.
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR-USER/smartmoving-mcp.git
   cd smartmoving-mcp
   ```

3. Create a branch:

   ```bash
   git checkout -b feat/short-description
   ```

4. Install and verify:

   ```bash
   cd mcp-server
   npm install
   npm run verify
   ```

5. Make a focused change.
6. Run verification again:

   ```bash
   npm run verify
   ```

7. Commit and push:

   ```bash
   git add .
   git commit -m "feat: add useful SmartMoving thing"
   git push origin feat/short-description
   ```

8. Open a pull request back to the main repo.

## Using an AI coding agent on your fork

Give your agent tight instructions. Do not ask it to "improve everything." That makes giant messy PRs nobody wants to review.

Good prompt:

```text
You are working in my fork of smartmoving-mcp. Add mocked Vitest tests for mcp-server/src/tools/reference.ts only. Do not call the live SmartMoving API. Use fake data only. Run npm run verify. Summarize changed files.
```

Bad prompt:

```text
Make this repo better.
```

That prompt is how you get 47 files changed, a broken package lock, and a haunted README.

## Safe data rules

Never commit or paste:

- SmartMoving API keys
- customer names
- phone numbers
- email addresses
- physical addresses
- quote numbers
- payment data
- screenshots with CRM data
- agent logs containing live API responses

Use synthetic examples only:

```text
Synthetic Customer
00000000-0000-0000-0000-000000000000
123456
123 Main St, Example City, ST 12345
```

## Contribution types

### Missing endpoint

Open an issue or PR when SmartMoving has an endpoint that this MCP does not expose yet.

Include:

- endpoint path, if known
- Basic or Premium tier, if known
- why an agent needs it
- fake request/response examples

### Agent workflow

Open an issue when you know a useful moving-company workflow, even if you do not know which endpoints it needs.

Examples:

- daily dispatch summary
- quote prep packet
- stale follow-up report
- customer dispute packet
- unpaid balance report
- supply/material reconciliation
- closeout review

### API quirk

Open an issue when SmartMoving behaves differently than expected.

Examples:

- field exists on one opportunity model but not another
- Premium endpoint returns empty arrays for newer job models
- update endpoint silently ignores a field
- pagination casing is weird

### Code PR

Good code PRs are small and focused:

- one endpoint
- one tool module test file
- one docs improvement
- one workflow helper

Every new tool should include:

- snake_case tool name
- clear tool description
- Zod input schema
- Premium/destructive warning when relevant
- mocked tests where practical
- docs update if user-facing behavior changed

## Local MCP test config

After building from source, point your MCP client at the local dist file:

```json
{
  "mcpServers": {
    "smartmoving": {
      "command": "node",
      "args": ["/absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js"],
      "env": {
        "SMARTMOVING_API_KEY": "replace-with-your-key",
        "SMARTMOVING_ALLOW_WRITES": "false",
        "SMARTMOVING_ALLOW_DESTRUCTIVE": "false"
      }
    }
  }
}
```

After npm publish, you can use npx instead:

```json
{
  "mcpServers": {
    "smartmoving": {
      "command": "npx",
      "args": ["-y", "smartmoving-mcp-server"],
      "env": {
        "SMARTMOVING_API_KEY": "replace-with-your-key",
        "SMARTMOVING_ALLOW_WRITES": "false",
        "SMARTMOVING_ALLOW_DESTRUCTIVE": "false"
      }
    }
  }
}
```
