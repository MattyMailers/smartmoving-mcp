# Loop 9: Nice-to-have power features

## Objective

Capture future power features that should wait until init, doctor, schema, full read coverage, writes, safety gates, agent UX, docs, and release workflow are stable.

## Do not start these early

These are useful, but they are not foundational. Ship the safer core first.

## Candidate commands

### Watchers

```bash
smartmoving leads watch --interval 60 --json
smartmoving followups watch --interval 300 --json
```

Use cases:

- local dashboards
- cron scripts
- lightweight operations monitors
- AI agents watching for new work

Rules:

- persist cursor locally
- quiet by default when nothing changes
- no writes
- clear rate-limit behavior

### Export

```bash
smartmoving export leads --from 2026-01-01 --to 2026-01-31 --output leads.jsonl
smartmoving export opportunities --from 2026-01-01 --to 2026-01-31 --output opportunities.jsonl
```

Rules:

- warn before large exports
- support JSONL
- include source metadata
- never include API key

### Cache

```bash
smartmoving cache status
smartmoving cache clear
```

Rules:

- cache only safe reference data by default
- do not cache customer data unless explicitly enabled
- document cache path

### Shell completions

```bash
smartmoving completion zsh
smartmoving completion bash
smartmoving completion fish
```

### Profiles

```bash
smartmoving profiles list
smartmoving profiles use <name>
smartmoving profiles doctor <name>
```

### Raw read-only endpoint helper

```bash
smartmoving raw get /api/branches --json
```

Rules:

- raw defaults to GET only
- non-GET raw commands require write gates
- raw destructive commands require destructive gates
- raw mode should be clearly marked as advanced

## Tests

Every power feature needs:

- mocked API tests
- JSON output tests
- no-secret tests
- safety gate tests when applicable

## Commit pattern

Ship these as separate PRs only after the epic CLI foundation is already stable.

Recommended commits:

```bash
git commit -m "feat: add SmartMoving CLI watch commands"
git commit -m "feat: add SmartMoving CLI export commands"
git commit -m "feat: add SmartMoving CLI shell completions"
```
