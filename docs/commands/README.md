# SmartMoving CLI Command Index

> Generated from `smartmoving schema --json`. Do not edit command pages by hand; run `smartmoving docs generate` from `mcp-server/` after changing the operation registry.

The SmartMoving CLI is an unofficial, safety-gated terminal interface for authorized SmartMoving API users. It uses the same registry metadata as the MCP server so agents can map CLI commands to MCP tools.

## Safety badges

- READ: read-only command. Requires a local `smartmoving init` credential or `SMARTMOVING_API_KEY`; does not mutate CRM data.
- WRITE: requires `SMARTMOVING_ALLOW_WRITES=true` or `--allow-writes`; dry-run first.
- DESTRUCTIVE: requires writes + `SMARTMOVING_ALLOW_DESTRUCTIVE=true` + `--yes`; explicit human approval recommended.

## reference

- [READ] `smartmoving reference branches` — [docs](./reference/branches.md) — Get all branches (office locations) configured in SmartMoving. Branches are used to segment operations by location. Branch IDs are needed when creating leads, opportunities, or filtering data.
- [READ] `smartmoving reference move-sizes` — [docs](./reference/move-sizes.md) — Get all move size options (e.g. 'Studio', '1 Bedroom', '2-3 Bedroom', '4+ Bedroom'). Move sizes help categorize the scope of a move and are used when creating leads and opportunities.
- [READ] `smartmoving reference referral-sources` — [docs](./reference/referral-sources.md) — Get all referral sources (how customers find the company). Examples: 'Google', 'Yelp', 'Referral', 'Website'. A referral source ID is REQUIRED when creating leads and opportunities. Always call this first to get valid IDs.
- [READ] `smartmoving reference service-types` — [docs](./reference/service-types.md) — Get all service types offered (e.g. 'Local Moving', 'Long Distance', 'Packing Only', 'Storage'). Service type IDs are used when creating leads and opportunities to categorize the type of service requested.
- [READ] `smartmoving reference tariffs` — [docs](./reference/tariffs.md) — Get all tariffs (rate sheets / pricing structures). Tariffs define hourly rates, minimums, and material pricing. A tariff ID can be assigned to an opportunity to control pricing. Each tariff may be tied to a specific branch.
- [READ] `smartmoving reference tariff-materials` — [docs](./reference/tariff-materials.md) — Get materials available under a specific tariff. Premium tier endpoint. Returns packing materials (boxes, tape, paper, etc.) with their unit prices. Material IDs are used when adding materials to jobs via add_job_materials.
- [READ] `smartmoving reference users` — [docs](./reference/users.md) — Get all users in the SmartMoving account. Returns salespeople, dispatchers, managers, and other staff. User IDs are needed when assigning leads, opportunities, follow-ups, or filtering by salesperson.
- [READ] `smartmoving reference arrival-windows` — [docs](./reference/arrival-windows.md) — Get all arrival window options (e.g. '8AM-10AM', '10AM-12PM'). Arrival windows define the time range when the crew is expected to arrive at the customer's location. IDs are used when creating or updating opportunities.
- [READ] `smartmoving reference bad-lead-reasons` — [docs](./reference/bad-lead-reasons.md) — Get all bad lead reason options. These are used when marking a lead as 'Bad Lead' to categorize why (e.g. 'Spam', 'Out of Service Area', 'Duplicate').
- [READ] `smartmoving reference cancellation-reasons` — [docs](./reference/cancellation-reasons.md) — Get all cancellation reason options. These are required when changing an opportunity's status to Cancelled (status=20). Examples: 'Customer Changed Plans', 'Price Too High', 'Went With Competitor'.
- [READ] `smartmoving reference lost-reasons` — [docs](./reference/lost-reasons.md) — Get all lost reason options. These are required when changing an opportunity's status to Lost (status=30). Similar to cancellation reasons but for opportunities that were never booked.
- [READ] `smartmoving ping` — [docs](./reference/ping.md) — Health check endpoint. Use this to verify the SmartMoving API connection and that your API key is valid. Returns a simple success response if everything is working.

## customers

