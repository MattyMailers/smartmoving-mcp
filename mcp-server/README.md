# SmartMoving MCP Server package

Node/TypeScript stdio MCP server for the SmartMoving External API v1.

## Install

```bash
npm install
npm run build
```

## Run manually

```bash
export SMARTMOVING_API_KEY="replace-with-your-key"
npm start
```

In normal use, your AI agent launches `dist/index.js` as an MCP stdio server. See [`../docs/AGENT-INSTALL.md`](../docs/AGENT-INSTALL.md).

## Environment variables

- `SMARTMOVING_API_KEY`, required
- `SMARTMOVING_BASE_URL`, optional, defaults to `https://api-public.smartmoving.com/v1`

## Verification

```bash
npm run verify
```

This runs TypeScript build and high-severity npm audit.

## Available tools, 62 total

### Customer tools, 8

- `list_customers`: List customers with pagination and optional service-date filters.
- `get_customer`: Get a single customer by ID.
- `search_customers`: Search customers by name, phone, or email. Premium.
- `create_customer`: Create a customer. Premium.
- `update_customer`: Update a customer. Premium.
- `get_customer_opportunities`: List opportunities for a customer.
- `get_customer_storage_accounts`: List storage accounts for a customer.
- `get_customer_service_tickets`: List service tickets for a customer. Premium.

### Lead tools, 8

- `list_leads`: List leads with pagination.
- `get_lead`: Get a single lead.
- `create_lead`: Create a lead. Premium.
- `update_lead`: Full lead update. Premium.
- `patch_lead`: Partial lead update. Premium.
- `get_leads_by_salesperson`: List leads assigned to a salesperson. Premium.
- `convert_lead_to_opportunity`: Convert a lead into an opportunity. Premium.
- `get_lead_statuses`: Get lead status values.

### Opportunity tools, 9

- `get_opportunity`: Get opportunity details with optional include flags.
- `get_opportunity_by_quote`: Look up opportunity by quote number.
- `create_opportunity`: Create an opportunity. Premium.
- `update_opportunity`: Patch an opportunity. Premium.
- `get_opportunity_audit`: Get audit trail/activity log.
- `get_opportunity_documents`: List attached documents. Premium.
- `get_opportunity_payments`: List payment records.
- `add_attachment`: Upload a base64 attachment. Premium.
- `create_rooms`: Create inventory rooms. Premium.

### Job tools, 10

- `get_jobs_by_opportunity`: List jobs for an opportunity.
- `get_job`: Get detailed Premium job information with include flags.
- `create_job`: Create a job. Premium.
- `delete_job`: Delete a job. Premium, destructive.
- `confirm_job`: Confirm a job. Premium.
- `get_job_notes`: Read job note fields.
- `update_job_notes`: Replace provided job note fields.
- `append_job_note`: Append text to one note field without erasing prior text.
- `update_job_stops`: Replace all stops on a job. Premium.
- `add_job_materials`: Add estimated materials to a job. Premium.

### Inventory tools, 7

- `get_opportunity_inventory`: Get full opportunity inventory. Premium.
- `add_inventory_items`: Add items to a room. Premium.
- `update_inventory_item`: Update quantity or notes. Premium.
- `remove_inventory_item`: Remove an item. Premium, destructive.
- `submit_inventory_review`: Submit inventory for review. Premium.
- `get_master_inventory`: Get master inventory catalog. Premium.
- `get_room_types`: Get room types. Premium.

### Follow-up tools, 6

- `list_followups`: List follow-ups. Premium.
- `get_followup`: Get a follow-up. Premium.
- `create_followup`: Schedule a follow-up. Premium.
- `update_followup`: Update a follow-up. Premium.
- `delete_followup`: Delete a follow-up. Premium.
- `complete_followup`: Mark complete. Premium.

### Communication tools, 2

- `log_call`: Log a call on an opportunity. Premium.
- `log_note`: Log an internal note on an opportunity. Premium.

### Reference data tools, 12

- `get_branches`
- `get_move_sizes`
- `get_referral_sources`
- `get_service_types`
- `get_tariffs`
- `get_tariff_materials`
- `get_users`
- `get_arrival_windows`
- `get_bad_lead_reasons`
- `get_cancellation_reasons`
- `get_lost_reasons`
- `ping`

## Agent workflow notes

- Start with `ping` to verify auth.
- Load reference data before creating leads, opportunities, jobs, or materials.
- Use exact UUIDs from reference data. Do not invent IDs.
- For supply/revenue reconciliation, call `get_job` with all material and charge include flags.
- If actual materials are empty, call `get_opportunity_audit` and treat material-total activity as fallback evidence only.
- Before editing job notes, call `get_job_notes` and prefer `append_job_note` unless you intentionally need to replace a field.
- Closed jobs can reject job note/material updates. Use `log_note` on the opportunity for closed-job commentary.

## SmartMoving 1.0 vs 2.0 caveat

Some jobs expose item-level material details. Others expose only audit events or totals. Read [`../docs/OPPORTUNITY-V1-V2-LIMITATIONS.md`](../docs/OPPORTUNITY-V1-V2-LIMITATIONS.md) before treating SmartMoving as complete supply truth.
