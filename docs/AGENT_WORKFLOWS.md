# SmartMoving Agent Workflows

## Lead → opportunity → follow-up reminder

SmartMoving follow-ups are **opportunity-only**. The API will not create a follow-up directly on a bare lead. If a user asks to set a reminder for a salesperson to text/call/email a lead, use this sequence:

1. Create or update the lead.
   - Required lead creation fields include `referralSourceId` and usually `branchId`.
   - `referralSource` and `referralSourceId` are mutually exclusive. Prefer `referralSourceId`.
   - Patch/update can change `referralSourceId`, `moveDate`, `moveSizeId`, `serviceTypeId`, and `salesPersonId`.

2. Resolve required reference IDs.
   - `get_users` for `salesPersonId`, for example Katie Powell.
   - `get_referral_sources`, for example `Fastrac`.
   - `get_move_sizes`, for example `10x30 Storage Unit`.
   - `get_service_types`, for example `Moving` has ID `1`.
   - `get_tariffs`, choose an enabled tariff that applies to the branch, commonly `Standard Service`.

3. Search or create the customer.
   - `convert_lead_to_opportunity` requires `customerId`.
   - If `search_customers` does not find the person by email or phone, call `create_customer` first.

4. Convert lead to opportunity with the complete payload.
   Required fields:
   - `leadId`
   - `customerId`
   - `referralSourceId`
   - `tariffId`
   - `moveDate` as `yyyy-MM-dd`, must be today or future
   - `moveSizeId`
   - `salesPersonId`
   - `serviceTypeId`, numeric JobType, for example `1` for Moving
   Optional but useful:
   - `branchId`
   - `originAddress` and `destinationAddress` using SmartMoving `GeocodedAddress` fields: `fullAddress`, `street`, `unit`, `city`, `state`, `zip`, `lat`, `lng`, `country`.

5. Create the follow-up on the resulting opportunity.
   Use `/api/premium/opportunities/{opportunityId}/followups` with the real API field names:
   - `type`: `0=Email`, `1=Call`, `2=Text`, `3=Other`, `4=CMET`
   - `title`
   - `assignedToId`
   - `dueDateTime`, ISO datetime with timezone when possible, for example `2026-06-05T09:00:00-06:00`
   - `notes`
   - `completed: false`

## Example: Carleen Nelson pattern

- Referral source: `Fastrac`
- Salesperson: Katie Powell
- Move date: `2026-06-25`
- Move size: `10x30 Storage Unit`
- Service type: `Moving` (`1`)
- Follow-up type: `Text` (`2`)

Important lesson: do not try to create a lead reminder with only `leadId` and `salesPersonId`. SmartMoving returns validation errors for missing customer, tariff, move size, service type, referral source, and move date. Convert properly first, then create the follow-up on the opportunity.