- [READ] `smartmoving customers list` — [docs](./customers/list.md) — List customers with pagination. Returns a paginated list of customer records from SmartMoving. Use this to browse or iterate through all customers in the system. Supports filtering by service date range.
- [READ] `smartmoving customers get` — [docs](./customers/get.md) — Get detailed information about a specific customer by their ID. Returns full customer profile including contact info, address, notes, and dates.
- [READ] `smartmoving customers search` — [docs](./customers/search.md) — Search customers by name, phone, or email. Premium tier endpoint. The search query must be at least 3 characters. Use this when you need to find a customer by partial information rather than browsing the full list.
- [WRITE] `smartmoving customers create` — [docs](./customers/create.md) — Create a new customer record in SmartMoving. Premium tier endpoint. At minimum a name (first/last or company) should be provided. Returns the created customer with its new ID.
- [WRITE] `smartmoving customers update` — [docs](./customers/update.md) — Update an existing customer record. Premium tier endpoint. Provide the customer ID and any fields you want to change. Fields not included will remain unchanged.
- [READ] `smartmoving customers opportunities` — [docs](./customers/opportunities.md) — List all opportunities (quotes/moves) associated with a specific customer. Returns an array of opportunity summaries for the given customer ID.
- [READ] `smartmoving customers storage-accounts` — [docs](./customers/storage-accounts.md) — List storage accounts for a specific customer. Returns storage unit details, monthly rates, and account status for the customer.
- [READ] `smartmoving customers service-tickets` — [docs](./customers/service-tickets.md) — List service tickets for a specific customer. Premium tier endpoint. Returns any open or resolved service tickets (claims, complaints, etc.) for the customer.

## leads

- [READ] `smartmoving leads list` — [docs](./leads/list.md) — List leads with pagination. Returns a paginated list of lead records. Leads are prospective customers who have not yet been converted to opportunities.
- [READ] `smartmoving leads get` — [docs](./leads/get.md) — Get detailed information about a specific lead by ID. Returns all lead details including contact info, move details, origin/destination addresses, and current status.
- [WRITE] `smartmoving leads create` — [docs](./leads/create.md) — Create a new lead in SmartMoving. Premium tier endpoint. A lead represents a potential customer inquiry. You can provide either separate firstName/lastName fields or a combined 'name' field. The referralSourceId is required - use get_referral_sources to find valid IDs.
- [WRITE] `smartmoving leads update` — [docs](./leads/update.md) — Fully update an existing lead record. Premium tier endpoint. This is a PUT operation - all fields will be set to the provided values (omitted fields may be cleared). For partial updates, use patch_lead instead.
- [WRITE] `smartmoving leads patch` — [docs](./leads/patch.md) — Partially update an existing lead. Premium tier endpoint. Only the fields you provide will be modified; all other fields remain unchanged. Use this for small updates to a lead.
- [READ] `smartmoving leads by-salesperson` — [docs](./leads/by-salesperson.md) — List leads assigned to a specific salesperson. Premium tier endpoint. Useful for viewing a sales rep's pipeline of uncontacted or in-progress leads.
- [WRITE] `smartmoving leads convert` — [docs](./leads/convert.md) — Convert a lead into an opportunity. Premium tier endpoint. SmartMoving requires a complete conversion payload, not just the lead ID: customerId, referralSourceId, tariffId, moveDate, moveSizeId, salesPersonId, and serviceTypeId are required. Use search_customers/create_customer, get_referral_sources, get_tariffs, get_move_sizes, get_users, and get_service_types first. Follow-up reminders can only be created after this conversion because follow-ups are opportunity-only.
- [READ] `smartmoving leads statuses` — [docs](./leads/statuses.md) — Get all possible lead status values. Returns the list of statuses a lead can be in (e.g. New, Contacted, Qualified, Lost, BadLead, Converted). Useful for understanding lead status codes.

## opportunities

