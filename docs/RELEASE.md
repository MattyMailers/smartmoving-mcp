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
   npm ci
   npm run verify
   npm pack --dry-run
   ```

5. Update `CHANGELOG.md` with user-facing changes.
6. Bump `mcp-server/package.json` version using semver.
7. Open a release PR and let CI pass.
8. Squash merge the release PR.
9. Create and push the tag:

   ```bash
   git checkout main
   git pull origin main
   git tag v0.1.0
   git push origin v0.1.0
   ```

10. Publish to npm, either manually or through the release workflow once configured.
11. Create a GitHub release from the tag and paste the changelog section.

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

## Maintainer merge policy

- Use pull requests for all external contributions.
- Require CI before merge.
- Use squash merge for clean history.
- Never merge examples containing real API keys, customer data, quote numbers, addresses, or CRM screenshots.
- Live API tests must stay opt-in and must never run by default in CI.
