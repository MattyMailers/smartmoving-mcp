# SmartMoving API Enumerations Reference

[Back to Overview](./README.md)

---

## Table of Contents

- [Overview](#overview)
- [Opportunity & Lead Enums](#opportunity--lead-enums)
  - [OpportunityStatus](#opportunitystatus)
  - [OpportunityType](#opportunitytype)
- [Job Enums](#job-enums)
  - [JobType](#jobtype)
  - [JobChargeCategory](#jobchargecategory)
  - [ChargeType](#chargetype)
  - [StopType](#stoptype)
  - [PropertyType](#propertytype)
- [Contact Enums](#contact-enums)
  - [PhoneType](#phonetype)
- [Communication Enums](#communication-enums)
  - [CallType](#calltype)
  - [CallOutcome](#calloutcome)
  - [FollowUpType](#followuptype)
- [Payment Enums](#payment-enums)
  - [PaymentType](#paymenttype)
  - [PaymentSource](#paymentsource)
  - [PaymentCategory](#paymentcategory)
- [File & Document Enums](#file--document-enums)
  - [FileCategory](#filecategory)
  - [DocumentType](#documenttype)
- [Storage Enums](#storage-enums)
  - [StorageAccountStatus](#storageaccountstatus)
  - [StorageType](#storagetype)
  - [StorageBillingPreOrPostPay](#storagebillingpreorpostpay)
  - [StorageValuationMethod](#storagevaluationmethod)
  - [StorageDiscountType](#storagediscounttype)
- [Inventory Enums](#inventory-enums)
  - [VolumeWeightCalculationMode](#volumeweightcalculationmode)
  - [InventoryItemType](#inventoryitemtype)
- [Task Enums](#task-enums)
  - [TaskItemType](#taskitemtype)
  - [TaskItemStatus](#taskitemstatus)
- [Calendar & Survey Enums](#calendar--survey-enums)
  - [CalendarEntryType](#calendarentrytype)
- [Audit Enums](#audit-enums)
  - [AuditActivityType](#auditactivitytype)
- [Miscellaneous Enums](#miscellaneous-enums)
  - [DiscountType](#discounttype)
  - [SmApplications](#smapplications)

---

## Overview

The SmartMoving API uses integer-based enumerations for categorization fields. When sending data to the API, provide the integer value. When reading data from the API, the integer value is returned and should be mapped using the tables below.

Enum values are **case-insensitive** when expressed as strings in documentation, but the API always accepts and returns the **integer** representation.

---

## Opportunity & Lead Enums

### OpportunityStatus

Represents the lifecycle status of a lead or opportunity.

| Value | Name             | Description                                                  |
|-------|------------------|--------------------------------------------------------------|
| 0     | NewLead          | A newly created lead that has not been contacted              |
| 1     | LeadInProgress   | A lead that is being actively worked by a salesperson         |
| 3     | Opportunity      | A qualified lead that has been converted to an opportunity    |
| 4     | Booked           | An opportunity that has been confirmed/booked by the customer |
| 10    | Completed        | The job(s) associated with the opportunity have been completed|
| 11    | Closed           | The opportunity has been closed (finalized after completion)  |
| 20    | Cancelled        | The opportunity was cancelled by the customer or company      |
| 30    | Lost             | The opportunity was lost to a competitor or other reason      |
| 50    | BadLead          | The lead was determined to be invalid or unqualified          |

**Note:** There is no value `2` -- the sequence skips from `1` to `3`.

**Typical lifecycle flow:** `NewLead (0)` -> `LeadInProgress (1)` -> `Opportunity (3)` -> `Booked (4)` -> `Completed (10)` -> `Closed (11)`

### OpportunityType

Classifies the type of move based on geographic scope.

| Value | Name       | Description                                                    |
|-------|------------|----------------------------------------------------------------|
| 0     | Local      | Move within the same metropolitan area or short distance       |
| 1     | Intrastate | Move within the same state but across a longer distance        |
| 2     | Interstate | Move crossing state lines                                      |

---

## Job Enums

### JobType

Defines the type of service being performed in a job.

| Value | Name             | Description                                            |
|-------|------------------|--------------------------------------------------------|
| 1     | Moving           | Standard moving service                                |
| 3     | Packing          | Packing-only service                                   |
| 4     | MovingAndPacking | Combined moving and packing service                    |
| 5     | LoadOnly         | Loading items onto a truck (no transport)              |
| 6     | UnloadOnly       | Unloading items from a truck (no transport)            |
| 7     | Commercial       | Commercial/office moving service                       |
| 8     | StorageInBound   | Moving items into storage                              |
| 9     | StorageOutBound  | Moving items out of storage                            |
| 10    | InnerHouse       | Moving items within the same property                  |
| 11    | JunkRemoval      | Junk removal and disposal service                      |
| 12    | LaborOnly        | Labor-only service (no truck or transport)             |
| 101   | Custom01         | Custom service type 1 (company-defined)                |
| 102   | Custom02         | Custom service type 2 (company-defined)                |
| ...   | ...              | ...                                                    |
| 150   | Custom50         | Custom service type 50 (company-defined)               |

**Note:** Values 101-150 are user-defined custom job types configured within the SmartMoving platform.

### JobChargeCategory

Categories for organizing charges on a job.

| Value | Name              | Description                                          |
|-------|-------------------|------------------------------------------------------|
| 1     | MovingLabor       | Charges for moving labor hours                       |
| 2     | Transportation    | Charges for vehicle transportation and mileage       |
| 3     | Packing           | Charges for packing labor and services               |
| 4     | AdditionalServices| Miscellaneous additional service charges             |
| 5     | TripAndTravel     | Trip fees and travel time charges                    |
| 6     | FuelSurcharge     | Fuel surcharge fees                                  |
| 7     | Valuation         | Valuation (insurance/liability) coverage charges     |
| 8     | BulkyItem         | Surcharges for oversized or heavy items              |
| 9     | Storage           | Storage-related charges                              |
| 10    | ShuttleFees       | Shuttle service fees (when truck cannot access site) |
| 11    | StorageInTransit  | Storage-in-transit charges                           |
| 12    | Insurance         | Insurance coverage charges                           |

### ChargeType

Defines how a charge is calculated.

| Value | Name               | Description                                         |
|-------|--------------------|-----------------------------------------------------|
| 0     | PerMile            | Charge calculated per mile                          |
| 1     | FlatFee            | Fixed flat fee charge                               |
| 2     | PerItem            | Charge calculated per item                          |
| 3     | Percentage         | Charge calculated as a percentage of another value  |
| 4     | MileageTable       | Charge based on a mileage lookup table              |
| 100   | MovingHourlyLabor  | Hourly rate for moving labor                        |
| 201   | PackingHourlyLabor | Hourly rate for packing labor                       |
| 300   | DistanceRate       | Rate based on distance                              |
| 400   | Valuation          | Valuation coverage rate                             |
| 500   | BulkyItem          | Bulky item surcharge                                |
| 600   | PrepaidStorage     | Prepaid storage charge                              |
| 601   | WarehouseHandling  | Warehouse handling fee                              |

### StopType

Defines whether a stop is a pickup or drop-off location.

| Value | Name    | Description                          |
|-------|---------|--------------------------------------|
| 0     | PickUp  | Items are being picked up at this stop |
| 1     | DropOff | Items are being delivered to this stop |

### PropertyType

Classifies the type of property at a stop.

| Value | Name            | Description                                    |
|-------|-----------------|------------------------------------------------|
| 1     | Apartment       | Apartment or condo unit                        |
| 2     | House           | Single-family house                            |
| 3     | Commercial      | Commercial or office property                  |
| 4     | Storage         | Storage facility                               |
| 5     | Warehouse       | Warehouse or industrial space                  |
| 6     | AssistedLiving  | Assisted living or nursing facility            |
| 7     | HighRise        | High-rise building                             |
| 8     | TownHouse       | Townhouse or row house                         |
| 10    | Other           | Other property type                            |
| 101-120 | Custom        | Custom property types (company-defined)        |

**Note:** There is no value `9` -- the sequence skips from `8` to `10`.

---

## Contact Enums

### PhoneType

Classifies a phone number by type.

| Value | Name   | Description          |
|-------|--------|----------------------|
| 0     | Mobile | Mobile/cell phone    |
| 1     | Home   | Home landline        |
| 2     | Office | Work/office phone    |
| 3     | Other  | Other phone type     |

---

## Communication Enums

### CallType

Indicates the direction of a phone call.

| Value | Name     | Description                    |
|-------|----------|--------------------------------|
| 0     | Outbound | Call made from the company     |
| 1     | Inbound  | Call received by the company   |

### CallOutcome

Records the result of a phone call.

| Value | Name               | Description                                  |
|-------|--------------------|----------------------------------------------|
| 0     | NoAnswer           | Call was not answered                        |
| 1     | Busy               | Line was busy                                |
| 2     | WrongNumber        | Reached the wrong person/number              |
| 3     | LeftLiveMessage    | Left a message with a live person            |
| 4     | LeftVoicemail      | Left a voicemail message                     |
| 5     | Connected          | Successfully connected and spoke with contact|
| 6     | NumberDisconnected | Phone number is disconnected or not in service|

### FollowUpType

Categorizes the type of follow-up action.

| Value | Name  | Description                                   |
|-------|-------|-----------------------------------------------|
| 0     | Email | Follow up via email                           |
| 1     | Call  | Follow up via phone call                      |
| 2     | Text  | Follow up via text message (SMS)              |
| 3     | Other | Other follow-up method                        |
| 4     | CMET  | Customer Move Experience Touchpoint follow-up |

---

## Payment Enums

### PaymentType

Defines the payment method used.

| Value   | Name           | Description                                  |
|---------|----------------|----------------------------------------------|
| 0       | Cash           | Cash payment                                 |
| 1       | Check          | Payment by check                             |
| 2       | CreditCard     | Credit card payment (manual entry)           |
| 3       | CCGateway      | Credit card via payment gateway              |
| 6       | BillToAccount  | Billed to an account (corporate/invoice)     |
| 7       | StorageCredit  | Applied from storage account credit          |
| 8       | ECheck         | Electronic check payment                     |
| 101-120 | Custom         | Custom payment types (company-defined)       |

**Note:** Values 4 and 5 are not defined in the public API.

### PaymentSource

Identifies the application or interface where a payment was recorded.

| Value | Name            | Description                              |
|-------|-----------------|------------------------------------------|
| 0     | MobileApp       | Payment recorded via the mobile crew app |
| 1     | WebApp          | Payment recorded via the office web app  |
| 2     | CustomerPortal  | Payment made through the customer portal |
| 3     | ExternalApi     | Payment recorded via the External API    |

### PaymentCategory

Classifies the purpose of a payment.

| Value | Name       | Description                                       |
|-------|------------|---------------------------------------------------|
| 0     | Deposit    | Deposit payment to secure the booking             |
| 1     | BalanceDue | Payment toward the remaining balance              |
| 2     | Other      | Other payment category                            |

---

## File & Document Enums

### FileCategory

Categories for uploaded files and attachments.

| Value | Name                  | Description                                      |
|-------|-----------------------|--------------------------------------------------|
| 0     | Documents             | General documents                                |
| 1     | Customer              | Customer-related files                           |
| 2     | Survey                | Pre-move survey photos and files                 |
| 3     | PreMove               | Pre-move condition photos                        |
| 4     | PostMove              | Post-move condition photos                       |
| 5     | Claims                | Damage claims documentation                      |
| 6     | DescriptiveInventory  | Descriptive inventory documentation              |

### DocumentType

Types of system-generated or managed documents.

| Value | Name                  | Description                                      |
|-------|-----------------------|--------------------------------------------------|
| 0     | PrintOnly             | Document for printing only (not signable)        |
| 5     | Contract              | Customer contract/agreement                      |
| 6     | Addendum              | Contract addendum                                |
| 7     | Estimate              | Cost estimate document                           |
| 8     | Invoice               | Invoice for services                             |
| 9     | WorkOrder             | Work order for crew                              |
| 10    | DescriptiveInventory  | Detailed inventory list document                 |
| 11    | CarrierInvoice        | Invoice from a carrier or partner                |
| 12    | TripPlanning          | Trip planning document                           |

---

## Storage Enums

### StorageAccountStatus

Lifecycle status of a storage account.

| Value | Name     | Description                              |
|-------|----------|------------------------------------------|
| 1     | Creating | Storage account is being set up          |
| 5     | Active   | Storage account is active and in use     |
| 11    | Closed   | Storage account has been closed          |

### StorageType

Defines the type of storage arrangement.

| Value | Name      | Description                                       |
|-------|-----------|---------------------------------------------------|
| 0     | SIT       | Storage in Transit (temporary storage during move)|
| 1     | Permanent | Long-term/permanent storage                       |

### StorageBillingPreOrPostPay

Defines the billing timing for storage accounts.

| Value | Name    | Description                                        |
|-------|---------|----------------------------------------------------|
| 5     | PrePay  | Customer pays before the storage period            |
| 10    | PostPay | Customer pays after the storage period             |

### StorageValuationMethod

Defines how storage valuation (insurance) is calculated.

| Value | Name        | Description                                   |
|-------|-------------|-----------------------------------------------|
| 0     | ByCWT       | Valuation based on hundredweight (CWT)        |
| 1     | ByFlatRate  | Flat rate valuation amount                    |
| 2     | ByCubicFoot | Valuation based on cubic footage              |

### StorageDiscountType

Defines whether a storage discount is recurring or one-time.

| Value | Name      | Description                                     |
|-------|-----------|-------------------------------------------------|
| 0     | Recurring | Discount applied to every billing cycle         |
| 1     | OneTime   | Discount applied once                           |

---

## Inventory Enums

### VolumeWeightCalculationMode

Defines how volume and weight are calculated for an opportunity.

| Value | Name      | Description                                              |
|-------|-----------|----------------------------------------------------------|
| 0     | MoveSize  | Volume/weight derived from the selected move size        |
| 1     | Inventory | Volume/weight calculated from the itemized inventory     |
| 2     | Manual    | Volume/weight manually entered                           |

### InventoryItemType

Classifies the type of inventory item.

| Value | Name        | Description                                         |
|-------|-------------|-----------------------------------------------------|
| 0     | Furniture   | Furniture items (couches, tables, beds, etc.)       |
| 1     | Box         | Standard moving boxes                               |
| 2     | CarrierPack | Items packed by the carrier/moving company          |
| 3     | PackByOwner | Items packed by the owner/customer                  |

---

## Task Enums

### TaskItemType

Defines the type of a task or to-do item.

| Value | Name      | Description                    |
|-------|-----------|--------------------------------|
| 1     | PhoneCall | Task to make a phone call      |
| 2     | Email     | Task to send an email          |
| 9     | Todo      | General to-do task             |

### TaskItemStatus

Defines the progress status of a task.

| Value | Name        | Description                    |
|-------|-------------|--------------------------------|
| 1     | NotStarted  | Task has not been started      |
| 2     | InProgress  | Task is currently in progress  |
| 3     | Completed   | Task has been completed        |

---

## Calendar & Survey Enums

### CalendarEntryType

Types of calendar events, primarily for surveys and appointments.

| Value | Name            | Description                                      |
|-------|-----------------|--------------------------------------------------|
| 0     | OnSiteEstimate  | In-person on-site estimate appointment           |
| 1     | BoxDelivery     | Scheduled box delivery to customer               |
| 2     | VirtualSurvey   | Remote video survey appointment                  |
| 3     | PhoneSurvey     | Phone-based survey/estimate appointment          |
| 4     | OtherEvent      | Other calendar event                             |
| 5     | LiveSwitchSurvey| LiveSwitch video survey appointment              |

---

## Audit Enums

### AuditActivityType

Defines the type of change recorded in the audit trail.

| Value | Name    | Description                          |
|-------|---------|--------------------------------------|
| 0     | Created | A new record was created             |
| 1     | Edited  | An existing record was modified      |
| 2     | Deleted | A record was deleted                 |

---

## Miscellaneous Enums

### DiscountType

Defines how a discount is calculated.

| Value | Name       | Description                              |
|-------|------------|------------------------------------------|
| 0     | Amount     | Discount as a fixed dollar amount        |
| 1     | Percentage | Discount as a percentage of the total    |

### SmApplications

Identifies which SmartMoving application performed an action.

| Value | Name                    | Description                                  |
|-------|-------------------------|----------------------------------------------|
| 0     | OfficeWebApp            | The main SmartMoving office web application  |
| 1     | CrewApp                 | The mobile crew/driver application           |
| 2     | PreMoveSurveyApp        | The pre-move survey application              |
| 3     | DescriptiveInventoryApp | The descriptive inventory application        |
| 4     | CustomerPortal          | The customer-facing portal                   |
| 5     | ExternalApi             | The External API (this API)                  |

---

## Usage Notes

1. **Always use integer values** when sending enum fields in request bodies. String names are provided here for reference only.

2. **Handle unknown values gracefully.** SmartMoving may add new enum values in the future. Your integration should handle unexpected integer values without crashing (e.g., log a warning and continue).

3. **Custom ranges (101+)** exist for JobType, PropertyType, and PaymentType. These are company-specific and configured within the SmartMoving platform. Query the appropriate reference data endpoints to discover which custom values are configured for your account.

4. **Gaps in sequences** are intentional (e.g., OpportunityStatus skips 2, PropertyType skips 9, PaymentType skips 4-5). Do not assume consecutive values.