- [READ] `smartmoving opportunities get` — [docs](./opportunities/get.md) — Get detailed information about a specific opportunity (quote/move). This is the core entity in SmartMoving representing a potential or booked move. Use the Include* boolean params to control which related data is returned (jobs, follow-ups, payments, documents, rooms). Including everything may result in large responses.
- [READ] `smartmoving opportunities by-quote` — [docs](./opportunities/by-quote.md) — Look up an opportunity by its quote number (e.g. 'Q-12345'). Use this when you have a quote number but not the opportunity UUID. Returns the same detailed view as get_opportunity.
- [WRITE] `smartmoving opportunities create` — [docs](./opportunities/create.md) — Create a new opportunity (quote) directly, bypassing the lead stage. Premium tier endpoint. An opportunity represents a potential move that can be priced, scheduled, and booked. The referralSourceId is required - use get_referral_sources to find valid IDs. You can provide either firstName/lastName or the combined 'name' field.
- [WRITE] `smartmoving opportunities update` — [docs](./opportunities/update.md) — Update an existing opportunity. Premium tier endpoint. This is a PATCH operation - only the fields you provide will be modified. Use this to update customer info, move details, pricing, status changes, etc. To mark as lost/cancelled, set the status and provide the corresponding reason ID.
- [READ] `smartmoving opportunities audit` — [docs](./opportunities/audit.md) — Get the audit trail / activity log for an opportunity. Shows a chronological history of all changes, status transitions, and actions performed on the opportunity.
- [READ] `smartmoving opportunities documents` — [docs](./opportunities/documents.md) — List all documents attached to an opportunity. Premium tier endpoint. Returns file metadata including name, category, URL, and upload date.
- [READ] `smartmoving opportunities payments` — [docs](./opportunities/payments.md) — List all payments recorded for an opportunity. Returns payment details including type, amount, date, and reference numbers.
- [WRITE] `smartmoving opportunities attachments add` — [docs](./opportunities/attachments-add.md) — Upload a file attachment to an opportunity. Premium tier endpoint. The file must be provided as a base64-encoded string. Use fileCategory to classify the document type.
- [WRITE] `smartmoving opportunities rooms create` — [docs](./opportunities/rooms-create.md) — Create rooms for an opportunity's inventory. Premium tier endpoint. Rooms are used to organize inventory items (e.g. 'Living Room', 'Master Bedroom'). Use get_room_types to find valid room type IDs.

## jobs

- [READ] `smartmoving jobs by-opportunity` — [docs](./jobs/by-opportunity.md) — List all jobs for an opportunity. A job represents a specific service event (moving day, packing day, etc.) within an opportunity. An opportunity can have multiple jobs (e.g. separate packing and moving days).
- [READ] `smartmoving jobs get` — [docs](./jobs/get.md) — Get detailed information about a specific job within an opportunity. Premium tier endpoint. Can include estimated/actual charges, estimated/actual materials, and stops. Use IncludeActualMaterials=true to pull supplies sold/used on completed jobs.
- [WRITE] `smartmoving jobs create-job` — [docs](./jobs/create-job.md) — Add a new job to an opportunity. Premium tier endpoint. Use this to schedule a moving day, packing day, or other service. Job types: 1=Moving, 3=Packing, 4=MovingAndPacking, 5=LoadOnly, 6=UnloadOnly, 7=Commercial, 8=StorageInBound, 9=StorageOutBound, 10=InnerHouse, 11=JunkRemoval, 12=LaborOnly.
- [DESTRUCTIVE] `smartmoving jobs delete` — [docs](./jobs/delete.md) — Delete a job from an opportunity. Premium tier endpoint. This permanently removes the job and its associated stops, materials, and crew assignments. Use with caution.
- [WRITE] `smartmoving jobs confirm` — [docs](./jobs/confirm.md) — Confirm a job on an opportunity. Premium tier endpoint. Marks the job as confirmed, indicating the customer has agreed to the scheduled date and services.
- [READ] `smartmoving jobs notes` — [docs](./jobs/notes.md) — Read all note fields on a specific job. This calls Premium job detail with IncludeNotes=true and returns crew, customer, internal, accounting, dispatcher notes, plus crew feedback when present. Use this before update_job_notes so you don't accidentally replace existing note text.
- [WRITE] `smartmoving jobs notes update` — [docs](./jobs/notes-update.md) — Update one or more note fields on a specific job. Premium tier endpoint. SmartMoving PATCH updates the provided note properties only, but each provided field value replaces that field. To add text below existing notes, use append_job_note instead.
- [WRITE] `smartmoving jobs notes append` — [docs](./jobs/notes-append.md) — Append text below an existing job note field without erasing the prior content. This reads the current notes, adds a blank line plus the new text, then PATCHes only the selected note field. Fails if the job is closed or SmartMoving rejects note updates.
- [WRITE] `smartmoving jobs stops update` — [docs](./jobs/stops-update.md) — Replace all stops on a job. Premium tier endpoint. This is a PUT operation that replaces the entire list of stops. Each stop has a type (PickUp=0 or DropOff=1) and an address. Use sortOrder to control the route sequence.
- [WRITE] `smartmoving jobs materials add` — [docs](./jobs/materials-add.md) — Add estimated materials to a job. Premium tier endpoint. Materials are items like boxes, tape, wrapping paper, etc. that will be used during the job. Use get_tariff_materials to find valid material IDs for the opportunity's tariff.

## inventory

