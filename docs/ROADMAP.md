# Roadmap and product ideas

This is the practical path from "internal MCP wrapper" to "useful public agent integration".

For the dedicated gog-style CLI roadmap and future implementation loops, see:

- `docs/CLI-EPIC-ROADMAP.md`
- `docs/plans/01-cli-init-doctor.md`
- `docs/plans/02-cli-schema-and-registry.md`
- `docs/plans/03-cli-read-tools.md`
- `docs/plans/04-cli-write-tools.md`
- `docs/plans/05-cli-destructive-safety.md`
- `docs/plans/06-agent-ux.md`
- `docs/plans/07-docs-site-and-command-index.md`
- `docs/plans/08-packaging-release-smoke.md`
- `docs/plans/09-power-features.md`

## Near-term hardening

1. **Mocked test suite**
   - Unit-test every tool module.
   - Lock endpoint paths, query casing, and request body shapes.
   - Add regression tests for SmartMoving quirks already discovered.

2. **Safer write tools**
   - Add optional `dryRun` to dangerous or high-impact write workflows where possible.
   - Add better descriptions on destructive operations.
   - Consider separate read-only and write-enabled builds/config modes.

3. **Pagination helpers**
   - Add tools such as `list_all_customers`, `list_all_leads`, or a generic paginated fetch helper.
   - Agents are bad at remembering to walk every page. Give them safer primitives.

4. **Reference cache helper**
   - Add `get_reference_snapshot` to fetch branches, users, tariffs, services, reasons, move sizes, and referral sources in one call.
   - Optionally cache with a TTL.

5. **Better error shaping**
   - Return structured errors with status, endpoint, safe request summary, and SmartMoving message.
   - Never echo API keys.

## High-value workflow tools

These are compound MCP tools that call multiple SmartMoving endpoints and return a clean agent-ready answer.

- `find_customer_context`: search customer, list opportunities, recent jobs, open follow-ups.
- `get_quote_context`: quote lookup plus jobs, payments, audit activity, documents, notes.
- `prepare_job_brief`: customer, addresses, stops, crew notes, materials, payments, and risks.
- `reconcile_job_materials`: estimated vs actual materials, fallback to audit activity when actual material lines are unavailable.
- `find_unlogged_supply_revenue`: jobs with material evidence but missing actual material lines or charges.
- `daily_dispatch_snapshot`: jobs by service date with crew, trucks, notes, and unresolved risks.
- `stale_followup_report`: overdue follow-ups by salesperson.
- `closed_job_write_guard`: check if a job can be updated before an agent tries to patch notes or materials.

## iHaul iMove-specific product ideas

These may live outside the public package if they depend on private workflows:

- Supply shrink dashboard using SmartMoving materials plus warehouse inventory audits.
- Revenue leakage report by branch, estimator, dispatcher, crew, and material type.
- Crew accountability timeline: what was estimated, loaded, sold, returned, and written off.
- Quote-to-close leakage: lead source, salesperson, follow-up cadence, cancel/lost reasons.
- Manager morning brief: today's jobs, unpaid balances, missing notes, material risk, follow-ups.
- End-of-day wrap: completed jobs, revenue, complaints, supply exceptions, tomorrow's constraints.

## Open-source community workflow

When ready to make the repo public:

1. Keep the API key out of history.
2. Add GitHub Actions for build/audit/tests.
3. Enable private vulnerability reporting.
4. Protect `main`.
5. Use issues for bugs and missing endpoints.
6. Use pull requests for all external contributions.
7. Mark starter tasks with `good first issue`.
8. Publish a clear policy that maintainers make the final merge call.

## Possible GitHub issue templates

- Bug report
- Missing endpoint request
- SmartMoving API quirk report
- Documentation improvement
- Security/private disclosure pointer

## Things not to do

- Do not add real customer data as fixtures.
- Do not make live API tests run by default.
- Do not hide destructive behavior behind vague tool names.
- Do not rely on agents to remember SmartMoving's date formats, pagination, or 1.0/2.0 opportunity differences. Encode that into tools and docs.
