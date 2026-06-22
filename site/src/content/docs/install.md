---
title: Install
description: Install from source today and from npm after maintainers publish.
---

## Requirements

- Node.js 18 or newer.
- npm.
- An authorized SmartMoving External API key for real API reads.
- An MCP-compatible client if you want agent-native tools.

## Install from source

```bash
git clone https://github.com/MattyMailers/smartmoving-mcp.git
cd smartmoving-mcp/mcp-server
npm install
npm run build
npm test
```

Run the MCP server manually only for diagnostics:

```bash
export SMARTMOVING_API_KEY="replace-with-your-key"
export SMARTMOVING_ALLOW_WRITES="false"
npm start
```

In normal use, your MCP client launches `dist/index.js` over stdio.

## Future npm install

After maintainers publish the package:

```bash
npm install -g smartmoving-mcp-server
smartmoving init --yes --profile default --api-key-env SMARTMOVING_API_KEY
smartmoving doctor --json
```

The package is expected to expose both binaries:

```text
smartmoving-mcp-server
smartmoving
```

For one-off CLI runs:

```bash
SMARTMOVING_API_KEY="replace-with-your-key" \
  npx -y --package smartmoving-mcp-server smartmoving schema --json
```

For one-off MCP server launches:

```bash
npx -y smartmoving-mcp-server
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SMARTMOVING_API_KEY` | Yes | Authorized SmartMoving External API key. |
| `SMARTMOVING_BASE_URL` | No | API base URL override. Defaults to `https://api-public.smartmoving.com/v1`. |
| `SMARTMOVING_CONFIG_PATH` | No | CLI config path override for isolated profiles/tests. |
| `SMARTMOVING_ALLOW_WRITES` | No | Enables POST/PUT/PATCH tools and commands when set to `true`. Defaults to read-only. |
| `SMARTMOVING_ALLOW_DESTRUCTIVE` | No | Enables DELETE-style operations only when writes are also enabled. |

## Secret handling

- Put API keys in private MCP client env blocks, shell profiles, password managers, or ignored `.env` files.
- Commit only placeholders such as `replace-with-your-key`.
- Rotate a key immediately if it appears in GitHub, a PR comment, logs, screenshots, or chat.
