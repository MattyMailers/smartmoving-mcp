# Release process

This project should stay boring to release: small PRs, passing CI, versioned tags, and clear notes.

## Release checklist

Before a public release:

1. Confirm the repo is free of secrets and real customer data.
2. Confirm `main` is protected and CI is required.
3. Confirm private vulnerability reporting is enabled in GitHub.
4. Run local verification:

   ```bash
   cd mcp-server
   npm run build
   npm test
   npm audit --audit-level=high
   node dist/cli.js doctor --json
   node dist/cli.js schema --json
   npm pack --dry-run
   ```

5. Run publish dry-run only:

   ```bash
   npm publish --dry-run
   ```

   Actual `npm publish` requires maintainer approval. Do not publish from a PR or scheduled agent loop.

6. Confirm package contents and bins from `npm pack --dry-run`: only `dist`, `README.md`, `NOTICE.md`, and `package.json` should ship, and both `smartmoving` and `smartmoving-mcp-server` bins should point into `dist`.
7. Update `CHANGELOG.md` with user-facing changes.
8. Bump `mcp-server/package.json` version using semver.
9. Open a release PR and let CI pass.
10. Squash merge the release PR.
11. Create and push the tag:

   ```bash
   git checkout main
   git pull origin main
   git tag v0.1.0
   git push origin v0.1.0
   ```

12. Publish to npm, either manually or through the release workflow once configured.
13. Create a GitHub release from the tag and paste the changelog section.

## Versioning

Use semver:

- `0.1.0`: first public release.
- `0.x.0`: new tools, workflow helpers, install improvements, safety-mode changes.
- `0.x.y`: bug fixes, docs fixes, schema fixes.
- `1.0.0`: stable public API after external SmartMoving users have tested it.

## NPM publish

The package is intended to publish as:

```text
smartmoving-mcp-server
```

Manual first publish:

```bash
cd mcp-server
npm login
npm publish --access public
```

After publish, public install docs should prefer:

```bash
npx smartmoving-mcp-server
```

For CLI usage, document one of these forms:

```bash
npm install -g smartmoving-mcp-server
smartmoving doctor --json

SMARTMOVING_API_KEY="replace-with-your-key" npx -y --package smartmoving-mcp-server smartmoving doctor --json
```

If npm binary resolution changes, update `README.md`, `mcp-server/README.md`, and `docs/CLI.md` with the tested command form before release.

## Smoke testing

Mocked smoke behavior is covered by `npm test` and must not require a real SmartMoving key in CI.

Manual read smoke against an authorized account:

```bash
cd mcp-server
npm run build
SMARTMOVING_API_KEY="replace-with-your-key" node dist/cli.js smoke read --json
```

Write smoke remains dry-run by default and does not call SmartMoving:

```bash
SMARTMOVING_API_KEY="replace-with-your-key" node dist/cli.js smoke write --dry-run --json
```

Live smoke is opt-in and read-only:

```bash
SMARTMOVING_LIVE_TESTS=true SMARTMOVING_API_KEY="replace-with-your-key" node dist/cli.js smoke live --read-only --json
```

Live write smoke tests are not allowed unless a dedicated SmartMoving sandbox account and maintainer-approved workflow exist.

## Maintainer merge policy

- Use pull requests for all external contributions.
- Require CI before merge.
- Use squash merge for clean history.
- Never merge examples containing real API keys, customer data, quote numbers, addresses, or CRM screenshots.
- Live API tests must stay opt-in and must never run by default in CI.
