# SmartMoving API Workflow Guides

[Back to Overview](./README.md)

---

## Table of Contents

- [Overview](#overview)
- [Workflow 1: Lead-to-Opportunity Conversion](#workflow-1-lead-to-opportunity-conversion)
- [Workflow 2: Direct Opportunity Creation](#workflow-2-direct-opportunity-creation)
- [Workflow 3: Managing Jobs](#workflow-3-managing-jobs)
- [Workflow 4: Inventory Management](#workflow-4-inventory-management)
- [Workflow 5: Communication Logging](#workflow-5-communication-logging)
- [Workflow 6: Follow-up Management](#workflow-6-follow-up-management)
- [Workflow 7: Payment Tracking](#workflow-7-payment-tracking)
- [Workflow 8: Data Synchronization](#workflow-8-data-synchronization)

---

## Overview

This guide describes the most common integration workflows using the SmartMoving External API. Each workflow includes a step-by-step sequence with the relevant endpoints, prerequisites, and curl examples.

**Prerequisites for all workflows:**
- A valid API key (Premium tier for write operations)
- Reference data loaded (branches, move sizes, referral sources, service types, tariffs, users)

**Tip:** Always start by loading reference data. Many create/update operations require IDs from reference data endpoints. Cache this data locally and refresh it periodically rather than fetching it on every request.

**iHaul iMove note:** SmartMoving's public `v1` API has two practical opportunity/job behaviors. Some 1.0-style jobs expose charges and item-level `actualMaterials`; some 2.0-style/type-4 jobs expose payments, documents, stops, notes, and audit material-total changes but not item-level material lines. See [Opportunity 1.0 vs 2.0 Limitations](./OPPORTUNITY-V1-V2-LIMITATIONS.md) before building supply/revenue reconciliation.

---

## Workflow 1: Lead-to-Opportunity Conversion

This is the most common sales workflow: a new lead comes in, a salesperson qualifies it, and it gets converted into a full opportunity.

### Step 1: Load Reference Data

Before creating leads or opportunities, fetch the reference data you will need.

```bash
# Get referral sources (for referralSourceId)
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/referral-sources

# Get branches (for branchId)
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/branches

# Get move sizes (for moveSizeId)
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/move-sizes

# Get service types (for serviceTypeId)
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/service-types

# Get tariffs (for tariffId)
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/tariffs

# Get users (for salesPersonId)
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/users
```

### Step 2: Create the Lead

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sarah",
    "lastName": "Williams",
    "phoneNumber": "555-456-7890",
    "emailAddress": "sarah.williams@example.com",
    "moveDate": "2024-12-20",
    "referralSourceId": "REFERRAL_SOURCE_UUID",
    "serviceType": 1,
    "branchId": "BRANCH_UUID",
    "bedrooms": 3,
    "originAddress": {
      "street": "789 Pine Rd",
      "city": "Austin",
      "state": "TX",
      "zip": "78702"
    },
    "destinationAddress": {
      "street": "321 Elm Blvd",
      "city": "Round Rock",
      "state": "TX",
      "zip": "78664"
    },
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "local-movers-austin",
    "notes": "Customer found us through Google search. Needs to move by end of December."
  }' \
  https://api-public.smartmoving.com/v1/api/premium/leads
```

Save the returned `leadId` from the response.

### Step 3: Check for Existing Customer (Optional)

Search to see if this customer already exists in the system to avoid duplicates.

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/customers/search?searchQuery=Sarah%20Williams"
```

### Step 4: Create Customer (If New)

If no matching customer was found:

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Williams",
    "phoneNumber": "555-456-7890",
    "phoneType": 0,
    "emailAddress": "sarah.williams@example.com",
    "address": {
      "street": "789 Pine Rd",
      "city": "Austin",
      "state": "TX",
      "zip": "78702"
    }
  }' \
  https://api-public.smartmoving.com/v1/api/premium/customers
```

Save the returned `customerId`.

### Step 5: Convert Lead to Opportunity

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUSTOMER_UUID",
    "referralSourceId": "REFERRAL_SOURCE_UUID",
    "tariffId": "TARIFF_UUID",
    "moveDate": "2024-12-20",
    "moveSizeId": "MOVE_SIZE_UUID",
    "salesPersonId": "SALESPERSON_UUID",
    "serviceTypeId": "SERVICE_TYPE_UUID",
    "branchId": "BRANCH_UUID",
    "originAddress": {
      "street": "789 Pine Rd",
      "city": "Austin",
      "state": "TX",
      "zip": "78702"
    },
    "destinationAddress": {
      "street": "321 Elm Blvd",
      "city": "Round Rock",
      "state": "TX",
      "zip": "78664"
    }
  }' \
  https://api-public.smartmoving.com/v1/api/premium/lead/LEAD_UUID/convert
```

The lead is now an opportunity. Save the returned opportunity details.

### Step 6: Verify the Opportunity

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/opportunities/OPPORTUNITY_UUID?IncludeTripInfo=true"
```

---

## Workflow 2: Direct Opportunity Creation

When you want to skip the lead stage and create an opportunity directly (e.g., for walk-in customers or phone bookings).

### Step 1: Create or Find Customer

Search for existing customer or create a new one (see Workflow 1, Steps 3-4).

### Step 2: Create the Opportunity

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tariffId": "TARIFF_UUID",
    "salesPersonId": "SALESPERSON_UUID",
    "customerId": "CUSTOMER_UUID",
    "referralSourceId": "REFERRAL_SOURCE_UUID",
    "moveDate": "2024-12-20",
    "moveSizeId": "MOVE_SIZE_UUID",
    "serviceTypeId": "SERVICE_TYPE_UUID",
    "branchId": "BRANCH_UUID",
    "originAddress": {
      "street": "789 Pine Rd",
      "city": "Austin",
      "state": "TX",
      "zip": "78702"
    },
    "destinationAddress": {
      "street": "321 Elm Blvd",
      "city": "Round Rock",
      "state": "TX",
      "zip": "78664"
    },
    "customField01": "Walk-in customer",
    "utmInformation": {
      "utmSource": "walk-in",
      "utmMedium": "direct"
    }
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunity
```

### Step 3: Add Details to the Opportunity

Update the opportunity with additional details:

```bash
curl -X PATCH \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "volume": 800,
    "weight": 6000,
    "depositAmount": 200.00,
    "isBinding": false
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPPORTUNITY_UUID
```

---

## Workflow 3: Managing Jobs

After creating an opportunity, you typically need to create and configure one or more jobs.

### Step 1: Create a Job

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"serviceType": 4}' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs
```

Save the returned `jobId`. In this example, `serviceType: 4` creates a "Moving and Packing" job.

### Step 2: Configure Job Stops

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "address": {
        "street": "789 Pine Rd",
        "city": "Austin",
        "state": "TX",
        "zip": "78702"
      },
      "propertyType": 1,
      "stopType": 0,
      "order": 0,
      "stairs": 2,
      "elevator": false
    },
    {
      "address": {
        "street": "321 Elm Blvd",
        "city": "Round Rock",
        "state": "TX",
        "zip": "78664"
      },
      "propertyType": 2,
      "stopType": 1,
      "order": 1,
      "stairs": 0,
      "elevator": false
    }
  ]' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID/stops
```

### Step 3: Add Notes for the Crew

Only use the job notes PATCH when the Premium job detail / jobs endpoint says the job is not closed. Closed jobs return `400 {"message":"Job is closed and cannot be updated."}`. If you only need to log an integration note on a closed or 2.0-style opportunity, use `POST /api/premium/opportunities/{opportunityId}/communication/notes` instead.

```bash
curl -X PATCH \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "crewNotes": "Large L-shaped couch will not fit through front door. Use back entrance. Piano on second floor requires piano board.",
    "customerNotes": "Arrival window is 8-10 AM. Parking available in driveway.",
    "internalNotes": "VIP customer - referred by business partner.",
    "dispatcherNotes": "Need 4-person crew minimum due to piano."
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID/notes
```

### Step 4: Add Estimated Materials

First, get available materials for the tariff:

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/tariffs/TARIFF_UUID/materials
```

Then add materials to the job:

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"materialId": "SMALL_BOX_UUID", "quantity": 20},
    {"materialId": "MEDIUM_BOX_UUID", "quantity": 15},
    {"materialId": "LARGE_BOX_UUID", "quantity": 10},
    {"materialId": "WARDROBE_BOX_UUID", "quantity": 4},
    {"materialId": "PACKING_TAPE_UUID", "quantity": 6}
  ]' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/Estimated/jobs/JOB_UUID/materials
```

### Step 5: Confirm the Job

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID/confirm
```

### Step 6: Verify Job Configuration

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID?IncludeEstimatedCharges=true&IncludeEstimatedMaterials=true&IncludeStops=true"
```

For supply/revenue reconciliation, include all tested flags:

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID?IncludeEstimatedCharges=true&IncludeActualCharges=true&IncludeEstimatedMaterials=true&IncludeActualMaterials=true&IncludeStops=true&IncludeNotes=true&IncludeDispatchInfo=true&IncludeCharges=true"
```

If `actualMaterials` is empty on a type-4/2.0-style job, fetch `GET /api/opportunities/OPP_UUID/audit-activity` and parse material-total changes as a fallback signal.

---

## Workflow 4: Inventory Management

Build and manage a detailed inventory for an opportunity.

### Step 1: Get Room Types

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/room-types
```

### Step 2: Create Rooms

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"name": "Master Bedroom", "roomTypeId": "BEDROOM_TYPE_UUID"},
    {"name": "Guest Bedroom", "roomTypeId": "BEDROOM_TYPE_UUID"},
    {"name": "Kitchen", "roomTypeId": "KITCHEN_TYPE_UUID"},
    {"name": "Living Room", "roomTypeId": "LIVING_ROOM_TYPE_UUID"},
    {"name": "Garage", "roomTypeId": "GARAGE_TYPE_UUID"}
  ]' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/rooms
```

### Step 3: Get Master Inventory List

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/inventory?Page=1&PageSize=100"
```

### Step 4: Add Items to Rooms

Add items from the master list:

```bash
# Add a queen bed to the master bedroom
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "masterItemId": "QUEEN_BED_UUID",
    "quantity": 1,
    "changeVolumeWeightCalculationMode": true
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory/rooms/MASTER_BEDROOM_UUID

# Add a dresser to the master bedroom
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "masterItemId": "DRESSER_UUID",
    "quantity": 2
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory/rooms/MASTER_BEDROOM_UUID
```

Add a custom item not in the master list:

```bash
# Add a custom item to the living room
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Built-In Bookshelf",
    "quantity": 1,
    "saveToMaster": true,
    "markAsNeedsReview": true
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory/rooms/LIVING_ROOM_UUID
```

### Step 5: Update Item Details (If Needed)

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3,
    "volume": 30.0,
    "weight": 200
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory/rooms/ROOM_UUID/items/ITEM_UUID
```

### Step 6: Review the Full Inventory

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory
```

### Step 7: Submit Inventory for Review

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory/submit
```

### Removing Items

If an item was added by mistake:

```bash
curl -X DELETE \
  -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory/rooms/ROOM_UUID/items/ITEM_UUID
```

---

## Workflow 5: Communication Logging

Track all customer communications on an opportunity for a complete audit trail.

### Logging an Outbound Call

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "callType": 0,
    "callDateTime": "2024-08-15T14:30:00Z",
    "outcome": 5,
    "description": "Called customer to discuss move details. Confirmed 3-bedroom home, piano needs special handling. Customer prefers morning arrival window.",
    "fromNumber": "555-000-1111",
    "toNumber": "555-456-7890",
    "createdBy": "SALESPERSON_UUID"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/communication/calls
```

### Logging an Inbound Call

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "callType": 1,
    "callDateTime": "2024-08-16T09:15:00Z",
    "outcome": 5,
    "description": "Customer called to add storage-in-transit to the move. Needs 2 weeks of storage before final delivery.",
    "fromNumber": "555-456-7890",
    "toNumber": "555-000-1111",
    "createdBy": "SALESPERSON_UUID"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/communication/calls
```

### Logging a Missed Call

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "callType": 0,
    "callDateTime": "2024-08-17T11:00:00Z",
    "outcome": 4,
    "description": "Left voicemail regarding updated estimate."
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/communication/calls
```

### Adding a Note

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Email sent with revised estimate reflecting storage-in-transit addition. Total estimate increased from $3,200 to $3,800. Customer has 48 hours to review before follow-up call.",
    "createdBy": "SALESPERSON_UUID"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/communication/notes
```

### Uploading a Related Document

```bash
# Encode the file to base64 first:
# base64 -i estimate-v2.pdf -o estimate-v2.b64

curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "revised-estimate-v2.pdf",
    "fileData": "BASE64_ENCODED_CONTENT",
    "category": 0
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/attachments
```

---

## Workflow 6: Follow-up Management

Create and manage follow-up tasks to ensure timely customer engagement.

### Create a Follow-up Sequence

After sending an estimate, create a series of follow-ups:

```bash
# Follow-up 1: Call in 2 days
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": 1,
    "title": "Follow up on estimate - first touch",
    "assignedToId": "SALESPERSON_UUID",
    "dueDateTime": "2024-08-19T10:00:00Z",
    "notes": "Call to check if customer reviewed the estimate and answer any questions"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups

# Follow-up 2: Email in 5 days if not booked
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": 0,
    "title": "Send follow-up email with special offer",
    "assignedToId": "SALESPERSON_UUID",
    "dueDateTime": "2024-08-22T09:00:00Z",
    "notes": "If not booked yet, send email with 10% early booking discount"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups

# Follow-up 3: Final call in 7 days
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": 1,
    "title": "Final follow-up call",
    "assignedToId": "SALESPERSON_UUID",
    "dueDateTime": "2024-08-24T14:00:00Z",
    "notes": "Last attempt before moving to cold leads"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups
```

### List Follow-ups for an Opportunity

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups
```

### Complete a Follow-up

After making the follow-up call:

```bash
# Mark the follow-up as complete
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups/FOLLOWUP_UUID/mark-complete

# Log the call that was made
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "callType": 0,
    "callDateTime": "2024-08-19T10:05:00Z",
    "outcome": 5,
    "description": "Follow-up call completed. Customer wants to proceed. Booking confirmed for Dec 20."
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/communication/calls
```

### Reschedule a Follow-up

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": 1,
    "title": "Rescheduled follow-up call",
    "assignedToId": "SALESPERSON_UUID",
    "dueDateTime": "2024-08-20T15:00:00Z",
    "notes": "Customer was in a meeting. Rescheduled for tomorrow afternoon."
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups/FOLLOWUP_UUID
```

### Delete Unnecessary Follow-ups

If the customer booked, cancel remaining follow-ups:

```bash
curl -X DELETE \
  -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups/FOLLOWUP_UUID
```

---

## Workflow 7: Payment Tracking

Monitor payments across opportunities and storage accounts.

### Get Opportunity Payments

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/payments/opportunities/OPP_UUID
```

**Example Response:**

```json
[
  {
    "id": "pay-uuid-1",
    "amount": 200.00,
    "paymentType": 3,
    "paymentSource": 2,
    "paymentCategory": 0,
    "paymentDate": "2024-08-15T14:30:00Z",
    "notes": "Deposit via customer portal",
    "opportunityId": "OPP_UUID",
    "jobId": null
  },
  {
    "id": "pay-uuid-2",
    "amount": 3600.00,
    "paymentType": 3,
    "paymentSource": 1,
    "paymentCategory": 1,
    "paymentDate": "2024-12-20T18:00:00Z",
    "notes": "Balance due - collected on completion",
    "opportunityId": "OPP_UUID",
    "jobId": "JOB_UUID"
  }
]
```

### Get Storage Account Payments

```bash
# First, get the customer's storage accounts
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/customers/CUSTOMER_UUID/storage-accounts?Page=1&PageSize=10"

# Then get payments for a specific storage account
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/payments/storage-accounts/STORAGE_ACCOUNT_UUID
```

### Track Payment Status on an Opportunity

Retrieve the full opportunity with payments to see financial status:

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/opportunities/OPP_UUID?IncludePayments=true"
```

Compare the `estimatedTotal.finalTotal` against the sum of payments to determine the remaining balance.

---

## Workflow 8: Data Synchronization

Synchronize SmartMoving data with an external system (CRM, accounting, reporting).

### Initial Full Sync

Load all data in sequence:

```bash
# 1. Sync reference data first
curl -H "x-api-key: YOUR_API_KEY" https://api-public.smartmoving.com/v1/api/branches
curl -H "x-api-key: YOUR_API_KEY" https://api-public.smartmoving.com/v1/api/move-sizes
curl -H "x-api-key: YOUR_API_KEY" https://api-public.smartmoving.com/v1/api/referral-sources
curl -H "x-api-key: YOUR_API_KEY" https://api-public.smartmoving.com/v1/api/service-types
curl -H "x-api-key: YOUR_API_KEY" https://api-public.smartmoving.com/v1/api/tariffs
curl -H "x-api-key: YOUR_API_KEY" https://api-public.smartmoving.com/v1/api/users

# 2. Sync all customers (paginate through all pages)
PAGE=1
LAST_PAGE=false
while [ "$LAST_PAGE" != "true" ]; do
  RESPONSE=$(curl -s -H "x-api-key: YOUR_API_KEY" \
    "https://api-public.smartmoving.com/v1/api/customers?Page=$PAGE&PageSize=100")
  # Process customers...
  LAST_PAGE=$(echo "$RESPONSE" | jq -r '.lastPage')
  PAGE=$((PAGE + 1))
  sleep 0.5  # Rate limit courtesy delay
done

# 3. Sync all leads
PAGE=1
LAST_PAGE=false
while [ "$LAST_PAGE" != "true" ]; do
  RESPONSE=$(curl -s -H "x-api-key: YOUR_API_KEY" \
    "https://api-public.smartmoving.com/v1/api/leads?Page=$PAGE&PageSize=100")
  # Process leads...
  LAST_PAGE=$(echo "$RESPONSE" | jq -r '.lastPage')
  PAGE=$((PAGE + 1))
  sleep 0.5
done
```

### Incremental Sync by Date Range

Use date filters to sync only recent changes:

```bash
# Sync customers with service dates in the last 30 days
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/customers?FromServiceDate=20240801&ToServiceDate=20240831&Page=1&PageSize=100"
```

### Deep Sync: Opportunity with All Details

For each opportunity, fetch the full details including all related data:

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/opportunities/OPP_UUID?IncludeTripInfo=true&IncludePayments=true&IncludeSurveys=true&IncludeJobAddresses=true&IncludeTasks=true&IncludeFiles=true&IncludePhotos=true&IncludeDocuments=true&IncludeCharges=true"
```

### Sync Best Practices

1. **Cache reference data** (branches, move sizes, users, etc.) locally. Refresh daily or on demand.
2. **Use pagination** with reasonable page sizes (50-100 records per page).
3. **Add delays** between requests (250-500ms) during bulk syncs to stay within rate limits.
4. **Store the last sync timestamp** and use date filters when available.
5. **Handle errors gracefully** -- retry on 429/5xx, skip and log on 4xx.
6. **Track IDs** -- store SmartMoving UUIDs alongside your internal IDs for mapping.
