---
title: Quickstart
description: Fast, safe setup path for SmartMoving MCP + CLI.
---

Start read-only, verify the package locally, then connect your agent.

## 1. Clone and build

```bash
git clone https://github.com/MattyMailers/smartmoving-mcp.git
cd smartmoving-mcp/mcp-server
npm install
npm run build
```

## 2. Keep the API key private

Use an authorized SmartMoving External API key. Do not commit it, paste it into GitHub, or pass it as a command argument.

```bash
export SMARTMOVING_API_KEY="replace-with-your-key"
export SMARTMOVING_ALLOW_WRITES="false"
```

Reads are available with the key. Writes are blocked unless you later opt in.

## 3. Initialize CLI config

```bash
node dist/cli.js init --yes --profile default --api-key-env SMARTMOVING_API_KEY
node dist/cli.js doctor --json
node dist/cli.js schema --json
```

The CLI config stores the environment variable name only, not the raw key.

## 4. Connect an MCP client

Use the local stdio server:

```text
node /absolute/path/to/smartmoving-mcp/mcp-server/dist/index.js
```

Pass these env vars in your MCP client config:

```text
SMARTMOVING_API_KEY=replace-with-your-key
SMARTMOVING_ALLOW_WRITES=false
```

See [MCP setup](/mcp-setup/) for copy-paste client snippets.

## 5. Verify safely

Ask your agent to ping SmartMoving and list tools. Or run CLI smoke checks:

```bash
node dist/cli.js doctor --json
node dist/cli.js smoke read --json
node dist/cli.js smoke write --dry-run --json
```

`smoke write --dry-run` prints a synthetic request and does not call SmartMoving.

## After npm publish

Once maintainers publish, the one-line global install is:

```bash
npm install -g smartmoving-mcp-server
```

One-off npx CLI usage should use npm's explicit package resolution:

```bash
SMARTMOVING_API_KEY="replace-with-your-key" \
  npx -y --package smartmoving-mcp-server smartmoving doctor --json
```
