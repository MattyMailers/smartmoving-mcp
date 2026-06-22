---
title: "leads commands"
description: "Generated SmartMoving leads command reference with safety levels and examples."
---

# leads commands

Generated from [schema.json](/schema.json). Start agents with `smartmoving doctor --json` and `smartmoving schema --json`; prefer read-only operations before any write.

| Command | Safety | Docs | Description |
| --- | --- | --- | --- |
| `smartmoving leads list` | READ | [Reference](/commands/leads/list/) | List leads with pagination. Returns a paginated list of lead records. Leads are prospective customers who have not yet been converted to opportunities. |
| `smartmoving leads get` | READ | [Reference](/commands/leads/get/) | Get detailed information about a specific lead by ID. Returns all lead details including contact info, move details, origin/destination addresses, and current status. |
| `smartmoving leads create` | WRITE | [Reference](/commands/leads/create/) | Create a new lead in SmartMoving. Premium tier endpoint. A lead represents a potential customer inquiry. You can provide either separate firstName/lastName fields or a combined 'name' field. The referralSourceId is required - use get_referral_sources to find valid IDs. |
| `smartmoving leads update` | WRITE | [Reference](/commands/leads/update/) | Fully update an existing lead record. Premium tier endpoint. This is a PUT operation - all fields will be set to the provided values (omitted fields may be cleared). For partial updates, use patch_lead instead. |
| `smartmoving leads patch` | WRITE | [Reference](/commands/leads/patch/) | Partially update an existing lead. Premium tier endpoint. Only the fields you provide will be modified; all other fields remain unchanged. Use this for small updates to a lead. |
| `smartmoving leads by-salesperson` | READ | [Reference](/commands/leads/by-salesperson/) | List leads assigned to a specific salesperson. Premium tier endpoint. Useful for viewing a sales rep's pipeline of uncontacted or in-progress leads. |
| `smartmoving leads convert` | WRITE | [Reference](/commands/leads/convert/) | Convert a lead into an opportunity. Premium tier endpoint. SmartMoving requires a complete conversion payload, not just the lead ID: customerId, referralSourceId, tariffId, moveDate, moveSizeId, salesPersonId, and serviceTypeId are required. Use search_customers/create_customer, get_referral_sources, get_tariffs, get_move_sizes, get_users, and get_service_types first. Follow-up reminders can only be created after this conversion because follow-ups are opportunity-only. |
| `smartmoving leads statuses` | READ | [Reference](/commands/leads/statuses/) | Get all possible lead status values. Returns the list of statuses a lead can be in (e.g. New, Contacted, Qualified, Lost, BadLead, Converted). Useful for understanding lead status codes. |
