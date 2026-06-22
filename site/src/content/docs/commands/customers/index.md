---
title: "customers commands"
description: "Generated SmartMoving customers command reference with safety levels and examples."
---

# customers commands

Generated from [schema.json](/schema.json). Start agents with `smartmoving doctor --json` and `smartmoving schema --json`; prefer read-only operations before any write.

| Command | Safety | Docs | Description |
| --- | --- | --- | --- |
| `smartmoving customers list` | READ | [Reference](/commands/customers/list/) | List customers with pagination. Returns a paginated list of customer records from SmartMoving. Use this to browse or iterate through all customers in the system. Supports filtering by service date range. |
| `smartmoving customers get` | READ | [Reference](/commands/customers/get/) | Get detailed information about a specific customer by their ID. Returns full customer profile including contact info, address, notes, and dates. |
| `smartmoving customers search` | READ | [Reference](/commands/customers/search/) | Search customers by name, phone, or email. Premium tier endpoint. The search query must be at least 3 characters. Use this when you need to find a customer by partial information rather than browsing the full list. |
| `smartmoving customers create` | WRITE | [Reference](/commands/customers/create/) | Create a new customer record in SmartMoving. Premium tier endpoint. At minimum a name (first/last or company) should be provided. Returns the created customer with its new ID. |
| `smartmoving customers update` | WRITE | [Reference](/commands/customers/update/) | Update an existing customer record. Premium tier endpoint. Provide the customer ID and any fields you want to change. Fields not included will remain unchanged. |
| `smartmoving customers opportunities` | READ | [Reference](/commands/customers/opportunities/) | List all opportunities (quotes/moves) associated with a specific customer. Returns an array of opportunity summaries for the given customer ID. |
| `smartmoving customers storage-accounts` | READ | [Reference](/commands/customers/storage-accounts/) | List storage accounts for a specific customer. Returns storage unit details, monthly rates, and account status for the customer. |
| `smartmoving customers service-tickets` | READ | [Reference](/commands/customers/service-tickets/) | List service tickets for a specific customer. Premium tier endpoint. Returns any open or resolved service tickets (claims, complaints, etc.) for the customer. |
