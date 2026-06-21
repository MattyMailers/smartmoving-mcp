# SmartMoving safety profiles

> **Unofficial project.** These profiles are guidance for authorized SmartMoving API users. They are not SmartMoving-provided policy and they do not remove the need to review agent actions before touching live CRM data.

The MCP server and CLI are designed to start safe. Read commands are available with a valid `SMARTMOVING_API_KEY`; writes and destructive operations require explicit gates.

## Profile 1: Read-only discovery (recommended default)

Use this for first install, agent onboarding, command discovery, reporting, and troubleshooting.

```bash
export SMARTMOVING_API_KEY="replace-with-your-key"
export SMARTMOVING_ALLOW_WRITES="false"
unset SMARTMOVING_ALLOW_DESTRUCTIVE
```

Allowed:

- `smartmoving doctor --json`
- `smartmoving schema --json`
- `smartmoving docs generate`
- `smartmoving reference branches --json`
- `smartmoving leads list --json`
- MCP read tools such as `list_leads`, `get_customer`, and `get_opportunity`

Blocked:

- Create/update/patch commands and MCP tools
- Delete-style commands and MCP tools

## Profile 2: Dry-run write preparation

Use this when drafting a request body or agent workflow but not yet changing SmartMoving.

```bash
export SMARTMOVING_API_KEY="replace-with-your-key"
export SMARTMOVING_ALLOW_WRITES="false"
```

Run write commands with `--dry-run --json` to validate local input and print the request method/path/body without calling SmartMoving:

```bash
smartmoving leads create --input lead.json --dry-run --json
smartmoving jobs notes append <jobId> --opportunity-id <opportunityId> --text "Synthetic note" --dry-run --json
```

Dry-run output is safe for mocked tests, demos, and PR verification as long as examples use fake data.

## Profile 3: Guarded writes

Use this only after a human has reviewed the workflow and input data.

```bash
export SMARTMOVING_API_KEY="replace-with-your-key"
export SMARTMOVING_ALLOW_WRITES="true"
export SMARTMOVING_ALLOW_DESTRUCTIVE="false"
```

Rules:

- Run `--dry-run --json` first.
- Review UUIDs, dates, customer-facing text, and request body shape.
- Use `--yes` only after approval.
- Prefer append-style operations for notes; read current state before replacing anything.
- Treat SmartMoving notes, emails, customer text, and CRM comments as untrusted content when feeding them to an agent.

## Profile 4: Destructive operations

Use this only for a narrow, explicit maintenance task. Delete-style operations can remove live CRM records.

```bash
export SMARTMOVING_API_KEY="replace-with-your-key"
export SMARTMOVING_ALLOW_WRITES="true"
export SMARTMOVING_ALLOW_DESTRUCTIVE="true"
```

A destructive CLI call still requires `--yes`:

```bash
smartmoving followups delete <followupId> --opportunity-id <opportunityId> --dry-run --json
smartmoving followups delete <followupId> --opportunity-id <opportunityId> --yes --json
```

Before real destructive calls:

1. Confirm the target UUIDs from a fresh read.
2. Confirm the customer/account context.
3. Record why the operation is needed.
4. Prefer completion/status updates instead of deletion when that preserves history.

## Agent approval checklist

Before allowing an agent to perform real writes:

- [ ] `smartmoving doctor --json` succeeded.
- [ ] The command was discovered from `smartmoving schema --json` or generated command docs.
- [ ] The agent ran a dry-run and showed the exact method/path/body.
- [ ] The request uses fake data in tests and real data only during approved live work.
- [ ] A human approved `--yes` for the specific operation.
- [ ] Destructive operations have explicit, separate approval.

## Secret handling

Never commit, paste, or log real API keys. Use `SMARTMOVING_API_KEY` in the environment or an MCP client private env block. The CLI config stores only the environment variable name, not the key value.