- [READ] `smartmoving inventory opportunity` — [docs](./inventory/opportunity.md) — Get the full inventory for an opportunity. Premium tier endpoint. Returns all rooms and their inventory items with quantities, weights, and volumes. This gives a complete picture of what the customer is moving.
- [WRITE] `smartmoving inventory add-inventory-items` — [docs](./inventory/add-inventory-items.md) — Add inventory items to a specific room in an opportunity. Premium tier endpoint. Items reference the master inventory catalog (use get_master_inventory to find valid item IDs). Each item needs a masterInventoryItemId and a quantity.
- [WRITE] `smartmoving inventory update-inventory-item` — [docs](./inventory/update-inventory-item.md) — Update an existing inventory item in a room. Premium tier endpoint. Use this to change the quantity or notes for an item already in the inventory.
- [DESTRUCTIVE] `smartmoving inventory remove-item` — [docs](./inventory/remove-item.md) — Remove an inventory item from a room. Premium tier endpoint. Permanently deletes the item from the opportunity's inventory.
- [WRITE] `smartmoving inventory submit-review` — [docs](./inventory/submit-review.md) — Submit the inventory for review / finalization. Premium tier endpoint. Call this after all inventory items have been added and the inventory is complete. This typically triggers weight/volume calculations and may affect pricing.
- [READ] `smartmoving inventory master` — [docs](./inventory/master.md) — Get the master inventory catalog. Premium tier endpoint. Returns all available inventory items that can be added to an opportunity (e.g. 'Sofa', 'Queen Bed', 'Box - Large'). Each item has a default weight and volume. Use the item IDs when calling add_inventory_items.
- [READ] `smartmoving inventory room-types` — [docs](./inventory/room-types.md) — Get all available room types. Premium tier endpoint. Returns the catalog of room types (e.g. 'Living Room', 'Master Bedroom', 'Kitchen', 'Garage') that can be used when creating rooms for an opportunity's inventory.

## followups

- [READ] `smartmoving reports follow-up-gaps` — [docs](./reports/follow-up-gaps.md) — Audit up to 1000 SmartMoving job or quote numbers for an active assigned follow-up. Normalizes job-number suffixes, deduplicates quote lookups, and keeps missing follow-ups separate from invalid input, not-found records, and API errors.
- [READ] `smartmoving followups list` — [docs](./followups/list.md) — List all follow-ups for an opportunity. Premium tier endpoint. Follow-ups are scheduled tasks like callbacks, emails to send, or in-home estimates. Returns both pending and completed follow-ups.
- [READ] `smartmoving followups get` — [docs](./followups/get.md) — Get details of a specific follow-up. Premium tier endpoint. Returns full information including type, due date, assigned user, completion status, and notes.
- [WRITE] `smartmoving followups create` — [docs](./followups/create.md) — Create a new follow-up task on an OPPORTUNITY. SmartMoving does not support lead-level follow-ups through this endpoint: convert the lead to an opportunity first. Use this to schedule a callback, email, text, or in-home estimate. Types: 0=Email, 1=Call, 2=Text, 3=Other, 4=CMET. Required API field names are type, title, assignedToId, and dueDateTime.
- [WRITE] `smartmoving followups update` — [docs](./followups/update.md) — Update an existing follow-up. Premium tier endpoint. Use this to reschedule, reassign, change type, or update notes on a follow-up task.
- [DESTRUCTIVE] `smartmoving followups delete` — [docs](./followups/delete.md) — Delete a follow-up from an opportunity. Premium tier endpoint. Permanently removes the follow-up task. Use complete_followup instead if the task was actually performed.
- [WRITE] `smartmoving followups complete-followup` — [docs](./followups/complete-followup.md) — Mark a follow-up as complete. Premium tier endpoint. Use this when the scheduled callback, email, or task has been performed. The follow-up remains in the history but is flagged as completed.

## communication

- [WRITE] `smartmoving communication call` — [docs](./communication/call.md) — Log a phone call on an opportunity. Premium tier endpoint. Records an inbound or outbound call with its outcome. Use this to track all phone interactions with the customer. Call types: 0=Outbound, 1=Inbound. Outcomes: 0=NoAnswer, 1=Busy, 2=WrongNumber, 3=LeftLiveMessage, 4=LeftVoicemail, 5=Connected, 6=NumberDisconnected.
- [WRITE] `smartmoving communication note` — [docs](./communication/note.md) — Log a note on an opportunity. Premium tier endpoint. Use this to record any interaction, observation, or update that isn't a phone call. Notes appear in the opportunity's activity timeline.
