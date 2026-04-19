# SmartMoving API Endpoint Reference

[Back to Overview](./README.md)

---

## Table of Contents

- [Health](#health)
- [Customers (Basic)](#customers-basic)
- [Customers (Premium)](#customers-premium)
- [Leads (Basic)](#leads-basic)
- [Leads (Premium)](#leads-premium)
- [Opportunities (Basic)](#opportunities-basic)
- [Opportunities (Premium)](#opportunities-premium)
- [Follow-ups (Premium)](#follow-ups-premium)
- [Jobs (Premium)](#jobs-premium)
- [Payments](#payments)
- [Reference Data (Basic)](#reference-data-basic)
- [Inventory and Materials (Premium)](#inventory-and-materials-premium)

---

## Conventions

- **Base URL:** `https://api-public.smartmoving.com/v1`
- **Authentication:** `x-api-key` header (see [Authentication](./AUTHENTICATION.md))
- **Content-Type:** `application/json` for all request and response bodies
- **Path parameters** are shown in `{braces}`
- **Required** parameters are marked with an asterisk (*)
- All IDs are UUIDs
- See [Schemas](./SCHEMAS.md) for full data model details
- See [Enums](./ENUMS.md) for enum value definitions

---

## Health

### GET /api/ping

Health check endpoint to verify API connectivity and authentication.

**Tier:** Basic

**Parameters:** None

**Response:** `200 OK`

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/ping
```

---

## Customers (Basic)

### GET /api/customers

List all customers with pagination and optional date filtering.

**Tier:** Basic

**Query Parameters:**

| Parameter              | Type    | Required | Description                                        |
|------------------------|---------|----------|----------------------------------------------------|
| `Page`                 | integer | No       | Page number (default: 1)                           |
| `PageSize`             | integer | No       | Results per page                                   |
| `FromServiceDate`      | integer | No       | Filter by service date on or after (yyyyMMdd)      |
| `ToServiceDate`        | integer | No       | Filter by service date on or before (yyyyMMdd)     |
| `IncludeOpportunityInfo` | boolean | No     | Include opportunity info with each customer        |

**Response:** `200 OK` -- Paginated list of [CustomerViewModel](./SCHEMAS.md#customerviewmodel)

**curl:**

```bash
# List customers, page 1
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/customers?Page=1&PageSize=25"

# Filter by service date range
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/customers?FromServiceDate=20240801&ToServiceDate=20240831&Page=1&PageSize=50"

# Include opportunity info
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/customers?IncludeOpportunityInfo=true&Page=1&PageSize=25"
```

---

### GET /api/customers/{customerId}

Get a single customer by ID.

**Tier:** Basic

**Path Parameters:**

| Parameter    | Type          | Required | Description          |
|--------------|---------------|----------|----------------------|
| `customerId` | string (UUID) | Yes      | Customer identifier  |

**Response:** `200 OK` -- [CustomerViewModel](./SCHEMAS.md#customerviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/customers/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Example Response:**

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
  "secondaryPhoneNumbers": []
}
```

---

### GET /api/customers/{customerId}/opportunities

Get opportunities associated with a customer.

**Tier:** Basic

**Path Parameters:**

| Parameter    | Type          | Required | Description          |
|--------------|---------------|----------|----------------------|
| `customerId` | string (UUID) | Yes      | Customer identifier  |

**Query Parameters:**

| Parameter  | Type    | Required | Description              |
|------------|---------|----------|--------------------------|
| `Page`     | integer | No       | Page number (default: 1) |
| `PageSize` | integer | No       | Results per page         |

**Response:** `200 OK` -- Paginated list of opportunity summaries

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/customers/3fa85f64-5717-4562-b3fc-2c963f66afa6/opportunities?Page=1&PageSize=10"
```

---

### GET /api/customers/{customerId}/storage-accounts

Get storage accounts associated with a customer.

**Tier:** Basic

**Path Parameters:**

| Parameter    | Type          | Required | Description          |
|--------------|---------------|----------|----------------------|
| `customerId` | string (UUID) | Yes      | Customer identifier  |

**Query Parameters:**

| Parameter  | Type    | Required | Description              |
|------------|---------|----------|--------------------------|
| `Page`     | integer | No       | Page number (default: 1) |
| `PageSize` | integer | No       | Results per page         |

**Response:** `200 OK` -- Paginated list of [StorageAccountViewModel](./SCHEMAS.md#storageaccountviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/customers/3fa85f64-5717-4562-b3fc-2c963f66afa6/storage-accounts?Page=1&PageSize=10"
```

---

## Customers (Premium)

### POST /api/premium/customers

Create a new customer.

**Tier:** Premium

**Request Body:** [CreateCustomerRequest](./SCHEMAS.md#createcustomerrequest)

| Field                  | Type                      | Required | Description                |
|------------------------|---------------------------|----------|----------------------------|
| `name`                 | string                    | Yes      | Customer full name         |
| `phoneNumber`          | string                    | No       | Primary phone number       |
| `phoneType`            | integer (PhoneType)       | No       | Type of phone number       |
| `emailAddress`         | string                    | No       | Email address              |
| `address`              | AddressInput              | No       | Customer address           |
| `secondaryPhoneNumbers`| SecondaryPhoneNumber[]    | No       | Additional phone numbers   |

**Response:** `201 Created` -- Created customer with ID

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "phoneNumber": "555-123-4567",
    "phoneType": 0,
    "emailAddress": "jane.smith@example.com",
    "address": {
      "street": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zip": "78701"
    }
  }' \
  https://api-public.smartmoving.com/v1/api/premium/customers
```

---

### PUT /api/premium/customers/{customerId}

Update an existing customer.

**Tier:** Premium

**Path Parameters:**

| Parameter    | Type          | Required | Description          |
|--------------|---------------|----------|----------------------|
| `customerId` | string (UUID) | Yes      | Customer identifier  |

**Request Body:** [UpdateCustomerRequest](./SCHEMAS.md#updatecustomerrequest)

**Response:** `200 OK` -- Updated customer

**curl:**

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith-Johnson",
    "emailAddress": "jane.johnson@example.com"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/customers/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

---

### GET /api/premium/customers/{customerId}/service-tickets

Get service tickets for a customer.

**Tier:** Premium

**Path Parameters:**

| Parameter    | Type          | Required | Description          |
|--------------|---------------|----------|----------------------|
| `customerId` | string (UUID) | Yes      | Customer identifier  |

**Query Parameters:**

| Parameter  | Type    | Required | Description              |
|------------|---------|----------|--------------------------|
| `Page`     | integer | No       | Page number (default: 1) |
| `PageSize` | integer | No       | Results per page         |

**Response:** `200 OK` -- Paginated list of service tickets

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/customers/3fa85f64-5717-4562-b3fc-2c963f66afa6/service-tickets?Page=1&PageSize=10"
```

---

### GET /api/premium/customers/search

Search customers by name, email, or phone number.

**Tier:** Premium

**Query Parameters:**

| Parameter     | Type   | Required | Description                                 |
|---------------|--------|----------|---------------------------------------------|
| `searchQuery` | string | Yes      | Search term (minimum 3 characters)          |

**Response:** `200 OK` -- List of matching customers

**curl:**

```bash
# Search by name
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/customers/search?searchQuery=Jane%20Smith"

# Search by email
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/customers/search?searchQuery=jane.smith%40example.com"

# Search by phone
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/customers/search?searchQuery=555-123"
```

---

## Leads (Basic)

### GET /api/leads

List all leads with pagination.

**Tier:** Basic

**Query Parameters:**

| Parameter  | Type    | Required | Description              |
|------------|---------|----------|--------------------------|
| `Page`     | integer | No       | Page number (default: 1) |
| `PageSize` | integer | No       | Results per page         |

**Response:** `200 OK` -- Paginated list of [LeadViewModel](./SCHEMAS.md#leadviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/leads?Page=1&PageSize=25"
```

---

### GET /api/leads/{leadId}

Get a single lead by ID.

**Tier:** Basic

**Path Parameters:**

| Parameter | Type          | Required | Description       |
|-----------|---------------|----------|-------------------|
| `leadId`  | string (UUID) | Yes      | Lead identifier   |

**Response:** `200 OK` -- [LeadViewModel](./SCHEMAS.md#leadviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/leads/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### GET /api/leads/statuses

Get all available lead statuses.

**Tier:** Basic

**Parameters:** None

**Response:** `200 OK` -- List of lead status definitions

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/leads/statuses
```

---

## Leads (Premium)

### POST /api/premium/leads

Create a new lead. Supports flexible name input and UTM tracking.

**Tier:** Premium

**Request Body:** [CreateLeadRequest](./SCHEMAS.md#createleadrequest)

| Field               | Type                    | Required | Description                                          |
|---------------------|-------------------------|----------|------------------------------------------------------|
| `firstName`         | string                  | No*      | First name                                           |
| `lastName`          | string                  | No*      | Last name                                            |
| `fullName`          | string                  | No*      | Full name (alternative to firstName/lastName)        |
| `phoneNumber`       | string                  | No       | Phone number                                         |
| `emailAddress`      | string                  | No       | Email address                                        |
| `moveDate`          | string (yyyy-MM-dd)     | No       | Desired move date                                    |
| `originAddress`     | AddressInput            | No       | Origin address                                       |
| `destinationAddress`| AddressInput            | No       | Destination address                                  |
| `referralSource`    | string                  | No**     | Referral source name                                 |
| `referralSourceId`  | string (UUID)           | No**     | Referral source ID                                   |
| `utmSource`         | string                  | No       | UTM source                                           |
| `utmMedium`         | string                  | No       | UTM medium                                           |
| `utmCampaign`       | string                  | No       | UTM campaign                                         |
| `utmTerm`           | string                  | No       | UTM term                                             |
| `utmContent`        | string                  | No       | UTM content                                          |
| `bedrooms`          | integer                 | No       | Number of bedrooms                                   |
| `notes`             | string                  | No       | Initial notes                                        |
| `serviceType`       | integer (JobType)       | No       | Desired service type                                 |
| `branchId`          | string (UUID)           | No       | Branch assignment                                    |
| `opportunityType`   | integer (OpportunityType)| No      | Move type                                            |

\* Provide `firstName`/`lastName` or `fullName`.
\** Either `referralSource` or `referralSourceId` is required.

**Response:** `201 Created` -- Created lead with ID

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
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
  }' \
  https://api-public.smartmoving.com/v1/api/premium/leads
```

---

### PUT /api/premium/leads/{leadId}

Full update of a lead. Required fields must always be provided.

**Tier:** Premium

**Path Parameters:**

| Parameter | Type          | Required | Description       |
|-----------|---------------|----------|-------------------|
| `leadId`  | string (UUID) | Yes      | Lead identifier   |

**Request Body:** [UpdateLeadRequest](./SCHEMAS.md#updateleadrequest-put)

| Field              | Type          | Required | Description            |
|--------------------|---------------|----------|------------------------|
| `customerName`     | string        | Yes      | Full customer name     |
| `branchId`         | string (UUID) | Yes      | Branch ID              |
| `referralSourceId` | string (UUID) | Yes      | Referral source ID     |

**Response:** `200 OK` -- Updated lead

**curl:**

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe Updated",
    "branchId": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "referralSourceId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "phoneNumber": "555-234-9999"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/leads/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### PATCH /api/premium/leads/{leadId}

Partial update of a lead. Only send fields that need to change.

**Tier:** Premium

**Path Parameters:**

| Parameter | Type          | Required | Description       |
|-----------|---------------|----------|-------------------|
| `leadId`  | string (UUID) | Yes      | Lead identifier   |

**Request Body:** [PatchLeadRequest](./SCHEMAS.md#patchleadrequest-patch)

Any subset of lead fields, plus:

| Field              | Type    | Required | Description                              |
|--------------------|---------|----------|------------------------------------------|
| `fromExternalApi`  | boolean | No       | Flag indicating update from external API |

**Response:** `200 OK` -- Updated lead

**curl:**

```bash
curl -X PATCH \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "555-999-0000",
    "fromExternalApi": true
  }' \
  https://api-public.smartmoving.com/v1/api/premium/leads/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### GET /api/premium/leads/sales/{salesPersonId}

Get leads assigned to a specific salesperson.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description             |
|-----------------|---------------|----------|-------------------------|
| `salesPersonId` | string (UUID) | Yes      | Salesperson identifier  |

**Query Parameters:**

| Parameter  | Type    | Required | Description              |
|------------|---------|----------|--------------------------|
| `Page`     | integer | No       | Page number (default: 1) |
| `PageSize` | integer | No       | Results per page         |

**Response:** `200 OK` -- Paginated list of [LeadViewModel](./SCHEMAS.md#leadviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/leads/sales/c3d4e5f6-a7b8-9012-cdef-123456789012?Page=1&PageSize=25"
```

---

### PUT /api/premium/lead/{id}/convert

Convert a lead into an opportunity.

**Tier:** Premium

**Path Parameters:**

| Parameter | Type          | Required | Description       |
|-----------|---------------|----------|-------------------|
| `id`      | string (UUID) | Yes      | Lead identifier   |

**Request Body:** [ConvertLeadRequest](./SCHEMAS.md#convertleadrequest)

| Field              | Type                | Required | Description              |
|--------------------|---------------------|----------|--------------------------|
| `customerId`       | string (UUID)       | Yes      | Customer ID              |
| `referralSourceId` | string (UUID)       | Yes      | Referral source ID       |
| `tariffId`         | string (UUID)       | Yes      | Tariff ID                |
| `moveDate`         | string (yyyy-MM-dd) | Yes      | Move date                |
| `moveSizeId`       | string (UUID)       | Yes      | Move size ID             |
| `salesPersonId`    | string (UUID)       | Yes      | Salesperson ID           |
| `serviceTypeId`    | string (UUID)       | Yes      | Service type ID          |
| `branchId`         | string (UUID)       | No       | Branch ID                |
| `originAddress`    | AddressInput        | No       | Origin address           |
| `destinationAddress`| AddressInput       | No       | Destination address      |

**Response:** `200 OK` -- Converted opportunity details

**curl:**

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "referralSourceId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "tariffId": "e5f6a7b8-c9d0-1234-efab-345678901234",
    "moveDate": "2024-12-15",
    "moveSizeId": "f6a7b8c9-d0e1-2345-fabc-456789012345",
    "salesPersonId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "serviceTypeId": "a7b8c9d0-e1f2-3456-abcd-567890123456"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/lead/a1b2c3d4-e5f6-7890-abcd-ef1234567890/convert
```

---

## Opportunities (Basic)

### GET /api/opportunities/{opportunityId}

Get detailed opportunity information. Use `Include*` query parameters to control which related data is returned.

**Tier:** Basic

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Query Parameters:**

| Parameter              | Type    | Required | Description                              |
|------------------------|---------|----------|------------------------------------------|
| `IncludeTripInfo`      | boolean | No       | Include trip info and job details         |
| `IncludePayments`      | boolean | No       | Include payment records                   |
| `IncludeSurveys`       | boolean | No       | Include survey/estimate appointments      |
| `IncludeJobAddresses`  | boolean | No       | Include job stop addresses                |
| `IncludeTasks`         | boolean | No       | Include task/to-do items                  |
| `IncludeFiles`         | boolean | No       | Include uploaded files                    |
| `IncludePhotos`        | boolean | No       | Include photos                            |
| `IncludeDocuments`     | boolean | No       | Include system documents                  |
| `IncludeCharges`       | boolean | No       | Include charge details on jobs            |

**Response:** `200 OK` -- [OpportunityDetailsViewModel](./SCHEMAS.md#opportunitydetailsviewmodel)

**curl:**

```bash
# Basic opportunity details
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/opportunities/a1b2c3d4-e5f6-7890-abcd-ef1234567890

# With all related data
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/opportunities/a1b2c3d4-e5f6-7890-abcd-ef1234567890?IncludeTripInfo=true&IncludePayments=true&IncludeSurveys=true&IncludeJobAddresses=true&IncludeTasks=true&IncludeFiles=true&IncludePhotos=true&IncludeDocuments=true&IncludeCharges=true"
```

---

### GET /api/opportunities/quote/{quoteNumber}

Get an opportunity by its human-readable quote number. Accepts the same `Include*` parameters as the ID-based endpoint.

**Tier:** Basic

**Path Parameters:**

| Parameter     | Type   | Required | Description          |
|---------------|--------|----------|----------------------|
| `quoteNumber` | string | Yes      | Quote number string  |

**Query Parameters:** Same as `GET /api/opportunities/{opportunityId}`

**Response:** `200 OK` -- [OpportunityDetailsViewModel](./SCHEMAS.md#opportunitydetailsviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/opportunities/quote/Q-2024-00123?IncludeTripInfo=true"
```

---

### GET /api/opportunities/{opportunityId}/audit-activity

Get the audit trail for an opportunity, showing all changes.

**Tier:** Basic

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Response:** `200 OK` -- List of [AuditActivityViewModel](./SCHEMAS.md#auditactivityviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/opportunities/a1b2c3d4-e5f6-7890-abcd-ef1234567890/audit-activity
```

---

### GET /api/opportunities/{opportunityId}/jobs

Get all jobs for an opportunity.

**Tier:** Basic

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Response:** `200 OK` -- List of [JobViewModel](./SCHEMAS.md#jobviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/opportunities/a1b2c3d4-e5f6-7890-abcd-ef1234567890/jobs
```

---

### GET /api/payments/opportunities/{opportunityId}

Get all payments for an opportunity.

**Tier:** Basic

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Response:** `200 OK` -- List of [PaymentViewModel](./SCHEMAS.md#paymentviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/payments/opportunities/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## Opportunities (Premium)

### POST /api/premium/opportunity

Create a new opportunity (bypassing the lead stage).

**Tier:** Premium

**Request Body:** [CreateOpportunityRequest](./SCHEMAS.md#createopportunityrequest)

| Field               | Type                | Required | Description              |
|---------------------|---------------------|----------|--------------------------|
| `tariffId`          | string (UUID)       | Yes      | Tariff/rate table        |
| `salesPersonId`     | string (UUID)       | Yes      | Salesperson              |
| `customerId`        | string (UUID)       | Yes      | Customer                 |
| `referralSourceId`  | string (UUID)       | Yes      | Referral source          |
| `moveDate`          | string (yyyy-MM-dd) | Yes      | Move date                |
| `moveSizeId`        | string (UUID)       | Yes      | Move size                |
| `serviceTypeId`     | string (UUID)       | Yes      | Service type             |
| `branchId`          | string (UUID)       | No       | Branch                   |
| `utmInformation`    | UtmInformation      | No       | UTM tracking data        |
| `originAddress`     | AddressInput        | No       | Origin address           |
| `destinationAddress`| AddressInput        | No       | Destination address      |
| `customField01`     | string              | No       | Custom field 1           |
| `customField02`     | string              | No       | Custom field 2           |
| `customField03`     | string              | No       | Custom field 3           |

**Response:** `201 Created` -- Created opportunity details

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tariffId": "e5f6a7b8-c9d0-1234-efab-345678901234",
    "salesPersonId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "referralSourceId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "moveDate": "2024-12-15",
    "moveSizeId": "f6a7b8c9-d0e1-2345-fabc-456789012345",
    "serviceTypeId": "a7b8c9d0-e1f2-3456-abcd-567890123456",
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
    "customField01": "Referred by neighbor"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunity
```

---

### PATCH /api/premium/opportunities/{opportunityId}

Update specific properties on an opportunity.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Request Body:** [PatchOpportunityRequest](./SCHEMAS.md#patchopportunityrequest)

| Field              | Type                       | Required | Description          |
|--------------------|----------------------------|----------|----------------------|
| `moveSizeId`       | string (UUID)              | No       | Move size            |
| `salesPersonId`    | string (UUID)              | No       | Salesperson          |
| `branchId`         | string (UUID)              | No       | Branch               |
| `opportunityType`  | integer (OpportunityType)  | No       | Move type            |
| `volume`           | number                     | No       | Volume (cubic feet)  |
| `weight`           | number                     | No       | Weight (pounds)      |
| `isBinding`        | boolean                    | No       | Binding estimate     |
| `depositAmount`    | number                     | No       | Required deposit     |
| `referralSourceId` | string (UUID)              | No       | Referral source      |
| `customField01`    | string                     | No       | Custom field 1       |
| `customField02`    | string                     | No       | Custom field 2       |
| `customField03`    | string                     | No       | Custom field 3       |

**Response:** `200 OK` -- Updated opportunity

**curl:**

```bash
curl -X PATCH \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "moveSizeId": "f6a7b8c9-d0e1-2345-fabc-456789012345",
    "volume": 800,
    "weight": 6000,
    "depositAmount": 200.00
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### GET /api/premium/opportunities/{opportunityId}/documents

Get documents for an opportunity with download URLs.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Response:** `200 OK` -- List of [OpportunityDocumentViewModel](./SCHEMAS.md#opportunitydocumentviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/a1b2c3d4-e5f6-7890-abcd-ef1234567890/documents
```

---

### GET /api/premium/opportunities/{opportunityId}/inventory

Get the full inventory for an opportunity.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Response:** `200 OK` -- [OpportunityInventoryViewModel](./SCHEMAS.md#opportunityinventoryviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/a1b2c3d4-e5f6-7890-abcd-ef1234567890/inventory
```

---

### POST /api/premium/opportunities/{opportunityId}/inventory/submit

Submit inventory for review.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Request Body:** None

**Response:** `200 OK`

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/a1b2c3d4-e5f6-7890-abcd-ef1234567890/inventory/submit
```

---

### POST /api/premium/opportunities/{opportunityId}/attachments

Upload a file attachment to an opportunity.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Request Body:** [UploadAttachmentRequest](./SCHEMAS.md#uploadattachmentrequest)

| Field      | Type                      | Required | Description                              |
|------------|---------------------------|----------|------------------------------------------|
| `fileName` | string                    | Yes      | File name with extension                 |
| `fileData` | string (base64)           | Yes      | Base64-encoded file data                 |
| `category` | integer (FileCategory)    | Yes      | File category (0-6)                      |

**Allowed file types:** `.doc`, `.docx`, `.xls`, `.xlsx`, `.pdf`, `.txt`, `.csv`, `.png`, `.jpeg`, `.jpg`

**Response:** `201 Created`

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "move-estimate.pdf",
    "fileData": "JVBERi0xLjQKJcOkw7zDtsO...",
    "category": 0
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/a1b2c3d4-e5f6-7890-abcd-ef1234567890/attachments
```

---

### POST /api/premium/opportunities/{opportunityId}/inventory/rooms/{roomId}

Add inventory items to a specific room.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `roomId`        | string (UUID) | Yes      | Room identifier          |

**Request Body:** [AddInventoryItemsRequest](./SCHEMAS.md#addinventoryitemsrequest)

| Field                              | Type          | Required | Description                                  |
|------------------------------------|---------------|----------|----------------------------------------------|
| `masterItemId`                     | string (UUID) | No*      | Master inventory item ID                     |
| `name`                             | string        | No*      | Custom item name                             |
| `quantity`                         | integer       | No       | Quantity (default: 1)                        |
| `saveToMaster`                     | boolean       | No       | Save custom item to master list              |
| `changeVolumeWeightCalculationMode`| boolean       | No       | Switch to Inventory calculation mode         |
| `markAsNeedsReview`                | boolean       | No       | Flag as needing review                       |

\* Provide either `masterItemId` or `name`.

**Response:** `201 Created`

**curl:**

```bash
# Add item from master inventory
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "masterItemId": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "quantity": 2,
    "changeVolumeWeightCalculationMode": true
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory/rooms/ROOM_UUID

# Add custom item
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Antique Piano",
    "quantity": 1,
    "saveToMaster": true,
    "markAsNeedsReview": true
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory/rooms/ROOM_UUID
```

---

### PUT /api/premium/opportunities/{opportunityId}/inventory/rooms/{roomId}/items/{inventoryItemId}

Update an inventory item in a room.

**Tier:** Premium

**Path Parameters:**

| Parameter         | Type          | Required | Description                |
|-------------------|---------------|----------|----------------------------|
| `opportunityId`   | string (UUID) | Yes      | Opportunity identifier     |
| `roomId`          | string (UUID) | Yes      | Room identifier            |
| `inventoryItemId` | string (UUID) | Yes      | Inventory item identifier  |

**Request Body:** [UpdateInventoryItemRequest](./SCHEMAS.md#updateinventoryitemrequest)

**Response:** `200 OK`

**curl:**

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3,
    "volume": 25.5,
    "weight": 150
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory/rooms/ROOM_UUID/items/ITEM_UUID
```

---

### DELETE /api/premium/opportunities/{opportunityId}/inventory/rooms/{roomId}/items/{inventoryItemId}

Remove an inventory item from a room.

**Tier:** Premium

**Path Parameters:**

| Parameter         | Type          | Required | Description                |
|-------------------|---------------|----------|----------------------------|
| `opportunityId`   | string (UUID) | Yes      | Opportunity identifier     |
| `roomId`          | string (UUID) | Yes      | Room identifier            |
| `inventoryItemId` | string (UUID) | Yes      | Inventory item identifier  |

**Response:** `204 No Content`

**curl:**

```bash
curl -X DELETE \
  -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/inventory/rooms/ROOM_UUID/items/ITEM_UUID
```

---

### POST /api/premium/opportunities/{opportunityId}/rooms

Create rooms for an opportunity's inventory.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Request Body:** Array of [CreateRoomsRequest](./SCHEMAS.md#createroomsrequest) objects

| Field        | Type          | Required | Description          |
|--------------|---------------|----------|----------------------|
| `name`       | string        | Yes      | Room name            |
| `roomTypeId` | string (UUID) | Yes      | Room type ID         |

**Response:** `201 Created`

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"name": "Master Bedroom", "roomTypeId": "ROOM_TYPE_UUID"},
    {"name": "Kitchen", "roomTypeId": "ROOM_TYPE_UUID_2"},
    {"name": "Living Room", "roomTypeId": "ROOM_TYPE_UUID_3"}
  ]' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/rooms
```

---

### POST /api/premium/opportunities/{opportunityId}/communication/calls

Log a phone call on an opportunity.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Request Body:** [CallLogInput](./SCHEMAS.md#calloginput)

| Field          | Type                       | Required | Description                        |
|----------------|----------------------------|----------|------------------------------------|
| `callType`     | integer (CallType)         | Yes      | 0=Outbound, 1=Inbound             |
| `callDateTime` | string (ISO 8601)          | Yes      | When the call occurred             |
| `outcome`      | integer (CallOutcome)      | No       | Call outcome (0-6)                 |
| `description`  | string                     | No       | Notes about the call (max 1000)    |
| `fromNumber`   | string                     | No       | Originating phone number           |
| `toNumber`     | string                     | No       | Destination phone number           |
| `createdBy`    | string (UUID)              | No       | User ID who logged the call        |

**Response:** `201 Created`

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "callType": 0,
    "callDateTime": "2024-08-15T14:30:00Z",
    "outcome": 5,
    "description": "Discussed move details and confirmed move date",
    "fromNumber": "555-000-1111",
    "toNumber": "555-123-4567",
    "createdBy": "c3d4e5f6-a7b8-9012-cdef-123456789012"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/communication/calls
```

---

### POST /api/premium/opportunities/{opportunityId}/communication/notes

Log a note on an opportunity.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Request Body:** [NoteLogInput](./SCHEMAS.md#noteloginput)

| Field       | Type          | Required | Description                        |
|-------------|---------------|----------|------------------------------------|
| `notes`     | string        | Yes      | Note content (max 4000 characters) |
| `createdBy` | string (UUID) | No       | User ID who created the note       |

**Response:** `201 Created`

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Customer prefers afternoon arrival window. Has a grand piano that requires special handling.",
    "createdBy": "c3d4e5f6-a7b8-9012-cdef-123456789012"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/communication/notes
```

---

## Follow-ups (Premium)

### GET /api/premium/opportunities/{opportunityId}/followups

List all follow-ups for an opportunity.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Response:** `200 OK` -- List of [FollowUpViewModel](./SCHEMAS.md#followupviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups
```

---

### POST /api/premium/opportunities/{opportunityId}/followups

Create a follow-up for an opportunity.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Request Body:** [CreateFollowUpRequest](./SCHEMAS.md#createfollowuprequest)

| Field          | Type                      | Required | Description                    |
|----------------|---------------------------|----------|--------------------------------|
| `type`         | integer (FollowUpType)    | Yes      | Follow-up type (0-4)          |
| `title`        | string                    | Yes      | Title (max 100 characters)     |
| `assignedToId` | string (UUID)             | Yes      | Assigned user                  |
| `dueDateTime`  | string (ISO 8601)         | Yes      | Due date/time                  |
| `notes`        | string                    | No       | Additional notes               |

**Response:** `201 Created`

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": 1,
    "title": "Follow up on estimate",
    "assignedToId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "dueDateTime": "2024-08-20T10:00:00Z",
    "notes": "Customer requested a callback after reviewing the estimate"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups
```

---

### GET /api/premium/opportunities/{opportunityId}/followups/{followupId}

Get a specific follow-up.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `followupId`    | string (UUID) | Yes      | Follow-up identifier     |

**Response:** `200 OK` -- [FollowUpViewModel](./SCHEMAS.md#followupviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups/FOLLOWUP_UUID
```

---

### PUT /api/premium/opportunities/{opportunityId}/followups/{followupId}

Update a follow-up.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `followupId`    | string (UUID) | Yes      | Follow-up identifier     |

**Request Body:** [UpdateFollowUpRequest](./SCHEMAS.md#updatefollowuprequest)

**Response:** `200 OK`

**curl:**

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": 1,
    "title": "Follow up on revised estimate",
    "assignedToId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "dueDateTime": "2024-08-22T14:00:00Z",
    "notes": "Revised estimate sent, follow up in 2 days"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups/FOLLOWUP_UUID
```

---

### DELETE /api/premium/opportunities/{opportunityId}/followups/{followupId}

Delete a follow-up.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `followupId`    | string (UUID) | Yes      | Follow-up identifier     |

**Response:** `204 No Content`

**curl:**

```bash
curl -X DELETE \
  -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups/FOLLOWUP_UUID
```

---

### POST /api/premium/opportunities/{opportunityId}/followups/{followupId}/mark-complete

Mark a follow-up as complete.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `followupId`    | string (UUID) | Yes      | Follow-up identifier     |

**Request Body:** None

**Response:** `200 OK`

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/followups/FOLLOWUP_UUID/mark-complete
```

---

## Jobs (Premium)

### POST /api/premium/opportunities/{opportunityId}/jobs

Create a new job within an opportunity.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |

**Request Body:** [CreateJobRequest](./SCHEMAS.md#createjobrequest)

| Field         | Type                 | Required | Description              |
|---------------|----------------------|----------|--------------------------|
| `serviceType` | integer (JobType)    | Yes      | Type of job              |

**Response:** `201 Created` -- Created job details

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"serviceType": 1}' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs
```

---

### GET /api/premium/opportunities/{opportunityId}/jobs/{jobId}

Get detailed information about a specific job.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `jobId`         | string (UUID) | Yes      | Job identifier           |

**Query Parameters:**

| Parameter                  | Type    | Required | Description                    |
|----------------------------|---------|----------|--------------------------------|
| `IncludeEstimatedCharges`  | boolean | No       | Include estimated charges      |
| `IncludeActualCharges`     | boolean | No       | Include actual charges         |
| `IncludeEstimatedMaterials`| boolean | No       | Include estimated materials    |
| `IncludeActualMaterials`   | boolean | No       | Include actual materials       |
| `IncludeStops`             | boolean | No       | Include stop details           |

**Response:** `200 OK` -- [JobViewModel](./SCHEMAS.md#jobviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID?IncludeEstimatedCharges=true&IncludeActualCharges=true&IncludeStops=true"
```

---

### DELETE /api/premium/opportunities/{opportunityId}/jobs/{jobId}

Delete a job from an opportunity.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `jobId`         | string (UUID) | Yes      | Job identifier           |

**Response:** `204 No Content`

**curl:**

```bash
curl -X DELETE \
  -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID
```

---

### POST /api/premium/opportunities/{opportunityId}/jobs/{jobId}/confirm

Confirm a job.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `jobId`         | string (UUID) | Yes      | Job identifier           |

**Request Body (optional):**

| Field      | Type   | Required | Description              |
|------------|--------|----------|--------------------------|
| `category` | string | No       | Confirmation category    |

**Response:** `200 OK`

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID/confirm
```

---

### PATCH /api/premium/opportunities/{opportunityId}/jobs/{jobId}/notes

Update notes on a job.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `jobId`         | string (UUID) | Yes      | Job identifier           |

**Request Body:** [UpdateJobNotesRequest](./SCHEMAS.md#updatejobnotesrequest)

| Field             | Type   | Required | Description              |
|-------------------|--------|----------|--------------------------|
| `crewNotes`       | string | No       | Notes for the crew       |
| `customerNotes`   | string | No       | Notes for the customer   |
| `internalNotes`   | string | No       | Internal notes           |
| `accountingNotes` | string | No       | Accounting notes         |
| `dispatcherNotes` | string | No       | Dispatcher notes         |

**Response:** `200 OK`

**curl:**

```bash
curl -X PATCH \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "crewNotes": "Customer has a large piano on the second floor. Use piano dolly.",
    "customerNotes": "Please park in the driveway. Gate code: 1234.",
    "dispatcherNotes": "Narrow street, may need shuttle truck."
  }' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID/notes
```

---

### PUT /api/premium/opportunities/{opportunityId}/jobs/{jobId}/stops

Set the stops for a job. This replaces all existing stops.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `jobId`         | string (UUID) | Yes      | Job identifier           |

**Request Body:** Array of [UpdateJobStopsRequest](./SCHEMAS.md#updatejobstopsrequest) objects

**Response:** `200 OK`

**curl:**

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
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
  ]' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID/stops
```

---

### POST /api/premium/opportunities/{opportunityId}/Estimated/jobs/{jobId}/materials

Add estimated materials to a job. This overwrites all existing estimated materials.

**Tier:** Premium

**Path Parameters:**

| Parameter       | Type          | Required | Description              |
|-----------------|---------------|----------|--------------------------|
| `opportunityId` | string (UUID) | Yes      | Opportunity identifier   |
| `jobId`         | string (UUID) | Yes      | Job identifier           |

**Request Body:** Array of [AddMaterialsRequest](./SCHEMAS.md#addmaterialsrequest) objects

| Field        | Type          | Required | Description              |
|--------------|---------------|----------|--------------------------|
| `materialId` | string (UUID) | Yes      | Material ID              |
| `quantity`   | number        | Yes      | Quantity                 |

**Response:** `200 OK`

**curl:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"materialId": "MAT_UUID_1", "quantity": 20},
    {"materialId": "MAT_UUID_2", "quantity": 5},
    {"materialId": "MAT_UUID_3", "quantity": 2}
  ]' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/Estimated/jobs/JOB_UUID/materials
```

---

## Payments

### GET /api/premium/payments/storage-accounts/{storageAccountId}

Get payments for a storage account.

**Tier:** Premium

**Path Parameters:**

| Parameter          | Type          | Required | Description                  |
|--------------------|---------------|----------|------------------------------|
| `storageAccountId` | string (UUID) | Yes      | Storage account identifier   |

**Response:** `200 OK` -- List of [PaymentViewModel](./SCHEMAS.md#paymentviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/payments/storage-accounts/STORAGE_UUID
```

---

## Reference Data (Basic)

All reference data endpoints are available at the Basic tier and return data used to populate dropdowns, map IDs to names, and provide valid values for create/update operations.

### GET /api/branches

Get all company branches.

**Tier:** Basic

**Query Parameters:**

| Parameter  | Type    | Required | Description              |
|------------|---------|----------|--------------------------|
| `Page`     | integer | No       | Page number (default: 1) |
| `PageSize` | integer | No       | Results per page         |

**Response:** `200 OK` -- Paginated list of [BranchViewModel](./SCHEMAS.md#branchviewmodel) (includes dispatch location with lat/lng)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/branches
```

**Example Response:**

```json
{
  "pageNumber": 1,
  "pageSize": 25,
  "lastPage": true,
  "totalPages": 1,
  "totalResults": 2,
  "totalThisPage": 2,
  "pageResults": [
    {
      "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "name": "Austin Main",
      "dispatchLocation": {
        "lat": 30.2672,
        "lng": -97.7431
      }
    },
    {
      "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
      "name": "Houston Branch",
      "dispatchLocation": {
        "lat": 29.7604,
        "lng": -95.3698
      }
    }
  ]
}
```

---

### GET /api/move-sizes

Get all available move size classifications.

**Tier:** Basic

**Response:** `200 OK` -- List of [MoveSizeViewModel](./SCHEMAS.md#movesizeviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/move-sizes
```

---

### GET /api/referral-sources

Get all referral sources.

**Tier:** Basic

**Query Parameters:**

| Parameter              | Type    | Required | Description                          |
|------------------------|---------|----------|--------------------------------------|
| `includePrivate`       | boolean | No       | Include private referral sources     |
| `includeLeadProviders` | boolean | No       | Include lead provider sources        |

**Response:** `200 OK` -- List of [ReferralSourceViewModel](./SCHEMAS.md#referralsourceviewmodel)

**curl:**

```bash
# All public referral sources
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/referral-sources

# Include private and lead providers
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/referral-sources?includePrivate=true&includeLeadProviders=true"
```

---

### GET /api/service-types

Get all available service types.

**Tier:** Basic

**Response:** `200 OK` -- List of [ServiceTypeViewModel](./SCHEMAS.md#servicetypeviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/service-types
```

---

### GET /api/tariffs

Get all tariffs (rate tables).

**Tier:** Basic

**Query Parameters:**

| Parameter          | Type    | Required | Description                |
|--------------------|---------|----------|----------------------------|
| `IncludeDisabled`  | boolean | No       | Include disabled tariffs   |
| `IncludeTechMate`  | boolean | No       | Include TechMate tariffs   |

**Response:** `200 OK` -- List of [TariffViewModel](./SCHEMAS.md#tariffviewmodel) (includes `appliesToOpportunityTypes` and `appliesToBranches`)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/tariffs

# Include disabled tariffs
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/tariffs?IncludeDisabled=true"
```

---

### GET /api/users

Get all office users (salespersons, estimators, etc.).

**Tier:** Basic

**Response:** `200 OK` -- List of [UserViewModel](./SCHEMAS.md#userviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/users
```

---

### GET /api/arrival-windows

Get all configured arrival windows.

**Tier:** Basic

**Response:** `200 OK` -- List of [ArrivalWindowViewModel](./SCHEMAS.md#arrivalwindowviewmodel)

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/arrival-windows
```

---

### GET /api/bad-lead-reasons

Get all bad lead reason options.

**Tier:** Basic

**Response:** `200 OK` -- List of bad lead reasons

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/bad-lead-reasons
```

---

### GET /api/cancellation-reasons

Get all cancellation reason options.

**Tier:** Basic

**Response:** `200 OK` -- List of cancellation reasons

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/cancellation-reasons
```

---

### GET /api/lost-reasons

Get all lost lead/opportunity reason options.

**Tier:** Basic

**Response:** `200 OK` -- List of lost reasons

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/lost-reasons
```

---

## Inventory and Materials (Premium)

### GET /api/premium/inventory

Get the master inventory item list.

**Tier:** Premium

**Query Parameters:**

| Parameter  | Type    | Required | Description              |
|------------|---------|----------|--------------------------|
| `Page`     | integer | No       | Page number (default: 1) |
| `PageSize` | integer | No       | Results per page         |

**Response:** `200 OK` -- Paginated list of master inventory items

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/premium/inventory?Page=1&PageSize=50"
```

---

### GET /api/premium/room-types

Get all available room types.

**Tier:** Premium

**Response:** `200 OK` -- List of room type definitions

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/room-types
```

---

### GET /api/premium/tariffs/{tariffId}/materials

Get materials available for a specific tariff.

**Tier:** Premium

**Path Parameters:**

| Parameter  | Type          | Required | Description          |
|------------|---------------|----------|----------------------|
| `tariffId` | string (UUID) | Yes      | Tariff identifier    |

**Response:** `200 OK` -- List of materials with rate, packTime, unpackTime, cost, volume, weight

**curl:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/tariffs/TARIFF_UUID/materials
```

**Example Response:**

```json
[
  {
    "id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "name": "Small Box (1.5 cu ft)",
    "rate": 8.50,
    "packTime": 5,
    "unpackTime": 3,
    "cost": 2.50,
    "volume": 1.5,
    "weight": 30
  },
  {
    "id": "a2b3c4d5-e6f7-8901-bcde-f12345678901",
    "name": "Medium Box (3.0 cu ft)",
    "rate": 12.00,
    "packTime": 8,
    "unpackTime": 5,
    "cost": 3.50,
    "volume": 3.0,
    "weight": 50
  }
]
```
