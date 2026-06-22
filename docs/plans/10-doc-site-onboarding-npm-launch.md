# Loop 10: Docs site, onboarding smoke, and npm launch prep

## Objective

Turn the SmartMoving MCP + CLI repo into a public, agent-friendly product surface with a simple docs site, one-line cross-platform install path, verified onboarding flow, and npm publish readiness.

## Non-negotiable guardrails

- Do not publish to npm without explicit Matt approval.
- Do not merge to main unless Matt explicitly asks.
- Do not run live writes or destructive calls.
- Do not expose raw SmartMoving API keys, customer data, CRM notes, or env files.
- Keep unofficial/non-affiliation language prominent.
- Keep reads default, writes gated by `SMARTMOVING_ALLOW_WRITES=true`, destructive gated by `SMARTMOVING_ALLOW_DESTRUCTIVE=true`.

## Loop A: Astro/Starlight docs site scaffold

Build a static docs site under `site/` using Astro + Starlight or a similarly boring static Astro setup.

Required pages:

- Home landing page
- Quickstart
- Install
- MCP setup
- CLI docs
- AI agents
- Safety model
- Live testing
- Commands index

Acceptance:

- `cd site && npm install && npm run build` passes.
- Site can reuse repo docs or generate pages from existing docs.
- Hero emphasizes: unofficial SmartMoving MCP + CLI, 62 operations, read-only by default, agent-ready schema.
- Install CTA includes one-line npm install.

## Loop B: Agent docs, generated command references, llms.txt

Add agent-readable surfaces:

- `site/public/llms.txt`
- `site/public/llms-full.txt`
- `site/public/schema.json` generated from `smartmoving schema --json`
- Command reference pages grouped by customers/leads/opportunities/jobs/inventory/followups/communication/reference
- Agent-specific setup pages for Hermes, Claude Desktop, Cursor/generic MCP

Acceptance:

- `schema.json` has 62 operations.
- `llms.txt` links to schema, quickstart, safety, MCP setup, command docs.
- Command docs include safety levels and examples.
- Build passes.

## Loop C: Onboarding smoke test

Prove a fresh user flow works without touching real data beyond optional read-only ping.

Required tests:

- Pack tarball from `mcp-server`.
- Install tarball into a temp project or temp npm prefix.
- Run `smartmoving --help`.
- Run `smartmoving schema --json` and assert 62 operations.
- Run `smartmoving init` using temp HOME/config, no raw key stored.
- Run `smartmoving doctor --json` with fake key and verify safe failure/redaction.
- If real `SMARTMOVING_API_KEY` is present, optionally run only `doctor --json` or `smoke live --read-only --json`. Never run writes.

Acceptance:

- Scripted onboarding smoke output is saved under docs or site docs.
- No raw keys appear in output.
- Build/test/pack still pass.

## Loop D: Vercel preview/deploy prep and npm publish readiness

Prepare deployment and npm publish, but do not publish without approval.

Required:

- Add root or site scripts so Vercel knows how to build the docs site.
- Verify `vercel build` or `cd site && npm run build`.
- If Vercel CLI/project linking is available, create a preview deployment only, or production if Matt explicitly set that in the prompt. Do not assume custom domain.
- Verify public deployment URL with HTTP checks if created.
- Run `npm publish --dry-run` in `mcp-server`.
- Document exact publish command and required npm auth state.

Acceptance:

- PR updated with docs site and launch prep.
- PR comment includes site URL if deployed, onboarding smoke result, npm dry-run result, and remaining manual approvals.
