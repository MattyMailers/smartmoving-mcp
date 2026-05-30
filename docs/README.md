# SmartMoving External API v1 Documentation

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](./AUTHENTICATION.md)
- [Endpoint Reference](./ENDPOINTS.md)
- [Data Schemas](./SCHEMAS.md)
- [Enumerations](./ENUMS.md)
- [Workflow Guides](./WORKFLOWS.md)
- [Best Practices](./BEST-PRACTICES.md)
- [AI Agent Install Guide](./AGENT-INSTALL.md)
- [Opportunity 1.0 vs 2.0 Limitations](./OPPORTUNITY-V1-V2-LIMITATIONS.md)
- [Roadmap](./ROADMAP.md)
- [API Tiers](#api-tiers)
- [Pagination](#pagination)
- [Date Formats](#date-formats)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Identifiers](#identifiers)

---

## Overview

The SmartMoving External API v1 provides programmatic access to SmartMoving's moving company CRM platform. It enables integrations for managing customers, leads, opportunities, jobs, inventory, payments, follow-ups, and reference data.

**Key facts:**

| Detail               | Value                                        |
|-----------------------|----------------------------------------------|
| Version               | v1                                           |
| Total Endpoints       | 55                                           |
| Total Schemas         | 138                                          |
| Authentication        | API key (header or query parameter)          |
| ID Format             | UUID (e.g., `3fa85f64-5717-4562-b3fc-2c963f66afa6`) |
| Transport             | HTTPS only                                   |
| Content Type          | `application/json`                           |

**iHaul iMove live-test note:** the API is publicly `v1`, but opportunity/job behavior differs between older 1.0-style jobs and newer/type-4 2.0-style jobs. Check [Opportunity 1.0 vs 2.0 Limitations](./OPPORTUNITY-V1-V2-LIMITATIONS.md) before building supply, material, or shrink reporting from SmartMoving data.

---

## Base URL

All API requests are made against the following base URL:

```
https://api-public.smartmoving.com/v1
```

All endpoints documented in this reference are relative to this base URL. For example, the full URL for the health check endpoint is:

```
https://api-public.smartmoving.com/v1/api/ping
```

---

## API Tiers

SmartMoving offers two access tiers. Your API key determines which tier you have access to.

### Basic Tier

The Basic tier provides **read-only** access to core data. This includes:

- Listing and retrieving customers
- Listing and retrieving leads and lead statuses
- Retrieving opportunity details, audit trails, jobs, and payments
- Accessing all reference data (branches, move sizes, referral sources, service types, tariffs, users, arrival windows, bad lead reasons, cancellation reasons, lost reasons)

Basic tier endpoints are prefixed with `/api/` (without `premium`).

### Premium Tier

The Premium tier provides **full CRUD** (Create, Read, Update, Delete) access. In addition to everything in the Basic tier, Premium adds:

- Creating and updating customers
- Searching customers
- Creating, updating, and converting leads
- Creating and updating opportunities
- Managing jobs (create, delete, confirm, update notes, manage stops and materials)
- Inventory management (view, submit, add/update/remove items, create rooms)
- Communication logging (calls and notes)
- Follow-up management (create, update, delete, mark complete)
- Uploading attachments
- Accessing storage account payments
- Accessing documents, inventory master list, room types, and tariff materials

Premium tier endpoints are prefixed with `/api/premium/`.

---

## Pagination

Endpoints that return collections use a standard pagination model.

### Request Parameters

| Parameter  | Type    | Default | Description                          |
|------------|---------|---------|--------------------------------------|
| `Page`     | integer | 1       | The page number to retrieve (1-based) |
| `PageSize` | integer | varies  | Number of results per page            |

### Response Structure

All paginated responses share the following envelope:

```json
{
  "pageNumber": 1,
  "pageSize": 25,
  "lastPage": false,
  "totalPages": 4,
  "totalResults": 87,
  "totalThisPage": 25,
  "pageResults": [
    { ... },
    { ... }
  ]
}
```

| Field          | Type    | Description                                        |
|----------------|---------|----------------------------------------------------|
| `pageNumber`   | integer | Current page number                                |
| `pageSize`     | integer | Maximum results per page                           |
| `lastPage`     | boolean | `true` if this is the final page                   |
| `totalPages`   | integer | Total number of pages available                    |
| `totalResults` | integer | Total number of results across all pages           |
| `totalThisPage`| integer | Number of results on the current page              |
| `pageResults`  | array   | Array of result objects for the current page       |

### Example: Iterating Through All Pages

```bash
PAGE=1
LAST_PAGE=false

while [ "$LAST_PAGE" != "true" ]; do
  RESPONSE=$(curl -s -H "x-api-key: YOUR_API_KEY" \
    "https://api-public.smartmoving.com/v1/api/customers?Page=$PAGE&PageSize=50")

  # Process $RESPONSE ...

  LAST_PAGE=$(echo "$RESPONSE" | jq -r '.lastPage')
  PAGE=$((PAGE + 1))
done
```

---

## Date Formats

The API uses two distinct date formats depending on context:

### Service Dates (Integer Format)

Service dates, move dates, and date-based filter parameters use the `yyyyMMdd` integer format.

| Example Value | Represents       |
|---------------|------------------|
| `20240831`    | August 31, 2024  |
| `20250115`    | January 15, 2025 |

This format is used in:
- `FromServiceDate` and `ToServiceDate` query parameters
- `serviceDate` fields on leads and opportunities

### Datetime Fields (ISO 8601)

Timestamps and datetime fields use ISO 8601 format:

```
2024-08-31T14:30:00Z
2024-08-31T14:30:00+00:00
```

This format is used in:
- `createdAtUtc`, `completedAtUtc`, `startTimeUtc`, `endTimeUtc`
- `callDateTime`, `dueDateTime`
- All `*AtUtc` fields

### Move Date (Create/Convert Operations)

When creating opportunities or converting leads, the `moveDate` field uses the `yyyy-MM-dd` string format:

```
"moveDate": "2024-08-31"
```

---

## Error Handling

The API uses standard HTTP status codes to indicate success or failure.

### Common Status Codes

| Code | Meaning               | Description                                                |
|------|-----------------------|------------------------------------------------------------|
| 200  | OK                    | Request succeeded                                          |
| 201  | Created               | Resource created successfully                              |
| 204  | No Content            | Request succeeded with no response body (e.g., DELETE)     |
| 400  | Bad Request           | Invalid request parameters or body                         |
| 401  | Unauthorized          | Missing or invalid API key                                 |
| 403  | Forbidden             | API key does not have access to the requested resource/tier|
| 404  | Not Found             | Resource does not exist                                    |
| 409  | Conflict              | Resource conflict (e.g., duplicate)                        |
| 422  | Unprocessable Entity  | Validation failed on request body                          |
| 429  | Too Many Requests     | Rate limit exceeded                                        |
| 500  | Internal Server Error | Unexpected server error                                    |

### Error Response Body

Error responses generally include a JSON body with details:

```json
{
  "message": "A description of what went wrong",
  "errors": {
    "fieldName": ["Specific validation error for this field"]
  }
}
```

### Recommendations

- Always check the HTTP status code before parsing the response body.
- On 429 responses, implement exponential backoff before retrying.
- On 5xx responses, retry with backoff -- these indicate transient server issues.
- On 4xx responses (other than 429), do not retry without modifying the request.

---

## Rate Limiting

The API enforces rate limits to ensure fair usage across all clients.

- Rate limits are applied per API key.
- When a rate limit is exceeded, the API returns a `429 Too Many Requests` response.
- Implement exponential backoff with jitter when you receive a 429 response.
- Avoid tight polling loops; use reasonable intervals between requests.
- When paginating through large datasets, add a small delay between page requests to stay within limits.

---

## Identifiers

All resource identifiers in the SmartMoving API are **UUIDs** (Universally Unique Identifiers), formatted as:

```
3fa85f64-5717-4562-b3fc-2c963f66afa6
```

These are used for:
- Customer IDs
- Lead IDs
- Opportunity IDs
- Job IDs
- User IDs (salesperson, estimator, assigned-to)
- Branch IDs
- Referral source IDs
- Tariff IDs
- Move size IDs
- Service type IDs
- Room IDs, inventory item IDs
- Follow-up IDs
- Storage account IDs
- All other entity identifiers

UUIDs are case-insensitive but are typically returned in lowercase.

---

## Quick Start

### 1. Verify Connectivity

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/ping
```

### 2. List Customers

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/customers?Page=1&PageSize=10"
```

### 3. Get Reference Data

```bash
# Get branches
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/branches

# Get move sizes
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/move-sizes

# Get referral sources
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/referral-sources
```

### 4. Create a Lead (Premium)

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "phoneNumber": "555-123-4567",
    "emailAddress": "jane.smith@example.com",
    "moveDate": "2024-12-15",
    "referralSourceId": "REFERRAL_SOURCE_UUID",
    "serviceType": 1,
    "branchId": "BRANCH_UUID",
    "originAddress": {
      "street": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zip": "78701"
    }
  }' \
  https://api-public.smartmoving.com/v1/api/premium/leads
```

---

## Documentation Index

| Document                                  | Description                                               |
|-------------------------------------------|-----------------------------------------------------------|
| [Authentication](./AUTHENTICATION.md)     | API key setup, header vs. query parameter, tier access    |
| [Endpoint Reference](./ENDPOINTS.md)      | Complete reference for all 55 endpoints                   |
| [Data Schemas](./SCHEMAS.md)              | All 138 data models with properties and types             |
| [Enumerations](./ENUMS.md)               | All enum types with integer values and descriptions       |
| [Workflow Guides](./WORKFLOWS.md)         | Step-by-step guides for common integration patterns       |
| [Best Practices](./BEST-PRACTICES.md)     | Production-ready tips for pagination, errors, dates, etc. |
