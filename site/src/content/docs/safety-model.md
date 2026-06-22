---
title: Safety model
description: Local credentials, read-only defaults, write gates, destructive gates, and approval guidance.
---

This project can interact with live CRM data. It is provided **as is** and used at your own risk. The maintainers are not responsible for data loss, sync errors, incorrect results, downtime, duplicate or missing records, account issues, business interruption, or other problems arising from use.

## Credentials stay local

For human/CLI onboarding, run:

```bash
smartmoving init
```

You can paste an authorized SmartMoving API key and store it locally on that machine. The CLI writes credentials outside the repo:

| File | Purpose |
| --- | --- |
| `~/.config/smartmoving/config.json` | Profile, base URL, auth source. |
| `~/.config/smartmoving/credentials.json` | Local API key storage, file mode `0600` where supported. |

For CI, Docker, server processes, and MCP client configs, use explicit environment variables instead:

```bash
export SMARTMOVING_API_KEY="replace-with-your-key"
export SMARTMOVING_ALLOW_WRITES="false"
unset SMARTMOVING_ALLOW_DESTRUCTIVE
```

API keys should never be passed as command arguments, committed, printed in logs, or pasted into issue/PR text.

## Default: read-only discovery

Allowed:

- `smartmoving doctor --json`
- `smartmoving schema --json`
- `smartmoving docs generate`
- read commands such as `reference branches`, `leads list`, and `customers get`
- MCP read tools such as `list_leads`, `get_customer`, and `get_opportunity`

Blocked:

- create/update/patch commands and MCP tools;
- delete-style commands and MCP tools.

## Dry-run write preparation

Dry-runs validate input and print request metadata without calling SmartMoving:

```bash
smartmoving leads create --input lead.json --dry-run --json
smartmoving jobs notes append <jobId> --opportunity-id <opportunityId> --text "Synthetic note" --dry-run --json
```

Use fake examples in tests and PRs.

## Guarded writes

Only enable writes after a human reviews the workflow and payload:

```bash
export SMARTMOVING_ALLOW_WRITES="true"
export SMARTMOVING_ALLOW_DESTRUCTIVE="false"
```

Rules:

- run `--dry-run --json` first;
- review UUIDs, dates, customer-facing text, and request shape;
- use `--yes` only after approval;
- prefer append-style operations for notes;
- read current state before replacing anything.

## Destructive operations

Delete-style operations require writes, destructive permission, and `--yes`:

```bash
export SMARTMOVING_ALLOW_WRITES="true"
export SMARTMOVING_ALLOW_DESTRUCTIVE="true"
smartmoving followups delete <followupId> --opportunity-id <opportunityId> --yes --json
```

Before destructive calls, confirm target UUIDs from a fresh read, confirm account context, record why the operation is needed, and prefer completion/status changes when history should be preserved.

## Approval checklist

- [ ] `smartmoving doctor --json` succeeded.
- [ ] Command came from `smartmoving schema --json` or generated docs.
- [ ] Agent ran a dry-run and showed method/path/body.
- [ ] Tests use fake data only.
- [ ] Real data appears only during approved live work.
- [ ] Human approved `--yes` for the specific operation.
- [ ] Destructive operations have explicit, separate approval.
