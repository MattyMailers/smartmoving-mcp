# Loop 8: Packaging, release, and smoke testing

## Objective

Make install, package verification, release prep, and smoke testing boring and reliable.

## Files

- Modify: `mcp-server/package.json`
- Modify: `mcp-server/README.md`
- Modify: `README.md`
- Modify: `docs/RELEASE.md`
- Create: `docs/LIVE-TESTING.md`
- Create: `mcp-server/src/cli/smoke.ts`
- Test: `mcp-server/src/cli.test.ts`
- Modify: `.github/workflows/ci.yml`

## Package goals

Confirm package exposes both binaries:

```txt
smartmoving
smartmoving-mcp-server
```

Confirm package includes only intended files:

```json
{
  "files": [
    "dist",
    "README.md",
    "NOTICE.md"
  ]
}
```

Run:

```bash
npm pack --dry-run
```

## One-line install paths

Global install:

```bash
npm install -g smartmoving-mcp-server
smartmoving init
smartmoving doctor
```

npx smoke test:

```bash
SMARTMOVING_API_KEY=*** npx -y smartmoving-mcp-server smartmoving doctor --json
```

If npm binary resolution makes `npx ... smartmoving` awkward, document the actual working form and consider a later dedicated `smartmoving-cli` package. Do not split packages unless the user experience requires it.

## Smoke commands

Add:

```bash
smartmoving smoke read --json
smartmoving smoke write --dry-run --json
smartmoving smoke live --read-only --json
```

Rules:

- CI uses mocked tests only.
- Live tests require `SMARTMOVING_LIVE_TESTS=true`.
- Live write tests are not allowed unless a dedicated sandbox account exists.
- Smoke output must redact API keys.

## Release checklist

Update `docs/RELEASE.md` with:

```bash
cd mcp-server
npm run build
npm test
npm audit --audit-level=high
node dist/cli.js doctor --json
node dist/cli.js schema --json
npm pack --dry-run
```

Then:

```bash
npm publish --dry-run
```

Actual `npm publish` requires maintainer approval.

## GitHub CI

CI should run:

```bash
cd mcp-server
npm ci
npm run build
npm test
npm audit --audit-level=high
npm pack --dry-run
```

CI must not require a real SmartMoving API key.

## Tests

Add tests that verify:

- package binaries exist after build
- `npm pack --dry-run` includes expected files
- `smoke read --json` uses mocked API in tests
- live smoke requires explicit env
- write smoke defaults to dry-run
- package docs mention unofficial status and use-at-own-risk language

## Verification

```bash
cd mcp-server
npm run build
npm test
npm audit --audit-level=high
npm pack --dry-run
```

## Commit

```bash
git add README.md docs mcp-server .github/workflows/ci.yml
git commit -m "chore: harden SmartMoving CLI release workflow"
```
