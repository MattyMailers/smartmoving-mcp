# Onboarding smoke report

Date: 2026-06-22T01:47:42Z  
Branch: feat/smartmoving-cli-mvp  
Package: smartmoving-mcp-server@0.1.0  
Tarball: mcp-server/smartmoving-mcp-server-0.1.0.tgz

## Result

PASS — fresh install onboarding succeeded from a packed tarball in an isolated temp prefix/HOME.

## Checks

- Packed tarball installed with `npm install -g --prefix <temp> mcp-server/smartmoving-mcp-server-0.1.0.tgz`.
- `smartmoving --help` ran successfully: `Usage: smartmoving [options] [command]`.
- `smartmoving schema --json` returned `62` operations.
- `smartmoving init --yes --api-key-env SMARTMOVING_API_KEY --json` returned `ok` and wrote config to a temp path.
- Config stored only the API-key environment variable name; no raw key material was stored.
- `SMARTMOVING_API_KEY=<fake> smartmoving doctor --json` failed safely with `CHECK_PING_FAILED` and did not print the fake key.
- Real-key read-only doctor: doctor --json read-only ping ok; exit 0; redaction checked.

## Safety notes

- No npm publish was attempted.
- No merge or main push was attempted.
- No write or destructive SmartMoving calls were run.
- Output was checked for fake/real key leakage before this report was written.
