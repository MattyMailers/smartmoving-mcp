---
title: "opportunities commands"
description: "Generated SmartMoving opportunities command reference with safety levels and examples."
---

# opportunities commands

Generated from [schema.json](/schema.json). Start agents with `smartmoving doctor --json` and `smartmoving schema --json`; prefer read-only operations before any write.

| Command | Safety | Docs | Description |
| --- | --- | --- | --- |
| `smartmoving opportunities get` | READ | [Reference](/commands/opportunities/get/) | Get detailed information about a specific opportunity (quote/move). This is the core entity in SmartMoving representing a potential or booked move. Use the Include* boolean params to control which related data is returned (jobs, follow-ups, payments, documents, rooms). Including everything may result in large responses. |
| `smartmoving opportunities by-quote` | READ | [Reference](/commands/opportunities/by-quote/) | Look up an opportunity by its quote number (e.g. 'Q-12345'). Use this when you have a quote number but not the opportunity UUID. Returns the same detailed view as get_opportunity. |
| `smartmoving opportunities create` | WRITE | [Reference](/commands/opportunities/create/) | Create a new opportunity (quote) directly, bypassing the lead stage. Premium tier endpoint. An opportunity represents a potential move that can be priced, scheduled, and booked. The referralSourceId is required - use get_referral_sources to find valid IDs. You can provide either firstName/lastName or the combined 'name' field. |
| `smartmoving opportunities update` | WRITE | [Reference](/commands/opportunities/update/) | Update an existing opportunity. Premium tier endpoint. This is a PATCH operation - only the fields you provide will be modified. Use this to update customer info, move details, pricing, status changes, etc. To mark as lost/cancelled, set the status and provide the corresponding reason ID. |
| `smartmoving opportunities audit` | READ | [Reference](/commands/opportunities/audit/) | Get the audit trail / activity log for an opportunity. Shows a chronological history of all changes, status transitions, and actions performed on the opportunity. |
| `smartmoving opportunities documents` | READ | [Reference](/commands/opportunities/documents/) | List all documents attached to an opportunity. Premium tier endpoint. Returns file metadata including name, category, URL, and upload date. |
| `smartmoving opportunities payments` | READ | [Reference](/commands/opportunities/payments/) | List all payments recorded for an opportunity. Returns payment details including type, amount, date, and reference numbers. |
| `smartmoving opportunities attachments add` | WRITE | [Reference](/commands/opportunities/attachments-add/) | Upload a file attachment to an opportunity. Premium tier endpoint. The file must be provided as a base64-encoded string. Use fileCategory to classify the document type. |
| `smartmoving opportunities rooms create` | WRITE | [Reference](/commands/opportunities/rooms-create/) | Create rooms for an opportunity's inventory. Premium tier endpoint. Rooms are used to organize inventory items (e.g. 'Living Room', 'Master Bedroom'). Use get_room_types to find valid room type IDs. |
