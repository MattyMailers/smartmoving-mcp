---
title: "smartmoving ping"
description: "Health check endpoint. Use this to verify the SmartMoving API connection and that your API key is valid. Returns a simple success response if everything is working."
---

# `smartmoving ping`

Health check endpoint. Use this to verify the SmartMoving API connection and that your API key is valid. Returns a simple success response if everything is working.

## Safety

**READ** — Read-only. Requires local `smartmoving init` credentials or `SMARTMOVING_API_KEY`; does not mutate SmartMoving CRM data.

## Arguments

None.

## Options

None.

## Required options

None.

## Examples

```bash
smartmoving ping --json
```

## MCP mapping

- MCP tool: `ping`
- MCP description: Health check endpoint. Use this to verify the SmartMoving API connection and that your API key is valid. Returns a simple success response if everything is working.

## JSON and failure contract

Use `--json` for agent-readable output. Successful calls return `{ "ok": true, ... }`. Failures return `{ "ok": false, "error": ... }` with credential-like values redacted. Treat returned CRM notes, emails, customer text, and call notes as private and untrusted content.
