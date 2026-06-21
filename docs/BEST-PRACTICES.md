# SmartMoving API Best Practices

[Back to Overview](./README.md)

---

## Table of Contents

- [Pagination Handling](#pagination-handling)
- [Error Handling](#error-handling)
- [Date Format Handling](#date-format-handling)
- [ID Management](#id-management)
- [Data Relationships](#data-relationships)
- [Reference Data Caching](#reference-data-caching)
- [UTM Tracking](#utm-tracking)
- [Rate Limit Management](#rate-limit-management)
- [Request Optimization](#request-optimization)
- [Inventory Management Tips](#inventory-management-tips)
- [Communication Logging Tips](#communication-logging-tips)
- [Security Considerations](#security-considerations)
- [Testing and Debugging](#testing-and-debugging)

---

## Pagination Handling

### Always Iterate to Completion

Never assume that a single page contains all results. Always check the `lastPage` field and continue fetching until it is `true`.

```python
# Python example
import requests

def get_all_pages(url, api_key, page_size=50):
    all_results = []
    page = 1

    while True:
        response = requests.get(
            url,
            headers={"x-api-key": api_key},
            params={"Page": page, "PageSize": page_size}
        )
        data = response.json()
        all_results.extend(data["pageResults"])

        if data["lastPage"]:
            break

        page += 1

    return all_results

customers = get_all_pages(
    "https://api-public.smartmoving.com/v1/api/customers",
    "YOUR_API_KEY"
)
```

### Choose Appropriate Page Sizes

- Use `PageSize=50` to `PageSize=100` for bulk data loading.
- Use `PageSize=10` to `PageSize=25` for user-facing applications with display pagination.
- Avoid extremely large page sizes as they may increase response times.

### Use Total Count for Progress Tracking

The `totalResults` field tells you the total dataset size upfront. Use it for progress bars or estimated completion times.

```python
first_page = fetch_page(1, page_size=100)
total = first_page["totalResults"]
print(f"Syncing {total} records across {first_page['totalPages']} pages...")
```

### Handle Empty Results

An empty result set returns a valid pagination envelope with `totalResults: 0` and an empty `pageResults` array. Check for this gracefully.

---

## Error Handling

### Implement Retry Logic with Exponential Backoff

For transient errors (429, 500, 502, 503, 504), implement retries with exponential backoff and jitter.

```python
import time
import random

def api_request_with_retry(method, url, api_key, max_retries=3, **kwargs):
    for attempt in range(max_retries):
        response = requests.request(
            method,
            url,
            headers={"x-api-key": api_key, "Content-Type": "application/json"},
            **kwargs
        )

        if response.status_code in (429, 500, 502, 503, 504):
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) + random.uniform(0, 1)
                print(f"Retry {attempt + 1}/{max_retries} after {wait_time:.1f}s "
                      f"(HTTP {response.status_code})")
                time.sleep(wait_time)
                continue

        return response

    return response  # Return last response after all retries exhausted
```

### Categorize Errors by Action Required

| Status Code | Category    | Action                                          |
|-------------|-------------|--------------------------------------------------|
| 400         | Client fix  | Fix the request body or parameters               |
| 401         | Client fix  | Check API key configuration                      |
| 403         | Client fix  | Upgrade tier or check resource permissions        |
| 404         | Client fix  | Verify the resource ID exists                    |
| 409         | Client fix  | Resolve duplicate or conflicting data            |
| 422         | Client fix  | Fix validation errors in the request body        |
| 429         | Retry       | Back off and retry after a delay                 |
| 5xx         | Retry       | Transient server issue, retry with backoff       |

### Parse Validation Errors

On 400 and 422 responses, the API returns specific field-level errors. Parse and surface these to users or logs.

```python
if response.status_code in (400, 422):
    error_data = response.json()
    print(f"Error: {error_data.get('message', 'Unknown error')}")
    for field, errors in error_data.get("errors", {}).items():
        for error in errors:
            print(f"  - {field}: {error}")
```

### Log Full Request/Response on Errors

For debugging, log the full request method, URL, headers (redact API key), request body, and response body on any error response.

---

## Date Format Handling

### Three Date Formats to Know

The API uses three distinct date formats. Using the wrong format causes silent data errors or validation failures.

| Format             | Example        | Where Used                                       |
|--------------------|----------------|--------------------------------------------------|
| `yyyyMMdd` integer | `20240831`     | Service date filters, `serviceDate` on responses |
| `yyyy-MM-dd` string | `"2024-08-31"` | `moveDate` in create/convert requests            |
| ISO 8601           | `"2024-08-31T14:30:00Z"` | All `*AtUtc` fields, `callDateTime`, `dueDateTime` |

### Converting Between Formats

```python
from datetime import datetime

# Integer to date object
service_date_int = 20240831
date_obj = datetime.strptime(str(service_date_int), "%Y%m%d")

# Date object to move date string
move_date_str = date_obj.strftime("%Y-%m-%d")  # "2024-08-31"

# Date object to ISO 8601
iso_str = date_obj.strftime("%Y-%m-%dT%H:%M:%SZ")  # "2024-08-31T00:00:00Z"

# Date object to service date integer
service_date_int = int(date_obj.strftime("%Y%m%d"))  # 20240831
```

```javascript
// JavaScript equivalents

// Integer to Date object
const serviceDateInt = 20240831;
const dateStr = String(serviceDateInt);
const dateObj = new Date(
  parseInt(dateStr.slice(0, 4)),
  parseInt(dateStr.slice(4, 6)) - 1,
  parseInt(dateStr.slice(6, 8))
);

// Date to move date string
const moveDate = dateObj.toISOString().split("T")[0]; // "2024-08-31"

// Date to ISO 8601
const isoStr = dateObj.toISOString(); // "2024-08-31T00:00:00.000Z"

// Date to service date integer
const toServiceDateInt = (d) =>
  d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
```

### Always Use UTC for Timestamps

When sending datetime values (ISO 8601 format), always use UTC (indicated by the `Z` suffix or `+00:00` offset). The API stores and returns timestamps in UTC.

---

## ID Management

### Store UUIDs as Strings

UUIDs should be stored as strings (36 characters including hyphens). Do not attempt to convert them to integers or other formats.

```
3fa85f64-5717-4562-b3fc-2c963f66afa6
```

### Create ID Mapping Tables

When integrating with an external system, maintain a mapping between SmartMoving UUIDs and your internal IDs.

```sql
CREATE TABLE sm_id_mapping (
    internal_id    BIGINT PRIMARY KEY,
    entity_type    VARCHAR(50) NOT NULL,  -- 'customer', 'lead', 'opportunity', etc.
    smartmoving_id UUID NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (entity_type, smartmoving_id)
);
```

### Validate UUIDs Before Sending

Validate that IDs match the UUID format before sending requests to avoid unnecessary 400 errors.

```python
import re

UUID_PATTERN = re.compile(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    re.IGNORECASE
)

def is_valid_uuid(value):
    return bool(UUID_PATTERN.match(str(value)))
```

### Handle Case Insensitivity

UUIDs are case-insensitive. The API returns lowercase, but accepts any case. Normalize to lowercase when storing and comparing.

---

## Data Relationships

### SmartMoving 1.0 vs 2.0 opportunity behavior

SmartMoving exposes only the public `v1` API, but live iHaul iMove testing shows different behavior across opportunity/job models:

- 1.0-style jobs can expose `estimatedCharges`, `actualCharges`, `estimatedMaterials`, and item-level `actualMaterials` from Premium job detail.
- 2.0-style/type-4 jobs can expose stops, dates, notes, payments, documents, and audit activity while returning empty material/charge arrays from Premium job detail.
- For 2.0-style jobs, `get_opportunity_audit` may show material total changes in plain English. Use this as a fallback signal, not item-level truth.
- Standard opportunity embedded jobs may disagree with `get_jobs_by_opportunity` / Premium job detail on closed state. Trust the latter for write eligibility.

See [Opportunity 1.0 vs 2.0 Limitations](./OPPORTUNITY-V1-V2-LIMITATIONS.md).

### Entity Relationship Overview

Understanding how entities relate to each other is essential for building correct integrations.

```
Customer (1)
  |
  +-- Lead (many)
  |     |
  |     +-- [Convert] --> Opportunity
  |
  +-- Opportunity (many)
  |     |
  |     +-- Job (many)
  |     |     |
  |     |     +-- Stop (many)
  |     |     +-- Charge (many, estimated + actual)
  |     |     +-- Material (many, estimated + actual)
  |     |
  |     +-- Payment (many)
  |     +-- Follow-up (many)
  |     +-- Inventory
  |     |     |
  |     |     +-- Room (many)
  |     |           |
  |     |           +-- Item (many)
  |     |
  |     +-- File/Attachment (many)
  |     +-- Document (many)
  |     +-- Survey (many)
  |     +-- Task (many)
  |     +-- Audit Activity (many)
  |
  +-- Storage Account (many)
        |
        +-- Payment (many)
```

### Key Relationship Rules

1. **A Customer can have many Leads and Opportunities.** Always search for existing customers before creating new ones.

2. **A Lead converts into an Opportunity.** The lead still exists but its status changes. The new opportunity references the same customer.

3. **An Opportunity can have multiple Jobs.** For example, a packing job and a moving job on different days.

4. **Each Job has Stops.** Every job needs at least one pickup and one drop-off stop. Stops are replaced as a whole set (PUT, not PATCH).

5. **Materials overwrite.** When adding materials to a job, the entire list is replaced. Always send the complete materials list.

6. **Inventory is per-Opportunity, organized by Room.** Items are added to rooms. Rooms must be created before items can be added.

7. **Follow-ups are per-Opportunity.** Each follow-up is assigned to a specific user.

### Reference Data Dependencies

Many create operations require IDs from reference data. Load these first.

| To Create/Convert | You Need                                                              |
|--------------------|-----------------------------------------------------------------------|
| Lead               | `referralSourceId` (or `referralSource` name), optionally `branchId`  |
| Opportunity        | `tariffId`, `salesPersonId`, `customerId`, `referralSourceId`, `moveSizeId`, `serviceTypeId` |
| Convert Lead       | Same as Opportunity                                                   |
| Job                | `serviceType` (enum value, not an ID)                                 |
| Room               | `roomTypeId`                                                          |
| Inventory Item     | `masterItemId` (or custom `name`)                                     |
| Job Materials      | `materialId` (from tariff materials)                                  |
| Follow-up          | `assignedToId` (user ID)                                              |

---

## Reference Data Caching

### Cache Strategy

Reference data (branches, move sizes, referral sources, service types, tariffs, users) changes infrequently. Cache it locally to reduce API calls.

```python
import json
import os
from datetime import datetime, timedelta

CACHE_DIR = "./cache"
CACHE_TTL = timedelta(hours=24)  # Refresh daily

def get_reference_data(endpoint, api_key):
    cache_file = os.path.join(CACHE_DIR, f"{endpoint.replace('/', '_')}.json")

    # Check cache
    if os.path.exists(cache_file):
        modified = datetime.fromtimestamp(os.path.getmtime(cache_file))
        if datetime.now() - modified < CACHE_TTL:
            with open(cache_file) as f:
                return json.load(f)

    # Fetch from API
    response = requests.get(
        f"https://api-public.smartmoving.com/v1/api/{endpoint}",
        headers={"x-api-key": api_key}
    )
    data = response.json()

    # Save to cache
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(cache_file, "w") as f:
        json.dump(data, f)

    return data
```

### Build Lookup Dictionaries

Build ID-to-name and name-to-ID lookups for frequently used reference data.

```python
# Build lookup from move sizes
move_sizes = get_reference_data("move-sizes", api_key)
move_size_by_id = {ms["id"]: ms for ms in move_sizes}
move_size_by_name = {ms["name"]: ms for ms in move_sizes}

# Usage
size = move_size_by_name.get("3 Bedroom")
if size:
    move_size_id = size["id"]
```

### Refresh on 404 Errors

If you get a 404 when using a cached reference data ID, the item may have been deleted. Refresh the cache and retry.

---

## UTM Tracking

### When to Include UTM Data

UTM (Urchin Tracking Module) parameters enable marketing attribution. Include them when leads originate from tracked marketing campaigns.

### Where UTM Data Can Be Set

- **Creating a Lead:** Use top-level `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent` fields.
- **Creating an Opportunity:** Use the nested `utmInformation` object.

### Recommended UTM Structure

| Parameter     | Purpose                    | Example Values                          |
|---------------|----------------------------|-----------------------------------------|
| `utmSource`   | Traffic source             | `google`, `facebook`, `yelp`, `referral` |
| `utmMedium`   | Marketing medium           | `cpc`, `organic`, `social`, `email`     |
| `utmCampaign` | Campaign name              | `summer-promo-2024`, `local-movers-atx` |
| `utmTerm`     | Paid search keyword        | `movers near me`, `local moving company`|
| `utmContent`  | Ad creative variant        | `ad-v1`, `banner-blue`, `cta-book-now`  |

### Pass UTM Data from Your Website

Capture UTM parameters from the URL query string when a visitor lands on your website, and include them when submitting leads via the API.

```javascript
// JavaScript: Extract UTM from URL
function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    utmContent: params.get("utm_content") || undefined
  };
}

// Include in lead creation
const utmData = getUtmParams();
const leadPayload = {
  firstName: "Jane",
  lastName: "Smith",
  phoneNumber: "555-123-4567",
  referralSourceId: "REFERRAL_UUID",
  ...utmData
};
```

---

## Rate Limit Management

### Implement Client-Side Throttling

Do not rely solely on 429 responses. Proactively throttle your requests.

```python
import time
from collections import deque

class RateLimiter:
    def __init__(self, max_requests_per_second=5):
        self.max_rps = max_requests_per_second
        self.timestamps = deque()

    def wait_if_needed(self):
        now = time.time()

        # Remove timestamps older than 1 second
        while self.timestamps and now - self.timestamps[0] > 1.0:
            self.timestamps.popleft()

        # If at limit, wait
        if len(self.timestamps) >= self.max_rps:
            sleep_time = 1.0 - (now - self.timestamps[0])
            if sleep_time > 0:
                time.sleep(sleep_time)

        self.timestamps.append(time.time())

limiter = RateLimiter(max_requests_per_second=5)

def api_get(url, api_key):
    limiter.wait_if_needed()
    return requests.get(url, headers={"x-api-key": api_key})
```

### Batch Operations Thoughtfully

When performing bulk operations (e.g., syncing hundreds of records), add deliberate delays:

- Between paginated page requests: 200-500ms
- Between individual create/update operations: 100-300ms
- After receiving a 429: exponential backoff starting at 1 second

---

## Request Optimization

### Use Include Parameters Selectively

The opportunity detail endpoint supports many `Include*` parameters. Only request what you need to reduce response size and server load.

```bash
# Only need payments and trip info? Don't include everything else.
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/opportunities/OPP_UUID?IncludePayments=true&IncludeTripInfo=true"
```

### Use PATCH Instead of PUT When Possible

For opportunities and leads that support PATCH, only send the fields that changed rather than the full object.

```bash
# Instead of PUT with all fields, use PATCH with only what changed
curl -X PATCH \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"depositAmount": 250.00}' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID
```

### Parallelize Independent Requests

When loading reference data, all endpoints are independent and can be called in parallel.

```python
import concurrent.futures

endpoints = [
    "branches", "move-sizes", "referral-sources",
    "service-types", "tariffs", "users",
    "arrival-windows", "bad-lead-reasons",
    "cancellation-reasons", "lost-reasons"
]

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    futures = {
        executor.submit(api_get, f"https://api-public.smartmoving.com/v1/api/{ep}", api_key): ep
        for ep in endpoints
    }
    reference_data = {}
    for future in concurrent.futures.as_completed(futures):
        endpoint = futures[future]
        reference_data[endpoint] = future.result().json()
```

---

## Inventory Management Tips

### Set Calculation Mode Deliberately

When adding the first inventory item, use `changeVolumeWeightCalculationMode: true` to switch from MoveSize-based calculation to Inventory-based calculation. This ensures volume/weight are computed from the actual inventory rather than a default move size estimate.

### Use Master Inventory Items When Possible

Prefer `masterItemId` over custom `name` entries. Master items have pre-configured volume and weight data, ensuring more accurate estimates.

### Review Before Submission

Always get the current inventory (`GET /inventory`) and review it before calling the submit endpoint. Submission may trigger review workflows in SmartMoving.

### Handle Lock Status

Check the `lockStatus` field on the inventory response. If the inventory is locked, you may not be able to add, update, or remove items. Check the `allowInventoryUpdates` field on the opportunity.

---

## Communication Logging Tips

### Always Include Timestamps

Both call and note logging require precise timestamps. Use the actual time of the communication, not the time of the API call.

### Use Descriptive Outcomes

When logging calls, always include an `outcome` value. This data feeds into SmartMoving's reporting and analytics.

### Respect Character Limits

- Call descriptions: max 1000 characters
- Notes: max 4000 characters
- Follow-up titles: max 100 characters

Truncate gracefully rather than letting the API return validation errors.

### Associate with the Correct User

When possible, set `createdBy` to the actual user (salesperson) who made the call or wrote the note. This maintains accurate attribution in SmartMoving's UI and reports.

---

## Security Considerations

### Guard CLI Writes

The `smartmoving` CLI is read-only by default. Non-destructive write commands must be explicitly enabled and should be dry-run first:

```bash
smartmoving leads create --input lead.json --json
SMARTMOVING_ALLOW_WRITES=true smartmoving leads create --input lead.json --dry-run --json
SMARTMOVING_ALLOW_WRITES=true smartmoving leads create --input lead.json --yes --json
smartmoving --allow-writes leads create --input lead.json --dry-run --json
```

Best practices for CLI writes:

- Keep `SMARTMOVING_ALLOW_WRITES=false` by default in shells and agent configs.
- Use `--input <file.json>` or `--input -`; never pass API keys or sensitive customer data as command arguments.
- Run `--dry-run` before the real command and inspect the method, path, and request body.
- Use synthetic/fake data in tests. The default test suite uses mocked HTTP servers and must not create live CRM records.
- JSON mode never prompts; real writes require `--yes` after reviewing the dry-run. Without `--yes`, enabled write commands still return dry-run output.
- Destructive CLI commands are not exposed. Destructive MCP tools require both `SMARTMOVING_ALLOW_WRITES=true` and `SMARTMOVING_ALLOW_DESTRUCTIVE=true`.

### Never Log API Keys

Ensure your logging framework redacts the `x-api-key` header and `api-key` query parameter from logs.

```python
import logging

def redact_api_key(text):
    """Redact API key from log output."""
    import re
    text = re.sub(r'x-api-key:\s*\S+', 'x-api-key: [REDACTED]', text)
    text = re.sub(r'api-key=\S+', 'api-key=[REDACTED]', text)
    return text
```

### Validate Input Before Sending

Validate all user input (names, phone numbers, emails, addresses) before sending to the API. This prevents unnecessary error responses and protects data quality.

### Use Environment Variables for Configuration

```bash
# .env file (never commit this)
SMARTMOVING_API_KEY=your-api-key-here
SMARTMOVING_BASE_URL=https://api-public.smartmoving.com/v1
```

```python
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.environ["SMARTMOVING_API_KEY"]
BASE_URL = os.environ["SMARTMOVING_BASE_URL"]
```

---

## Testing and Debugging

### Verify Connectivity First

Always start by hitting the ping endpoint to confirm your API key and network connectivity are working.

```bash
curl -v -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/ping
```

### Use Verbose Mode for Debugging

When debugging issues, use `curl -v` to see the full request and response headers.

### Validate Request Bodies

Before sending complex request bodies, validate them against the expected schema. Common issues include:
- Missing required fields
- Wrong data types (string instead of integer for enums)
- Wrong date format (see [Date Format Handling](#date-format-handling))
- Invalid UUID format for ID fields

### Test with Minimal Payloads

When creating resources, start with the minimum required fields to isolate issues. Add optional fields incrementally.

```bash
# Minimal lead creation -- start here
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "referralSourceId": "REFERRAL_UUID"
  }' \
  https://api-public.smartmoving.com/v1/api/premium/leads

# Then add more fields once this works
```

### Check the Audit Trail

After creating or modifying an opportunity, check its audit trail to verify your changes were recorded correctly.

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/opportunities/OPP_UUID/audit-activity
```
