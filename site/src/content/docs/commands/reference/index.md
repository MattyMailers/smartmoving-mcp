---
title: "reference commands"
description: "Generated SmartMoving reference command reference with safety levels and examples."
---

# reference commands

Generated from [schema.json](/schema.json). Start agents with `smartmoving doctor --json` and `smartmoving schema --json`; prefer read-only operations before any write.

| Command | Safety | Docs | Description |
| --- | --- | --- | --- |
| `smartmoving reference branches` | READ | [Reference](/commands/reference/branches/) | Get all branches (office locations) configured in SmartMoving. Branches are used to segment operations by location. Branch IDs are needed when creating leads, opportunities, or filtering data. |
| `smartmoving reference move-sizes` | READ | [Reference](/commands/reference/move-sizes/) | Get all move size options (e.g. 'Studio', '1 Bedroom', '2-3 Bedroom', '4+ Bedroom'). Move sizes help categorize the scope of a move and are used when creating leads and opportunities. |
| `smartmoving reference referral-sources` | READ | [Reference](/commands/reference/referral-sources/) | Get all referral sources (how customers find the company). Examples: 'Google', 'Yelp', 'Referral', 'Website'. A referral source ID is REQUIRED when creating leads and opportunities. Always call this first to get valid IDs. |
| `smartmoving reference service-types` | READ | [Reference](/commands/reference/service-types/) | Get all service types offered (e.g. 'Local Moving', 'Long Distance', 'Packing Only', 'Storage'). Service type IDs are used when creating leads and opportunities to categorize the type of service requested. |
| `smartmoving reference tariffs` | READ | [Reference](/commands/reference/tariffs/) | Get all tariffs (rate sheets / pricing structures). Tariffs define hourly rates, minimums, and material pricing. A tariff ID can be assigned to an opportunity to control pricing. Each tariff may be tied to a specific branch. |
| `smartmoving reference tariff-materials` | READ | [Reference](/commands/reference/tariff-materials/) | Get materials available under a specific tariff. Premium tier endpoint. Returns packing materials (boxes, tape, paper, etc.) with their unit prices. Material IDs are used when adding materials to jobs via add_job_materials. |
| `smartmoving reference users` | READ | [Reference](/commands/reference/users/) | Get all users in the SmartMoving account. Returns salespeople, dispatchers, managers, and other staff. User IDs are needed when assigning leads, opportunities, follow-ups, or filtering by salesperson. |
| `smartmoving reference arrival-windows` | READ | [Reference](/commands/reference/arrival-windows/) | Get all arrival window options (e.g. '8AM-10AM', '10AM-12PM'). Arrival windows define the time range when the crew is expected to arrive at the customer's location. IDs are used when creating or updating opportunities. |
| `smartmoving reference bad-lead-reasons` | READ | [Reference](/commands/reference/bad-lead-reasons/) | Get all bad lead reason options. These are used when marking a lead as 'Bad Lead' to categorize why (e.g. 'Spam', 'Out of Service Area', 'Duplicate'). |
| `smartmoving reference cancellation-reasons` | READ | [Reference](/commands/reference/cancellation-reasons/) | Get all cancellation reason options. These are required when changing an opportunity's status to Cancelled (status=20). Examples: 'Customer Changed Plans', 'Price Too High', 'Went With Competitor'. |
| `smartmoving reference lost-reasons` | READ | [Reference](/commands/reference/lost-reasons/) | Get all lost reason options. These are required when changing an opportunity's status to Lost (status=30). Similar to cancellation reasons but for opportunities that were never booked. |
| `smartmoving ping` | READ | [Reference](/commands/reference/ping/) | Health check endpoint. Use this to verify the SmartMoving API connection and that your API key is valid. Returns a simple success response if everything is working. |
