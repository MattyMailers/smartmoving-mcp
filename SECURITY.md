# Security Policy

## Supported versions

This repository is currently pre-1.0 open-source preparation. Security fixes should target `main` unless release branches are created later.

## Reporting a vulnerability

Please do not open a public issue for secrets, auth bypasses, or real customer data exposure.

Use a private maintainer contact or GitHub private vulnerability reporting if enabled. Include:

- What is affected
- Steps to reproduce
- Impact
- Suggested fix, if known

## Secret handling

The MCP server requires `SMARTMOVING_API_KEY`, but the repo must never contain a real key.

Safe storage options:

- Agent/client private MCP config `env` block
- Local shell environment
- Local `.env` ignored by git
- Password manager or OS keychain
- Deployment secret store

Unsafe storage:

- Committed `.env`
- README examples with real keys
- Screenshots of config files
- CI logs printing env values
- Agent transcripts containing real API responses

## If a key leaks

1. Revoke or rotate the SmartMoving API key immediately.
2. Remove the key from git history if committed.
3. Audit access logs if available.
4. Add or tighten secret scanning.
5. Document the incident privately.

## Data privacy

SmartMoving data can include customer names, addresses, phone numbers, email addresses, job details, payments, and internal notes. Do not use live customer payloads in docs, tests, issues, or pull requests.

Use synthetic examples only.
