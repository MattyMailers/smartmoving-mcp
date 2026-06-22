# Live testing and smoke checks

> **Unofficial project.** These checks use the SmartMoving External API only with credentials supplied by an authorized SmartMoving customer. This project is not affiliated with, endorsed by, sponsored by, or certified by SmartMoving, LLC.

SmartMoving CLI smoke tests are designed to keep CI safe and make manual release checks repeatable.

## Rules

- CI uses mocked tests only.
- Do not run live tests by default.
- Live smoke tests require `SMARTMOVING_LIVE_TESTS=true`.
- Live smoke tests are read-only unless a maintainer later creates a dedicated sandbox-account workflow.
- `smartmoving smoke write` is a dry-run command and does not call SmartMoving.
- API keys must stay in environment variables and must not be pasted into issue comments, PR comments, test logs, or docs.

## Local mocked verification

From `mcp-server/`:

```bash
npm run build
npm test
npm pack --dry-run
```

These commands must pass without a real `SMARTMOVING_API_KEY`.

## Manual read smoke

Use only an authorized API key:

```bash
cd mcp-server
npm run build
SMARTMOVING_API_KEY="replace-with-your-key" node dist/cli.js smoke read --json
```

Expected shape:

```json
{
  "ok": true,
  "mode": "read",
  "live": false,
  "checks": [
    { "name": "ping", "ok": true }
  ]
}
```

## Manual write dry-run smoke

This prints a synthetic lead-create request and does not make an HTTP request:

```bash
SMARTMOVING_API_KEY="replace-with-your-key" node dist/cli.js smoke write --dry-run --json
```

Expected shape:

```json
{
  "ok": true,
  "mode": "write",
  "live": false,
  "dryRun": true,
  "request": {
    "method": "POST",
    "path": "/api/premium/leads"
  }
}
```

## Opt-in live smoke

Live smoke requires an explicit environment flag and is read-only:

```bash
SMARTMOVING_LIVE_TESTS=true \
SMARTMOVING_API_KEY="replace-with-your-key" \
node dist/cli.js smoke live --read-only --json
```

Without `SMARTMOVING_LIVE_TESTS=true`, the command returns stable JSON with `LIVE_TESTS_DISABLED`.

## NPM/npx smoke after publish

After maintainers publish the package, the tested one-off CLI form should be:

```bash
SMARTMOVING_API_KEY="replace-with-your-key" \
npx -y --package smartmoving-mcp-server smartmoving doctor --json

SMARTMOVING_API_KEY="replace-with-your-key" \
npx -y --package smartmoving-mcp-server smartmoving smoke read --json
```

Global install smoke:

```bash
npm install -g smartmoving-mcp-server
smartmoving init --yes --profile default --api-key-env SMARTMOVING_API_KEY
smartmoving doctor --json
smartmoving smoke read --json
smartmoving smoke write --dry-run --json
```

## What not to do

- Do not run live smoke tests in GitHub Actions.
- Do not run live write or destructive smoke tests against a production SmartMoving account.
- Do not publish, tag, merge, or change repo visibility as part of smoke testing.
- Do not include real customer names, quote numbers, phone numbers, emails, addresses, or API responses in reports.
