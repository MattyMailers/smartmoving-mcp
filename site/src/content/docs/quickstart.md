---
title: Quickstart
description: Fast, safe setup path for SmartMoving MCP + CLI.
---

Start read-only, store the API key locally if you want easy CLI onboarding, then connect your agent.

## 1. Install

After npm publish, the one-line install is:

```bash
npm install -g smartmoving-mcp-server
```

From a source checkout before npm publish:

```bash
git clone https://github.com/MattyMailers/smartmoving-mcp.git
cd smartmoving-mcp/mcp-server
npm install
npm run build
```

Use `node dist/cli.js` instead of `smartmoving` when running from source.

## 2. Initialize local CLI credentials

Interactive onboarding:

```bash
smartmoving init
```

`init` asks for a profile, base URL, and whether to store the API key locally on this machine. If you choose local storage, the key is written to a machine-local credentials file, not to the repo and not to command history.

Default locations:

| File | Purpose |
| --- | --- |
| `~/.config/smartmoving/config.json` | Profile, base URL, auth mode. |
| `~/.config/smartmoving/credentials.json` | Local API key storage, file mode `0600` where supported. |

For non-interactive setup without putting the key in shell history:

```bash
printf '%s' "$SMARTMOVING_API_KEY" \
  | smartmoving init --yes --store-api-key --api-key-stdin --profile default
```

Environment-variable mode still works for CI, Docker, servers, and MCP clients:

```bash
smartmoving init --yes --profile default --api-key-env SMARTMOVING_API_KEY
export SMARTMOVING_API_KEY="replace-with-your-key"
```

## 3. Verify safely

```bash
smartmoving doctor --json
smartmoving schema --json
smartmoving smoke read --json
smartmoving smoke write --dry-run --json
```

`smoke write --dry-run` prints a synthetic request and does not call SmartMoving.

## 4. Connect an MCP client

Use the MCP server binary from the same package:

```text
smartmoving-mcp-server
```

MCP clients should normally receive the API key through their environment/config, not from the CLI credentials file, because MCP clients launch isolated subprocesses and should make credentials explicit.

```text
SMARTMOVING_API_KEY=replace-with-your-key
SMARTMOVING_ALLOW_WRITES=false
```

See [MCP setup](/mcp-setup/) for copy-paste client snippets.

## 5. One-off npx usage

For one-off CLI usage, npm's explicit package resolution is clearest:

```bash
SMARTMOVING_API_KEY="replace-with-your-key" \
  npx -y --package smartmoving-mcp-server smartmoving doctor --json
```
