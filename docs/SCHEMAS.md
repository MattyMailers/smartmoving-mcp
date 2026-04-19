# SmartMoving API Data Schemas Reference

[Back to Overview](./README.md)

---

## Table of Contents

- [Overview](#overview)
- [Core Entities](#core-entities)
  - [CustomerViewModel](#customerviewmodel)
  - [LeadViewModel](#leadviewmodel)
  - [OpportunityDetailsViewModel](#opportunitydetailsviewmodel)
  - [JobViewModel](#jobviewmodel)
- [Address Schemas](#address-schemas)
  - [GeocodedAddress](#geocodedaddress)
  - [AddressInput](#addressinput)
- [Communication Schemas](#communication-schemas)
  - [FollowUpViewModel](#followupviewmodel)
  - [CallLogInput](#calloginput)
  - [NoteLogInput](#noteloginput)
- [Inventory Schemas](#inventory-schemas)
  - [OpportunityInventoryViewModel](#opportunityinventoryviewmodel)
  - [InventoryRoomViewModel](#inventoryroomviewmodel)
  - [InventoryItemViewModel](#inventoryitemviewmodel)
- [Payment Schemas](#payment-schemas)
  - [PaymentViewModel](#paymentviewmodel)
- [Job Sub-Schemas](#job-sub-schemas)
  - [JobStopViewModel](#jobstopviewmodel)
  - [JobChargeViewModel](#jobchargeviewmodel)
  - [JobMaterialViewModel](#jobmaterialviewmodel)
- [Reference Data Schemas](#reference-data-schemas)
  - [BranchViewModel](#branchviewmodel)
  - [MoveSizeViewModel](#movesizeviewmodel)
  - [ReferralSourceViewModel](#referralsourceviewmodel)
  - [ServiceTypeViewModel](#servicetypeviewmodel)
  - [TariffViewModel](#tariffviewmodel)
  - [UserViewModel](#userviewmodel)
  - [ArrivalWindowViewModel](#arrivalwindowviewmodel)
- [Request Body Schemas](#request-body-schemas)
  - [CreateCustomerRequest](#createcustomerrequest)
  - [UpdateCustomerRequest](#updatecustomerrequest)
  - [CreateLeadRequest](#createleadrequest)
  - [UpdateLeadRequest (PUT)](#updateleadrequest-put)
  - [PatchLeadRequest (PATCH)](#patchleadrequest-patch)
  - [ConvertLeadRequest](#convertleadrequest)
  - [CreateOpportunityRequest](#createopportunityrequest)
  - [PatchOpportunityRequest](#patchopportunityrequest)
  - [CreateJobRequest](#createjobrequest)
  - [UpdateJobNotesRequest](#updatejobnotesrequest)
  - [UpdateJobStopsRequest](#updatejobstopsrequest)
  - [AddMaterialsRequest](#addmaterialsrequest)
  - [CreateFollowUpRequest](#createfollowuprequest)
  - [UpdateFollowUpRequest](#updatefollowuprequest)
  - [AddInventoryItemsRequest](#addinventoryitemsrequest)
  - [UpdateInventoryItemRequest](#updateinventoryitemrequest)
  - [CreateRoomsRequest](#createroomsrequest)
  - [UploadAttachmentRequest](#uploadattachmentrequest)
- [Pagination Envelope](#pagination-envelope)
- [Supplemental Schemas](#supplemental-schemas)
  - [SecondaryPhoneNumber](#secondaryphonenumber)
  - [ContactViewModel](#contactviewmodel)
  - [EstimatedTotalViewModel](#estimatedtotalviewmodel)
  - [TripInfoViewModel](#tripinfoviewmodel)
  - [SurveyViewModel](#surveyviewmodel)
  - [TaskViewModel](#taskviewmodel)
  - [OpportunityFileViewModel](#opportunityfileviewmodel)
  - [OpportunityDocumentViewModel](#opportunitydocumentviewmodel)
  - [AuditActivityViewModel](#auditactivityviewmodel)
  - [StorageAccountViewModel](#storageaccountviewmodel)
  - [UtmInformation](#utminformation)
  - [DispatchLocation](#dispatchlocation)

---

## Overview

The SmartMoving API uses 138 schemas to represent data across its 55 endpoints. This document covers the most important schemas in detail. Schemas are organized by domain and usage pattern.

**Conventions:**
- All ID fields are UUIDs (string format: `"3fa85f64-5717-4562-b3fc-2c963f66afa6"`)
- Nullable fields may return `null` when no value is set
- Enum fields use integer values (see [Enumerations Reference](./ENUMS.md))
- Date fields use ISO 8601 unless otherwise noted (see [Date Formats](./README.md#date-formats))
- Properties marked as "read-only" are returned in responses but not accepted in requests

---

## Core Entities

### CustomerViewModel

Represents a customer in the SmartMoving system.

**Returned by:** `GET /api/customers/{customerId}`, `GET /api/customers` (in page results)

| Property              | Type                          | Nullable | Description                              |
|-----------------------|-------------------------------|----------|------------------------------------------|
| `id`                  | string (UUID)                 | No       | Unique customer identifier               |
| `name`                | string                        | No       | Full name of the customer                |
| `phoneNumber`         | string                        | Yes      | Primary phone number                     |
| `phoneType`           | integer (PhoneType enum)      | Yes      | Type of primary phone number             |
| `emailAddress`        | string                        | Yes      | Email address                            |
| `address`             | GeocodedAddress               | Yes      | Customer's address                       |
| `secondaryPhoneNumbers` | SecondaryPhoneNumber[]     | Yes      | Additional phone numbers                 |

**Example response:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Jane Smith",
  "phoneNumber": "555-123-4567",
  "phoneType": 0,
  "emailAddress": "jane.smith@example.com",
  "address": {
    "fullAddress": "123 Main St, Austin, TX 78701",
    "street": "123 Main St",
    "unit": null,
    "city": "Austin",
    "state": "TX",
    "zip": "78701",
    "lat": 30.2672,
    "lng": -97.7431,
    "country": "US"
  },
  "secondaryPhoneNumbers": [
    {
      "phoneNumber": "555-987-6543",
      "phoneType": 2,
      "label": "Work"
    }
  ]
}
```

---

### LeadViewModel

Represents a lead (prospective customer inquiry) in the system.

**Returned by:** `GET /api/leads/{leadId}`, `GET /api/leads` (in page results)

| Property              | Type                          | Nullable | Description                                  |
|-----------------------|-------------------------------|----------|----------------------------------------------|
| `id`                  | string (UUID)                 | No       | Unique lead identifier                       |
| `customerName`        | string                        | No       | Name of the prospective customer             |
| `emailAddress`        | string                        | Yes      | Email address                                |
| `referralSource`      | string                        | Yes      | Referral source identifier                   |
| `referralSourceName`  | string                        | Yes      | Display name of the referral source          |
| `affiliateName`       | string                        | Yes      | Affiliate name if applicable                 |
| `phoneNumber`         | string                        | Yes      | Phone number                                 |
| `phoneType`           | integer (PhoneType enum)      | Yes      | Type of phone number                         |
| `serviceDate`         | integer                       | Yes      | Desired service date (yyyyMMdd format)       |
| `salesPersonId`       | string (UUID)                 | Yes      | Assigned salesperson ID                      |
| `salesPerson`         | string                        | Yes      | Assigned salesperson name                    |
| `type`                | integer (OpportunityType enum)| Yes      | Move type (Local, Intrastate, Interstate)    |
| `branchId`            | string (UUID)                 | Yes      | Branch handling the lead                     |
| `branchName`          | string                        | Yes      | Branch display name                          |
| `originStreet`        | string                        | Yes      | Origin address street                        |
| `originCity`          | string                        | Yes      | Origin address city                          |
| `originState`         | string                        | Yes      | Origin address state                         |
| `originZip`           | string                        | Yes      | Origin address ZIP code                      |
| `destinationStreet`   | string                        | Yes      | Destination address street                   |
| `destinationCity`     | string                        | Yes      | Destination address city                     |
| `destinationState`    | string                        | Yes      | Destination address state                    |
| `destinationZip`      | string                        | Yes      | Destination address ZIP code                 |
| `moveSizeId`          | string (UUID)                 | Yes      | Selected move size ID                        |
| `moveSizeName`        | string                        | Yes      | Selected move size display name              |
| `createdAtUtc`        | string (ISO 8601)             | No       | Timestamp when the lead was created          |

**Example response:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customerName": "John Doe",
  "emailAddress": "john.doe@example.com",
  "referralSource": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "referralSourceName": "Google Ads",
  "affiliateName": null,
  "phoneNumber": "555-234-5678",
  "phoneType": 0,
  "serviceDate": 20241215,
  "salesPersonId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "salesPerson": "Sarah Johnson",
  "type": 0,
  "branchId": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "branchName": "Austin Main",
  "originStreet": "123 Main St",
  "originCity": "Austin",
  "originState": "TX",
  "originZip": "78701",
  "destinationStreet": "456 Oak Ave",
  "destinationCity": "Austin",
  "destinationState": "TX",
  "destinationZip": "78704",
  "moveSizeId": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "moveSizeName": "2 Bedroom",
  "createdAtUtc": "2024-08-15T10:30:00Z"
}
```

---

### OpportunityDetailsViewModel

The most comprehensive entity in the API. Represents a full opportunity with all related data depending on which `Include*` flags are set.

**Returned by:** `GET /api/opportunities/{opportunityId}`, `GET /api/opportunities/quote/{quoteNumber}`

| Property                    | Type                              | Nullable | Description                                          |
|-----------------------------|-----------------------------------|----------|------------------------------------------------------|
| `id`                        | string (UUID)                     | No       | Unique opportunity identifier                        |
| `quoteNumber`               | string                            | No       | Human-readable quote number                          |
| `customer`                  | CustomerViewModel                 | No       | Associated customer details                          |
| `branch`                    | object                            | Yes      | Branch handling the opportunity                      |
| `contacts`                  | ContactViewModel[]                | Yes      | Contact persons for the opportunity                  |
| `opportunityType`           | integer (OpportunityType enum)    | No       | Move type classification                             |
| `type`                      | string                            | Yes      | Service type name                                    |
| `serviceDate`               | integer                           | Yes      | Scheduled service date (yyyyMMdd)                    |
| `status`                    | integer (OpportunityStatus enum)  | No       | Current opportunity status                           |
| `leadStatus`                | integer (OpportunityStatus enum)  | Yes      | Status at the lead stage                             |
| `moveSize`                  | object                            | Yes      | Move size details (id, name, volume, weight)         |
| `volume`                    | number                            | Yes      | Estimated volume (cubic feet)                        |
| `weight`                    | number                            | Yes      | Estimated weight (pounds)                            |
| `volumeWeightCalculationMode` | integer (VolumeWeightCalculationMode) | No  | How volume/weight is determined                      |
| `estimatedTotal`            | EstimatedTotalViewModel           | Yes      | Cost estimate breakdown                              |
| `estimator`                 | object                            | Yes      | Assigned estimator (id, name)                        |
| `salesAssignee`             | object                            | Yes      | Assigned salesperson (id, name)                      |
| `hasTripInfo`               | boolean                           | No       | Whether trip info is available                       |
| `referralSource`            | object                            | Yes      | Referral source details                              |
| `allowInventoryUpdates`     | boolean                           | No       | Whether inventory can be modified                    |
| `customField01`             | string                            | Yes      | Custom field 1 (company-defined)                     |
| `customField02`             | string                            | Yes      | Custom field 2 (company-defined)                     |
| `customField03`             | string                            | Yes      | Custom field 3 (company-defined)                     |
| `tariff`                    | object                            | Yes      | Applied tariff/rate details                          |
| `jobs`                      | JobViewModel[]                    | Yes      | Jobs (included when `IncludeTripInfo=true`)          |
| `payments`                  | PaymentViewModel[]                | Yes      | Payments (included when `IncludePayments=true`)      |
| `tripInfo`                  | TripInfoViewModel                 | Yes      | Trip details (included when `IncludeTripInfo=true`)  |
| `opportunityFiles`          | OpportunityFileViewModel[]        | Yes      | Files (included when `IncludeFiles=true`)            |
| `photos`                    | object[]                          | Yes      | Photos (included when `IncludePhotos=true`)          |
| `opportunityDocuments`      | OpportunityDocumentViewModel[]    | Yes      | Documents (included when `IncludeDocuments=true`)    |
| `surveys`                   | SurveyViewModel[]                 | Yes      | Surveys (included when `IncludeSurveys=true`)        |
| `tasks`                     | TaskViewModel[]                   | Yes      | Tasks (included when `IncludeTasks=true`)            |

**Include parameters** (all boolean, default `false`):

| Parameter            | Includes                              |
|----------------------|---------------------------------------|
| `IncludeTripInfo`    | `tripInfo`, `jobs` with full details  |
| `IncludePayments`    | `payments` array                      |
| `IncludeSurveys`     | `surveys` array                       |
| `IncludeJobAddresses`| Job stop addresses                    |
| `IncludeTasks`       | `tasks` array                         |
| `IncludeFiles`       | `opportunityFiles` array              |
| `IncludePhotos`      | `photos` array                        |
| `IncludeDocuments`   | `opportunityDocuments` array          |
| `IncludeCharges`     | Charge details on jobs                |

---

### JobViewModel

Represents a job (a specific service instance) within an opportunity.

**Returned by:** `GET /api/opportunities/{opportunityId}/jobs`, `GET /api/premium/opportunities/{opportunityId}/jobs/{jobId}`

| Property              | Type                          | Nullable | Description                                      |
|-----------------------|-------------------------------|----------|--------------------------------------------------|
| `id`                  | string (UUID)                 | No       | Unique job identifier                            |
| `opportunityId`       | string (UUID)                 | No       | Parent opportunity ID                            |
| `type`                | integer (JobType enum)        | No       | Type of job/service                              |
| `jobNumber`           | string                        | No       | Human-readable job number                        |
| `jobDate`             | string (ISO 8601)             | Yes      | Scheduled job date                               |
| `startTimeUtc`        | string (ISO 8601)             | Yes      | Actual start time                                |
| `endTimeUtc`          | string (ISO 8601)             | Yes      | Actual end time                                  |
| `completedAtUtc`      | string (ISO 8601)             | Yes      | When the job was marked complete                 |
| `confirmedAtUtc`      | string (ISO 8601)             | Yes      | When the job was confirmed                       |
| `closedAtUtc`         | string (ISO 8601)             | Yes      | When the job was closed                          |
| `arrivalWindow`       | object                        | Yes      | Scheduled arrival window                         |
| `dropOffDate`         | string (ISO 8601)             | Yes      | Expected drop-off date                           |
| `stops`               | JobStopViewModel[]            | Yes      | Pickup and drop-off stops                        |
| `estimatedCharges`    | JobChargeViewModel[]          | Yes      | Estimated charges (when `IncludeEstimatedCharges=true`) |
| `actualCharges`       | JobChargeViewModel[]          | Yes      | Actual charges (when `IncludeActualCharges=true`)       |
| `estimatedMaterials`  | JobMaterialViewModel[]        | Yes      | Estimated materials (when `IncludeEstimatedMaterials=true`) |
| `actualMaterials`     | JobMaterialViewModel[]        | Yes      | Actual materials (when `IncludeActualMaterials=true`)       |

**Include parameters for `GET /api/premium/opportunities/{opportunityId}/jobs/{jobId}`:**

| Parameter                  | Includes                    |
|----------------------------|-----------------------------|
| `IncludeEstimatedCharges`  | `estimatedCharges` array    |
| `IncludeActualCharges`     | `actualCharges` array       |
| `IncludeEstimatedMaterials`| `estimatedMaterials` array  |
| `IncludeActualMaterials`   | `actualMaterials` array     |
| `IncludeStops`             | `stops` array               |

---

## Address Schemas

### GeocodedAddress

A fully geocoded address with latitude and longitude. Used in responses.

| Property      | Type    | Nullable | Description                          |
|---------------|---------|----------|--------------------------------------|
| `fullAddress` | string  | Yes      | Complete formatted address string    |
| `street`      | string  | Yes      | Street address (number and name)     |
| `unit`        | string  | Yes      | Unit, suite, or apartment number     |
| `city`        | string  | Yes      | City name                            |
| `state`       | string  | Yes      | State or province code               |
| `zip`         | string  | Yes      | ZIP or postal code                   |
| `lat`         | number  | Yes      | Latitude coordinate                  |
| `lng`         | number  | Yes      | Longitude coordinate                 |
| `country`     | string  | Yes      | Country code (e.g., "US")            |

**Example:**

```json
{
  "fullAddress": "123 Main St, Apt 4B, Austin, TX 78701",
  "street": "123 Main St",
  "unit": "Apt 4B",
  "city": "Austin",
  "state": "TX",
  "zip": "78701",
  "lat": 30.2672,
  "lng": -97.7431,
  "country": "US"
}
```

### AddressInput

Used in request bodies when providing address information.

| Property | Type   | Required | Description                      |
|----------|--------|----------|----------------------------------|
| `street` | string | No       | Street address                   |
| `unit`   | string | No       | Unit, suite, or apartment number |
| `city`   | string | No       | City name                        |
| `state`  | string | No       | State or province code           |
| `zip`    | string | No       | ZIP or postal code               |

---

## Communication Schemas

### FollowUpViewModel

Represents a scheduled follow-up action on an opportunity.

**Returned by:** `GET /api/premium/opportunities/{opportunityId}/followups`, `GET /api/premium/opportunities/{opportunityId}/followups/{followupId}`

| Property         | Type                        | Nullable | Description                              |
|------------------|-----------------------------|----------|------------------------------------------|
| `id`             | string (UUID)               | No       | Unique follow-up identifier              |
| `opportunityId`  | string (UUID)               | No       | Parent opportunity ID                    |
| `type`           | integer (FollowUpType enum) | No       | Type of follow-up                        |
| `title`          | string                      | No       | Follow-up title (max 100 characters)     |
| `assignedToId`   | string (UUID)               | No       | User assigned to the follow-up           |
| `dueDateTime`    | string (ISO 8601)           | No       | When the follow-up is due                |
| `completedAtUtc` | string (ISO 8601)           | Yes      | When the follow-up was completed         |
| `notes`          | string                      | Yes      | Additional notes                         |
| `completed`      | boolean                     | No       | Whether the follow-up is complete        |

### CallLogInput

Request body for logging a phone call on an opportunity.

| Property        | Type                         | Required | Description                              |
|-----------------|------------------------------|----------|------------------------------------------|
| `callType`      | integer (CallType enum)      | Yes      | 0=Outbound, 1=Inbound                   |
| `callDateTime`  | string (ISO 8601)            | Yes      | When the call occurred                   |
| `outcome`       | integer (CallOutcome enum)   | No       | Call outcome (0-6)                       |
| `description`   | string                       | No       | Call notes (max 1000 characters)         |
| `fromNumber`    | string                       | No       | Originating phone number                 |
| `toNumber`      | string                       | No       | Destination phone number                 |
| `createdBy`     | string (UUID)                | No       | User ID who logged the call              |

### NoteLogInput

Request body for logging a note on an opportunity.

| Property    | Type          | Required | Description                              |
|-------------|---------------|----------|------------------------------------------|
| `notes`     | string        | Yes      | Note content (max 4000 characters)       |
| `createdBy` | string (UUID) | No       | User ID who created the note             |

---

## Inventory Schemas

### OpportunityInventoryViewModel

The full inventory for an opportunity.

**Returned by:** `GET /api/premium/opportunities/{opportunityId}/inventory`

| Property                       | Type                              | Nullable | Description                                     |
|--------------------------------|-----------------------------------|----------|-------------------------------------------------|
| `id`                           | string (UUID)                     | No       | Inventory identifier                            |
| `createdAtUtc`                 | string (ISO 8601)                 | No       | When the inventory was created                  |
| `lastModifiedById`             | string (UUID)                     | Yes      | User who last modified the inventory            |
| `lastModifiedFromApplication`  | integer (SmApplications enum)     | Yes      | Application used for last modification          |
| `densityFactor`                | number                            | Yes      | Density factor used for weight calculations     |
| `boxes`                        | object[]                          | Yes      | List of box items                               |
| `rooms`                        | InventoryRoomViewModel[]          | Yes      | List of rooms with their inventory items        |
| `lockStatus`                   | object                            | Yes      | Whether the inventory is locked for editing     |

### InventoryRoomViewModel

Represents a room within an opportunity's inventory.

| Property   | Type                       | Nullable | Description                          |
|------------|----------------------------|----------|--------------------------------------|
| `id`       | string (UUID)              | No       | Unique room identifier               |
| `name`     | string                     | No       | Room name (e.g., "Master Bedroom")   |
| `roomTypeId` | string (UUID)            | Yes      | Room type reference ID               |
| `items`    | InventoryItemViewModel[]   | Yes      | Items in this room                   |

### InventoryItemViewModel

Represents an individual inventory item within a room.

| Property          | Type                              | Nullable | Description                                |
|-------------------|-----------------------------------|----------|--------------------------------------------|
| `id`              | string (UUID)                     | No       | Unique item identifier                     |
| `name`            | string                            | No       | Item name                                  |
| `quantity`        | integer                           | No       | Number of this item                        |
| `volume`          | number                            | Yes      | Volume per item (cubic feet)               |
| `weight`          | number                            | Yes      | Weight per item (pounds)                   |
| `itemType`        | integer (InventoryItemType enum)  | No       | Item classification                        |
| `masterItemId`    | string (UUID)                     | Yes      | Reference to master inventory item         |

---

## Payment Schemas

### PaymentViewModel

Represents a payment recorded against an opportunity.

**Returned by:** `GET /api/payments/opportunities/{opportunityId}`, included with `IncludePayments=true`

| Property          | Type                            | Nullable | Description                                    |
|-------------------|---------------------------------|----------|------------------------------------------------|
| `id`              | string (UUID)                   | No       | Unique payment identifier                      |
| `amount`          | number                          | No       | Payment amount                                 |
| `paymentType`     | integer (PaymentType enum)      | No       | Method of payment                              |
| `paymentSource`   | integer (PaymentSource enum)    | No       | Where the payment was recorded                 |
| `paymentCategory` | integer (PaymentCategory enum)  | No       | Purpose of the payment                         |
| `paymentDate`     | string (ISO 8601)               | No       | Date the payment was made                      |
| `notes`           | string                          | Yes      | Payment notes                                  |
| `opportunityId`   | string (UUID)                   | No       | Associated opportunity ID                      |
| `jobId`           | string (UUID)                   | Yes      | Associated job ID (if applicable)              |

---

## Job Sub-Schemas

### JobStopViewModel

Represents a pickup or drop-off stop within a job.

| Property       | Type                          | Nullable | Description                              |
|----------------|-------------------------------|----------|------------------------------------------|
| `id`           | string (UUID)                 | No       | Unique stop identifier                   |
| `address`      | GeocodedAddress               | Yes      | Stop address                             |
| `propertyType` | integer (PropertyType enum)   | Yes      | Type of property                         |
| `stopType`     | integer (StopType enum)       | No       | Pickup (0) or DropOff (1)               |
| `order`        | integer                       | No       | Order of the stop in sequence            |
| `stairs`       | integer                       | Yes      | Number of flights of stairs              |
| `elevator`     | boolean                       | Yes      | Whether an elevator is available         |

### JobChargeViewModel

Represents a charge line item on a job.

| Property       | Type                              | Nullable | Description                              |
|----------------|-----------------------------------|----------|------------------------------------------|
| `id`           | string (UUID)                     | No       | Unique charge identifier                 |
| `name`         | string                            | No       | Charge name/description                  |
| `chargeType`   | integer (ChargeType enum)         | No       | How the charge is calculated             |
| `category`     | integer (JobChargeCategory enum)  | No       | Charge category                          |
| `amount`       | number                            | No       | Charge amount                            |
| `quantity`     | number                            | Yes      | Quantity (for per-unit charges)          |
| `rate`         | number                            | Yes      | Rate (for hourly/per-mile charges)       |

### JobMaterialViewModel

Represents a material/supply used on a job.

| Property       | Type          | Nullable | Description                              |
|----------------|---------------|----------|------------------------------------------|
| `id`           | string (UUID) | No       | Unique material identifier               |
| `materialId`   | string (UUID) | No       | Reference to the material definition     |
| `name`         | string        | No       | Material name                            |
| `quantity`     | number        | No       | Quantity used                            |
| `rate`         | number        | Yes      | Rate per unit                            |
| `cost`         | number        | Yes      | Total cost                               |

---

## Reference Data Schemas

### BranchViewModel

Represents a company branch location.

**Returned by:** `GET /api/branches`

| Property           | Type              | Nullable | Description                          |
|--------------------|-------------------|----------|--------------------------------------|
| `id`               | string (UUID)     | No       | Unique branch identifier             |
| `name`             | string            | No       | Branch name                          |
| `dispatchLocation` | DispatchLocation  | Yes      | Dispatch location with coordinates   |

### MoveSizeViewModel

Represents a move size classification.

**Returned by:** `GET /api/move-sizes`

| Property      | Type          | Nullable | Description                                |
|---------------|---------------|----------|--------------------------------------------|
| `id`          | string (UUID) | No       | Unique move size identifier                |
| `name`        | string        | No       | Move size name (e.g., "2 Bedroom")         |
| `description` | string        | Yes      | Additional description                     |
| `volume`      | number        | Yes      | Default volume in cubic feet               |
| `weight`      | number        | Yes      | Default weight in pounds                   |

### ReferralSourceViewModel

Represents a referral or lead source.

**Returned by:** `GET /api/referral-sources`

| Property  | Type          | Nullable | Description                          |
|-----------|---------------|----------|--------------------------------------|
| `id`      | string (UUID) | No       | Unique referral source identifier    |
| `name`    | string        | No       | Referral source name                 |

**Query parameters:**

| Parameter             | Type    | Description                                |
|-----------------------|---------|--------------------------------------------|
| `includePrivate`      | boolean | Include private/internal referral sources   |
| `includeLeadProviders`| boolean | Include lead provider referral sources      |

### ServiceTypeViewModel

Represents a type of service offered.

**Returned by:** `GET /api/service-types`

| Property        | Type          | Nullable | Description                          |
|-----------------|---------------|----------|--------------------------------------|
| `id`            | string (UUID) | No       | Unique service type identifier       |
| `name`          | string        | No       | Service type name                    |
| `scalingFactor` | number        | Yes      | Scaling factor for pricing           |
| `activities`    | object[]      | Yes      | Activities within this service type  |

### TariffViewModel

Represents a pricing tariff/rate table.

**Returned by:** `GET /api/tariffs`

| Property                    | Type          | Nullable | Description                              |
|-----------------------------|---------------|----------|------------------------------------------|
| `id`                        | string (UUID) | No       | Unique tariff identifier                 |
| `name`                      | string        | No       | Tariff name                              |
| `appliesToOpportunityTypes` | integer[]     | Yes      | Which opportunity types use this tariff  |
| `appliesToBranches`         | object[]      | Yes      | Which branches use this tariff           |

**Query parameters:**

| Parameter          | Type    | Description                          |
|--------------------|---------|--------------------------------------|
| `IncludeDisabled`  | boolean | Include disabled tariffs             |
| `IncludeTechMate`  | boolean | Include TechMate tariffs             |

### UserViewModel

Represents an office user (salesperson, estimator, etc.).

**Returned by:** `GET /api/users`

| Property        | Type          | Nullable | Description                          |
|-----------------|---------------|----------|--------------------------------------|
| `id`            | string (UUID) | No       | Unique user identifier               |
| `name`          | string        | No       | Full name                            |
| `title`         | string        | Yes      | Job title                            |
| `email`         | string        | Yes      | Email address                        |
| `primaryBranch` | object        | Yes      | Primary branch assignment            |
| `role`          | string        | Yes      | Role within the system               |

### ArrivalWindowViewModel

Represents a schedulable arrival time window.

**Returned by:** `GET /api/arrival-windows`

| Property      | Type    | Nullable | Description                              |
|---------------|---------|----------|------------------------------------------|
| `id`          | string (UUID) | No | Unique arrival window identifier         |
| `description` | string  | No       | Display description (e.g., "8AM - 10AM") |
| `startTime`   | string  | No       | Window start time                        |
| `endTime`     | string  | No       | Window end time                          |
| `isDefault`   | boolean | No       | Whether this is the default window       |

---

## Request Body Schemas

### CreateCustomerRequest

**Used by:** `POST /api/premium/customers`

| Property              | Type                      | Required | Description                              |
|-----------------------|---------------------------|----------|------------------------------------------|
| `name`                | string                    | Yes      | Customer full name                       |
| `phoneNumber`         | string                    | No       | Primary phone number                     |
| `phoneType`           | integer (PhoneType enum)  | No       | Type of primary phone                    |
| `emailAddress`        | string                    | No       | Email address                            |
| `address`             | AddressInput              | No       | Customer address                         |
| `secondaryPhoneNumbers` | SecondaryPhoneNumber[] | No       | Additional phone numbers                 |

**Example:**

```json
{
  "name": "Jane Smith",
  "phoneNumber": "555-123-4567",
  "phoneType": 0,
  "emailAddress": "jane.smith@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701"
  },
  "secondaryPhoneNumbers": [
    {
      "phoneNumber": "555-987-6543",
      "phoneType": 2,
      "label": "Work"
    }
  ]
}
```

### UpdateCustomerRequest

**Used by:** `PUT /api/premium/customers/{customerId}`

Same fields as CreateCustomerRequest. All fields are optional for updates; only include fields you want to change.

### CreateLeadRequest

**Used by:** `POST /api/premium/leads`

This endpoint offers flexible name handling -- provide `firstName`/`lastName` individually or `fullName` as a single string.

| Property            | Type                          | Required | Description                                      |
|---------------------|-------------------------------|----------|--------------------------------------------------|
| `firstName`         | string                        | No*      | Customer first name                              |
| `lastName`          | string                        | No*      | Customer last name                               |
| `fullName`          | string                        | No*      | Full name (alternative to firstName/lastName)    |
| `phoneNumber`       | string                        | No       | Phone number                                     |
| `emailAddress`      | string                        | No       | Email address                                    |
| `moveDate`          | string (yyyy-MM-dd)           | No       | Desired move date                                |
| `originAddress`     | AddressInput                  | No       | Origin/pickup address                            |
| `destinationAddress`| AddressInput                  | No       | Destination/drop-off address                     |
| `referralSource`    | string                        | No**     | Referral source name (resolved by system)        |
| `referralSourceId`  | string (UUID)                 | No**     | Referral source ID                               |
| `utmSource`         | string                        | No       | UTM source parameter                             |
| `utmMedium`         | string                        | No       | UTM medium parameter                             |
| `utmCampaign`       | string                        | No       | UTM campaign parameter                           |
| `utmTerm`           | string                        | No       | UTM term parameter                               |
| `utmContent`        | string                        | No       | UTM content parameter                            |
| `bedrooms`          | integer                       | No       | Number of bedrooms (for auto-sizing)             |
| `notes`             | string                        | No       | Initial lead notes                               |
| `serviceType`       | integer (JobType enum)        | No       | Desired service type                             |
| `branchId`          | string (UUID)                 | No       | Assigned branch                                  |
| `opportunityType`   | integer (OpportunityType enum)| No       | Move type                                        |

\* At least one name field is recommended. Use `firstName`/`lastName` or `fullName`.
\** Either `referralSource` (name) or `referralSourceId` (UUID) is required.

**Example:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "555-234-5678",
  "emailAddress": "john.doe@example.com",
  "moveDate": "2024-12-15",
  "referralSourceId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "serviceType": 1,
  "branchId": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "originAddress": {
    "street": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701"
  },
  "destinationAddress": {
    "street": "456 Oak Ave",
    "city": "Austin",
    "state": "TX",
    "zip": "78704"
  },
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "moving-austin"
}
```

### UpdateLeadRequest (PUT)

**Used by:** `PUT /api/premium/leads/{leadId}`

Full replacement update. Required fields must always be provided.

| Property            | Type          | Required | Description                          |
|---------------------|---------------|----------|--------------------------------------|
| `customerName`      | string        | Yes      | Full customer name                   |
| `branchId`          | string (UUID) | Yes      | Branch ID                            |
| `referralSourceId`  | string (UUID) | Yes      | Referral source ID                   |
| All other LeadViewModel fields | varies | No  | Other lead properties to update      |

### PatchLeadRequest (PATCH)

**Used by:** `PATCH /api/premium/leads/{leadId}`

Partial update -- only send the fields you want to change.

| Property            | Type          | Required | Description                              |
|---------------------|---------------|----------|------------------------------------------|
| Any lead property   | varies        | No       | Only include fields to update            |
| `fromExternalApi`   | boolean       | No       | Flag indicating update is from external API |

### ConvertLeadRequest

**Used by:** `PUT /api/premium/lead/{id}/convert`

Converts a lead into an opportunity.

| Property            | Type                        | Required | Description                              |
|---------------------|-----------------------------|----------|------------------------------------------|
| `customerId`        | string (UUID)               | Yes      | Customer to associate with               |
| `referralSourceId`  | string (UUID)               | Yes      | Referral source ID                       |
| `tariffId`          | string (UUID)               | Yes      | Tariff/rate table to apply               |
| `moveDate`          | string (yyyy-MM-dd)         | Yes      | Scheduled move date                      |
| `moveSizeId`        | string (UUID)               | Yes      | Move size classification                 |
| `salesPersonId`     | string (UUID)               | Yes      | Assigned salesperson                     |
| `serviceTypeId`     | string (UUID)               | Yes      | Service type                             |
| `branchId`          | string (UUID)               | No       | Branch assignment                        |
| `originAddress`     | AddressInput                | No       | Origin address                           |
| `destinationAddress`| AddressInput                | No       | Destination address                      |

### CreateOpportunityRequest

**Used by:** `POST /api/premium/opportunity`

| Property            | Type                          | Required | Description                              |
|---------------------|-------------------------------|----------|------------------------------------------|
| `tariffId`          | string (UUID)                 | Yes      | Tariff/rate table                        |
| `salesPersonId`     | string (UUID)                 | Yes      | Assigned salesperson                     |
| `customerId`        | string (UUID)                 | Yes      | Associated customer                      |
| `referralSourceId`  | string (UUID)                 | Yes      | Referral source                          |
| `moveDate`          | string (yyyy-MM-dd)          | Yes      | Scheduled move date                      |
| `moveSizeId`        | string (UUID)                 | Yes      | Move size classification                 |
| `serviceTypeId`     | string (UUID)                 | Yes      | Service type                             |
| `branchId`          | string (UUID)                 | No       | Branch assignment                        |
| `utmInformation`    | UtmInformation                | No       | UTM tracking data                        |
| `originAddress`     | AddressInput                  | No       | Origin address                           |
| `destinationAddress`| AddressInput                  | No       | Destination address                      |
| `customField01`     | string                        | No       | Custom field 1                           |
| `customField02`     | string                        | No       | Custom field 2                           |
| `customField03`     | string                        | No       | Custom field 3                           |

### PatchOpportunityRequest

**Used by:** `PATCH /api/premium/opportunities/{opportunityId}`

Partial update for opportunity properties.

| Property            | Type                          | Required | Description                              |
|---------------------|-------------------------------|----------|------------------------------------------|
| `moveSizeId`        | string (UUID)                 | No       | Move size classification                 |
| `salesPersonId`     | string (UUID)                 | No       | Assigned salesperson                     |
| `branchId`          | string (UUID)                 | No       | Branch assignment                        |
| `opportunityType`   | integer (OpportunityType enum)| No       | Move type                                |
| `volume`            | number                        | No       | Estimated volume                         |
| `weight`            | number                        | No       | Estimated weight                         |
| `isBinding`         | boolean                       | No       | Whether the estimate is binding          |
| `depositAmount`     | number                        | No       | Required deposit amount                  |
| `referralSourceId`  | string (UUID)                 | No       | Referral source                          |
| `customField01`     | string                        | No       | Custom field 1                           |
| `customField02`     | string                        | No       | Custom field 2                           |
| `customField03`     | string                        | No       | Custom field 3                           |

### CreateJobRequest

**Used by:** `POST /api/premium/opportunities/{opportunityId}/jobs`

| Property      | Type                   | Required | Description                    |
|---------------|------------------------|----------|--------------------------------|
| `serviceType` | integer (JobType enum) | Yes      | Type of job to create          |

**Example:**

```json
{
  "serviceType": 1
}
```

### UpdateJobNotesRequest

**Used by:** `PATCH /api/premium/opportunities/{opportunityId}/jobs/{jobId}/notes`

| Property          | Type   | Required | Description                          |
|-------------------|--------|----------|--------------------------------------|
| `crewNotes`       | string | No       | Notes visible to the crew            |
| `customerNotes`   | string | No       | Notes visible to the customer        |
| `internalNotes`   | string | No       | Internal-only notes                  |
| `accountingNotes` | string | No       | Notes for the accounting team        |
| `dispatcherNotes` | string | No       | Notes for the dispatcher             |

### UpdateJobStopsRequest

**Used by:** `PUT /api/premium/opportunities/{opportunityId}/jobs/{jobId}/stops`

The request body is an array of stop objects. This **replaces all existing stops** for the job.

| Property       | Type                        | Required | Description                        |
|----------------|-----------------------------|----------|------------------------------------|
| `address`      | AddressInput                | No       | Stop address                       |
| `propertyType` | integer (PropertyType enum) | No       | Property type at the stop          |
| `stopType`     | integer (StopType enum)     | Yes      | PickUp (0) or DropOff (1)        |
| `order`        | integer                     | Yes      | Sequence order (0-based)           |
| `stairs`       | integer                     | No       | Number of flights of stairs        |
| `elevator`     | boolean                     | No       | Whether an elevator is available   |

**Example:**

```json
[
  {
    "address": {
      "street": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zip": "78701"
    },
    "propertyType": 1,
    "stopType": 0,
    "order": 0,
    "stairs": 2,
    "elevator": false
  },
  {
    "address": {
      "street": "456 Oak Ave",
      "city": "Austin",
      "state": "TX",
      "zip": "78704"
    },
    "propertyType": 2,
    "stopType": 1,
    "order": 1,
    "stairs": 0,
    "elevator": false
  }
]
```

### AddMaterialsRequest

**Used by:** `POST /api/premium/opportunities/{opportunityId}/Estimated/jobs/{jobId}/materials`

The request body is an array of material entries. This **overwrites all existing estimated materials** for the job.

| Property     | Type          | Required | Description                          |
|--------------|---------------|----------|--------------------------------------|
| `materialId` | string (UUID) | Yes      | Material ID from tariff materials    |
| `quantity`   | number        | Yes      | Quantity of material                 |

**Example:**

```json
[
  {
    "materialId": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "quantity": 10
  },
  {
    "materialId": "a2b3c4d5-e6f7-8901-bcde-f12345678901",
    "quantity": 5
  }
]
```

### CreateFollowUpRequest

**Used by:** `POST /api/premium/opportunities/{opportunityId}/followups`

| Property       | Type                          | Required | Description                              |
|----------------|-------------------------------|----------|------------------------------------------|
| `type`         | integer (FollowUpType enum)   | Yes      | Type of follow-up (0=Email, 1=Call, etc.)|
| `title`        | string                        | Yes      | Follow-up title (max 100 characters)     |
| `assignedToId` | string (UUID)                 | Yes      | User to assign the follow-up to          |
| `dueDateTime`  | string (ISO 8601)             | Yes      | When the follow-up is due                |
| `notes`        | string                        | No       | Additional notes                         |

### UpdateFollowUpRequest

**Used by:** `PUT /api/premium/opportunities/{opportunityId}/followups/{followupId}`

Same fields as CreateFollowUpRequest.

### AddInventoryItemsRequest

**Used by:** `POST /api/premium/opportunities/{opportunityId}/inventory/rooms/{roomId}`

| Property                           | Type          | Required | Description                                              |
|------------------------------------|---------------|----------|----------------------------------------------------------|
| `masterItemId`                     | string (UUID) | No*      | ID from master inventory list                            |
| `name`                             | string        | No*      | Custom item name (if not using master item)              |
| `quantity`                         | integer       | No       | Number of items (default 1)                              |
| `saveToMaster`                     | boolean       | No       | Save custom item to master inventory list                |
| `changeVolumeWeightCalculationMode`| boolean       | No       | Switch calculation mode to Inventory                     |
| `markAsNeedsReview`                | boolean       | No       | Flag the inventory as needing review                     |

\* Provide either `masterItemId` (to add a known item) or `name` (to add a custom item).

### UpdateInventoryItemRequest

**Used by:** `PUT /api/premium/opportunities/{opportunityId}/inventory/rooms/{roomId}/items/{inventoryItemId}`

| Property   | Type    | Required | Description                    |
|------------|---------|----------|--------------------------------|
| `quantity` | integer | No       | Updated quantity               |
| `name`     | string  | No       | Updated item name              |
| `volume`   | number  | No       | Updated volume per item        |
| `weight`   | number  | No       | Updated weight per item        |

### CreateRoomsRequest

**Used by:** `POST /api/premium/opportunities/{opportunityId}/rooms`

The request body is an array of room definitions.

| Property     | Type          | Required | Description                          |
|--------------|---------------|----------|--------------------------------------|
| `name`       | string        | Yes      | Room name                            |
| `roomTypeId` | string (UUID) | Yes      | Room type ID from room types list    |

**Example:**

```json
[
  {
    "name": "Master Bedroom",
    "roomTypeId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  {
    "name": "Kitchen",
    "roomTypeId": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  }
]
```

### UploadAttachmentRequest

**Used by:** `POST /api/premium/opportunities/{opportunityId}/attachments`

| Property   | Type                        | Required | Description                                                    |
|------------|-----------------------------|----------|----------------------------------------------------------------|
| `fileName` | string                      | Yes      | File name with extension                                       |
| `fileData` | string (base64)             | Yes      | Base64-encoded file content                                    |
| `category` | integer (FileCategory enum) | Yes      | File category (0-6)                                            |

**Allowed file types:** `.doc`, `.docx`, `.xls`, `.xlsx`, `.pdf`, `.txt`, `.csv`, `.png`, `.jpeg`, `.jpg`

**Example:**

```json
{
  "fileName": "contract.pdf",
  "fileData": "JVBERi0xLjQKJcOkw7zDtsO...",
  "category": 0
}
```

---

## Pagination Envelope

All paginated endpoints return responses in this standard envelope.

```json
{
  "pageNumber": 1,
  "pageSize": 25,
  "lastPage": false,
  "totalPages": 4,
  "totalResults": 87,
  "totalThisPage": 25,
  "pageResults": []
}
```

| Property        | Type    | Description                                    |
|-----------------|---------|------------------------------------------------|
| `pageNumber`    | integer | Current page number (1-based)                  |
| `pageSize`      | integer | Maximum results per page                       |
| `lastPage`      | boolean | Whether this is the last page                  |
| `totalPages`    | integer | Total number of pages                          |
| `totalResults`  | integer | Total number of results across all pages       |
| `totalThisPage` | integer | Number of results on the current page          |
| `pageResults`   | array   | Array of result objects                        |

---

## Supplemental Schemas

### SecondaryPhoneNumber

Additional phone numbers associated with a customer.

| Property    | Type                     | Nullable | Description          |
|-------------|--------------------------|----------|----------------------|
| `phoneNumber` | string                | No       | Phone number         |
| `phoneType` | integer (PhoneType enum) | No       | Type of phone number |
| `label`     | string                   | Yes      | Display label        |

### ContactViewModel

A contact person associated with an opportunity.

| Property      | Type          | Nullable | Description          |
|---------------|---------------|----------|----------------------|
| `id`          | string (UUID) | No       | Contact identifier   |
| `name`        | string        | No       | Contact name         |
| `phoneNumber` | string        | Yes      | Phone number         |
| `emailAddress`| string        | Yes      | Email address        |

### EstimatedTotalViewModel

Cost estimate breakdown for an opportunity.

| Property        | Type   | Nullable | Description                          |
|-----------------|--------|----------|--------------------------------------|
| `subtotal`      | number | No       | Subtotal before tax                  |
| `taxableAmount` | number | No       | Amount subject to tax                |
| `tax`           | number | No       | Tax amount                           |
| `finalTotal`    | number | No       | Final total including tax            |

### TripInfoViewModel

Trip-level details for an opportunity (distances, times).

| Property          | Type    | Nullable | Description                          |
|-------------------|---------|----------|--------------------------------------|
| `totalMiles`      | number  | Yes      | Total trip distance in miles         |
| `totalDriveTime`  | number  | Yes      | Total drive time                     |

### SurveyViewModel

Survey/estimate appointment details.

| Property      | Type                            | Nullable | Description                      |
|---------------|---------------------------------|----------|----------------------------------|
| `id`          | string (UUID)                   | No       | Survey identifier                |
| `type`        | integer (CalendarEntryType enum)| No       | Type of survey                   |
| `scheduledAt` | string (ISO 8601)               | Yes      | Scheduled date/time              |
| `completedAt` | string (ISO 8601)               | Yes      | Completion date/time             |

### TaskViewModel

A task or to-do item on an opportunity.

| Property    | Type                           | Nullable | Description                    |
|-------------|--------------------------------|----------|--------------------------------|
| `id`        | string (UUID)                  | No       | Task identifier                |
| `type`      | integer (TaskItemType enum)    | No       | Task type                      |
| `status`    | integer (TaskItemStatus enum)  | No       | Task status                    |
| `title`     | string                         | No       | Task title                     |
| `dueDate`   | string (ISO 8601)              | Yes      | Due date                       |
| `assignedTo`| string (UUID)                  | Yes      | Assigned user                  |

### OpportunityFileViewModel

A file attached to an opportunity.

| Property    | Type                          | Nullable | Description                    |
|-------------|-------------------------------|----------|--------------------------------|
| `id`        | string (UUID)                 | No       | File identifier                |
| `fileName`  | string                        | No       | File name                      |
| `category`  | integer (FileCategory enum)   | No       | File category                  |
| `url`       | string                        | Yes      | Download URL                   |
| `uploadedAt`| string (ISO 8601)             | No       | Upload timestamp               |

### OpportunityDocumentViewModel

A system-generated document for an opportunity.

| Property       | Type                          | Nullable | Description                    |
|----------------|-------------------------------|----------|--------------------------------|
| `id`           | string (UUID)                 | No       | Document identifier            |
| `documentType` | integer (DocumentType enum)   | No       | Type of document               |
| `name`         | string                        | No       | Document name                  |
| `url`          | string                        | Yes      | Download URL                   |
| `createdAt`    | string (ISO 8601)             | No       | Creation timestamp             |

### AuditActivityViewModel

An audit trail entry recording a change to an opportunity.

**Returned by:** `GET /api/opportunities/{opportunityId}/audit-activity`

| Property       | Type                              | Nullable | Description                          |
|----------------|-----------------------------------|----------|--------------------------------------|
| `id`           | string (UUID)                     | No       | Audit entry identifier               |
| `activityType` | integer (AuditActivityType enum)  | No       | Type of change (Created/Edited/Deleted) |
| `description`  | string                            | No       | Human-readable change description    |
| `performedBy`  | string                            | Yes      | User who made the change             |
| `performedAt`  | string (ISO 8601)                 | No       | When the change occurred             |

### StorageAccountViewModel

A customer's storage account.

**Returned by:** `GET /api/customers/{customerId}/storage-accounts`

| Property         | Type                                      | Nullable | Description                          |
|------------------|-------------------------------------------|----------|--------------------------------------|
| `id`             | string (UUID)                             | No       | Storage account identifier           |
| `status`         | integer (StorageAccountStatus enum)       | No       | Account status                       |
| `storageType`    | integer (StorageType enum)                | No       | SIT or Permanent                     |
| `billingType`    | integer (StorageBillingPreOrPostPay enum) | No       | Pre-pay or post-pay                  |
| `valuationMethod`| integer (StorageValuationMethod enum)     | Yes      | How valuation is calculated          |
| `customerId`     | string (UUID)                             | No       | Associated customer ID               |
| `opportunityId`  | string (UUID)                             | Yes      | Associated opportunity ID            |

### UtmInformation

UTM tracking parameters for marketing attribution.

| Property     | Type   | Nullable | Description              |
|--------------|--------|----------|--------------------------|
| `utmSource`  | string | Yes      | Traffic source           |
| `utmMedium`  | string | Yes      | Marketing medium         |
| `utmCampaign`| string | Yes      | Campaign name            |
| `utmTerm`    | string | Yes      | Search term              |
| `utmContent` | string | Yes      | Ad content variation     |

### DispatchLocation

Geographic coordinates for a branch's dispatch location.

| Property | Type   | Nullable | Description          |
|----------|--------|----------|----------------------|
| `lat`    | number | Yes      | Latitude coordinate  |
| `lng`    | number | Yes      | Longitude coordinate |
