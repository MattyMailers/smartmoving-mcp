# SmartMoving API Authentication

[Back to Overview](./README.md)

---

## Table of Contents

- [Overview](#overview)
- [Obtaining an API Key](#obtaining-an-api-key)
- [Authentication Methods](#authentication-methods)
  - [Header Authentication (Recommended)](#header-authentication-recommended)
  - [Query Parameter Authentication](#query-parameter-authentication)
- [API Tiers](#api-tiers)
  - [Basic Tier](#basic-tier)
  - [Premium Tier](#premium-tier)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The SmartMoving External API uses API key authentication. Every request must include a valid API key. The key determines both your identity and your access tier (Basic or Premium).

No OAuth flows, tokens, or session management are required. The API key is a persistent credential that does not expire unless revoked.

---

## Obtaining an API Key

API keys are provisioned through the SmartMoving platform. Contact your SmartMoving account representative or access the integrations settings within the SmartMoving web application to generate or retrieve your API key.

Each API key is:
- Bound to a specific SmartMoving account (company)
- Assigned a tier (Basic or Premium)
- Usable for all endpoints within that tier

---

## Authentication Methods

### Header Authentication (Recommended)

Pass the API key in the `x-api-key` HTTP header. This is the recommended approach because it keeps the key out of URLs, server logs, and browser history.

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/ping
```

**Header name:** `x-api-key`
**Header value:** Your API key string

#### Examples with Various HTTP Methods

**GET request:**

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api-public.smartmoving.com/v1/api/customers?Page=1&PageSize=25"
```

**POST request:**

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "phoneNumber": "555-000-1234"}' \
  https://api-public.smartmoving.com/v1/api/premium/customers
```

**PUT request:**

```bash
curl -X PUT \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe Updated"}' \
  https://api-public.smartmoving.com/v1/api/premium/customers/CUSTOMER_UUID
```

**PATCH request:**

```bash
curl -X PATCH \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"salesPersonId": "SALESPERSON_UUID"}' \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPPORTUNITY_UUID
```

**DELETE request:**

```bash
curl -X DELETE \
  -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/premium/opportunities/OPP_UUID/jobs/JOB_UUID
```

### Query Parameter Authentication

Alternatively, pass the API key as a query parameter. This method is useful for quick testing or environments where setting custom headers is difficult, but is **not recommended for production** due to the key appearing in URLs and potentially in logs.

```bash
curl "https://api-public.smartmoving.com/v1/api/ping?api-key=YOUR_API_KEY"
```

**Parameter name:** `api-key`
**Parameter value:** Your API key string

When combining with other query parameters:

```bash
curl "https://api-public.smartmoving.com/v1/api/customers?api-key=YOUR_API_KEY&Page=1&PageSize=25"
```

### Choosing a Method

| Method           | Recommended | Pros                           | Cons                              |
|------------------|-------------|--------------------------------|-----------------------------------|
| `x-api-key` header | Yes       | Secure, not logged in URLs     | Requires custom header support    |
| `api-key` query param | No    | Simple, works everywhere       | Appears in URLs and server logs   |

If both are provided simultaneously, the header value takes precedence.

---

## API Tiers

### Basic Tier

The Basic tier provides read-only access to core entities and all reference data. Basic tier endpoints use the `/api/` prefix (without `premium`).

**Available endpoints (Basic):**

| Domain          | Endpoints                                                                   |
|-----------------|-----------------------------------------------------------------------------|
| Health          | `GET /api/ping`                                                             |
| Customers       | `GET /api/customers`, `GET /api/customers/{id}`, `GET /api/customers/{id}/opportunities`, `GET /api/customers/{id}/storage-accounts` |
| Leads           | `GET /api/leads`, `GET /api/leads/{id}`, `GET /api/leads/statuses`          |
| Opportunities   | `GET /api/opportunities/{id}`, `GET /api/opportunities/quote/{quoteNumber}`, `GET /api/opportunities/{id}/audit-activity`, `GET /api/opportunities/{id}/jobs`, `GET /api/payments/opportunities/{id}` |
| Reference Data  | `GET /api/branches`, `GET /api/move-sizes`, `GET /api/referral-sources`, `GET /api/service-types`, `GET /api/tariffs`, `GET /api/users`, `GET /api/arrival-windows`, `GET /api/bad-lead-reasons`, `GET /api/cancellation-reasons`, `GET /api/lost-reasons` |

### Premium Tier

The Premium tier includes everything in Basic, plus full CRUD operations. Premium-only endpoints use the `/api/premium/` prefix.

**Additional endpoints (Premium only):**

| Domain          | Operations                                                                  |
|-----------------|-----------------------------------------------------------------------------|
| Customers       | Create, update, search                                                      |
| Leads           | Create, full update, partial update, get by salesperson, convert to opportunity |
| Opportunities   | Create, update, manage documents, inventory, attachments, rooms             |
| Jobs            | Create, delete, confirm, update notes, manage stops, add materials          |
| Communication   | Log calls, log notes                                                        |
| Follow-ups      | Full CRUD, mark complete                                                    |
| Payments        | Storage account payments                                                    |
| Inventory       | Master inventory list, room types, tariff materials                         |

**Access control:** If a Basic-tier key attempts to access a Premium endpoint, the API returns a `403 Forbidden` response.

---

## Security Best Practices

For MCP/CLI usage, keep the key in `SMARTMOVING_API_KEY` and start in read-only mode. See [`SAFETY-PROFILES.md`](./SAFETY-PROFILES.md) for read-only, dry-run, guarded-write, and destructive-operation profiles. The CLI config created by `smartmoving init` stores only the API-key environment variable name, not the raw key value.

1. **Use header authentication in production.** Never include API keys in URLs for production systems.

2. **Store keys securely.** Use environment variables, secrets managers (e.g., AWS Secrets Manager, Azure Key Vault, HashiCorp Vault), or encrypted configuration files. Never hard-code keys in source code.

   ```bash
   # Store in environment variable
   export SMARTMOVING_API_KEY="your-api-key-here"

   # Use in requests
   curl -H "x-api-key: $SMARTMOVING_API_KEY" \
     https://api-public.smartmoving.com/v1/api/ping
   ```

3. **Do not commit keys to version control.** Add configuration files containing keys to `.gitignore`.

4. **Rotate keys periodically.** Contact SmartMoving support to rotate your API key if you suspect it has been compromised.

5. **Use HTTPS only.** The API base URL enforces HTTPS. Never attempt to use HTTP.

6. **Limit key distribution.** Share the API key only with systems and team members that need it.

7. **Monitor usage.** Regularly review your API usage for unexpected patterns that could indicate key compromise.

---

## Troubleshooting

### 401 Unauthorized

**Cause:** The API key is missing, malformed, or invalid.

**Solutions:**
- Verify the API key is included in the `x-api-key` header or `api-key` query parameter.
- Check for trailing whitespace or invisible characters in the key.
- Confirm the key has not been revoked.

```bash
# Test with verbose output to verify headers are sent
curl -v -H "x-api-key: YOUR_API_KEY" \
  https://api-public.smartmoving.com/v1/api/ping
```

### 403 Forbidden

**Cause:** The API key is valid but does not have access to the requested resource.

**Solutions:**
- Verify you are using the correct tier. Basic keys cannot access `/api/premium/` endpoints.
- Contact SmartMoving to upgrade your tier if needed.

### Common Mistakes

| Issue                                    | Fix                                                      |
|------------------------------------------|----------------------------------------------------------|
| Using `Authorization: Bearer` header     | Use `x-api-key` header instead                           |
| Using `apiKey` or `apikey` as header     | The correct header name is `x-api-key` (with hyphens)    |
| Using `api_key` as query param           | The correct parameter name is `api-key` (with a hyphen)  |
| Missing `Content-Type` header on POST/PUT| Add `Content-Type: application/json` for request bodies  |
| Using HTTP instead of HTTPS              | Always use `https://` in the base URL                    |
