# PRD: Go Barcode Lookup Service

> **Status:** Not Started
> **Priority:** High
> **Effort:** Medium (3-5 days)
> **Dependencies:** OpenFoodFacts API, Postgres, TS server functions

---

## Problem Statement

Barcode-based food logging needs a fast, reliable backend that can normalize
nutrition data and persist it for reuse. The main app is TypeScript-based, but
we want a small Go microservice for learning and to keep external API logic
isolated.

**Goal:** Provide a Go service that accepts a barcode, fetches nutrition data
from OpenFoodFacts (with room for future fallbacks), normalizes the response,
saves it to Postgres, and returns a clean, consistent payload to the frontend.

---

## Goals

### Must Have

- [ ] `GET /v1/barcodes/{code}` endpoint
- [ ] Normalize OpenFoodFacts fields into a stable response
- [ ] Persist results in Postgres for reuse
- [ ] Return `404` when product not found
- [ ] Return `502` when upstream API fails
- [ ] Serve JSON responses with consistent shapes

### Should Have

- [ ] Configurable cache TTL (re-fetch if stale)
- [ ] Optional `POST /v1/barcodes/lookup` for clients that prefer POST
- [ ] Store raw upstream JSON for debugging
- [ ] Basic request logging and structured errors

### Nice to Have

- [ ] Optional fallback to USDA FoodData Central
- [ ] Rate limiting per IP
- [ ] Health check endpoint `/healthz`

### Non-Goals

- Building a full food database
- Barcode generation
- User authentication (handled by the main app)

---

## User Stories

### As a user logging food

- I want to scan a barcode and get nutrition results in under 2 seconds
- I want to see consistent nutrition fields across all products

### As a developer

- I want a single API endpoint that always returns the same shape
- I want cached results so repeat scans are fast
- I want to log raw upstream responses for debugging

---

## Technical Architecture

### Service Stack

| Component | Technology |
|----------|------------|
| HTTP Router | `chi` |
| DB Driver | `pgx` |
| DB | Postgres |
| External API | OpenFoodFacts |

### Integration Flow

```
Client (TS) → Server Function → Go API → OpenFoodFacts
                                 ↓
                              Postgres
```

---

## API Design

### GET /v1/barcodes/{code}

**Contract details:**

- `Content-Type: application/json` for both success and error responses.
- Include `X-Request-Id` response header when available to aid debugging.
- Success responses always use the documented JSON shape; error responses
  always use the shared error envelope so clients can parse predictably.

**Response (200):**

```json
{
  "id": "0123456789012",
  "barcode": "0123456789012",
  "name": "Oat Milk",
  "brand": "Brand Co",
  "servingSize": "240ml",
  "servingSizeG": 240,
  "nutrients": {
    "caloriesKcal": 120,
    "proteinG": 3,
    "carbsG": 16,
    "fatG": 5,
    "fiberG": 2,
    "sugarsG": 7,
    "sodiumG": 90
  },
  "imageUrl": "https://...",
}
```

**Units and normalization:**

- Nutrient values in the API response are **per 100g** to match the existing `FoodItem` schema and diary math in the Healthmetrics app.
- `servingSizeG` and `servingSize` are provided for UI defaults, but any per-serving math should be derived from the per-100g values and a gram quantity.
- If the upstream API only provides per-serving values, convert to per-100g at ingest (using serving size grams when available) before persisting/returning.

**Errors:**

- `404` product not found
- `502` upstream error
- `400` invalid barcode

**Error response shape:**

```json
{
  "error": {
    "code": "INVALID_BARCODE",
    "message": "Barcode must be 8-14 digits",
    "requestId": "req_01HX9V8R2ZB7K8Q4V6J2M3N9P1"
  }
}
```

Error codes to use consistently:

- `INVALID_BARCODE` (400)
- `NOT_FOUND` (404)
- `UPSTREAM_ERROR` (502)
- `INTERNAL_ERROR` (500)

---

## Data Model (Postgres)

Healthmetrics already has a shared nutrition model in
`apps/healthmetrics/prisma/schema.prisma` (`FoodItem` mapped to `food_items`).
This service should align with that schema instead of creating a new table.

Key fields to align with:

- `barcode` (unique)
- `serving_size_g`, `serving_size_unit`
- `calories_per_100g`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g`, `sugar_g`, `sodium_mg`

---

## Caching Strategy

- Use Postgres as the cache source of truth.
- Configurable TTL (default 7 days).
- If `updated_at` is newer than TTL, return cached data without
  calling OpenFoodFacts.
- If a barcode exists but is stale, refresh from upstream and upsert
  the record in-place (same barcode).

---

## Validation Rules

- Barcode must be digits only and 8-14 characters.
- Reject empty or malformed codes with `400`.
- **Frontend** should validate early for fast user feedback (camera/manual entry).
- **Backend** must enforce validation as the source of truth, since clients can be bypassed.
- Validate barcode checksum for EAN/UPC formats where possible; return `400`
  with `INVALID_BARCODE` on checksum failure.

---

## Observability

### Logs

- Request ID, endpoint, barcode, status code, duration
- Upstream errors logged with status and body snippet
- Use Gin's built-in logger/recovery middleware for baseline request logs.
- Add a request ID (from `X-Request-Id` or generated) to correlate upstream and DB actions.

### Metrics (optional)

- Cache hit rate
- Upstream latency
- Error rates by status code

---

## Security

- No PII stored
- Upstream API called server-side only
- Optional IP rate limiting
- Internal-only service behind the TS server; forward the user JWT to the Go
  service for auditing and authorization checks when needed.
- Service should only be reachable server-to-server (private network/service mesh),
  not directly from the browser.
- If the service is ever exposed publicly, add explicit authentication,
  authorization, CORS policy, and stricter rate limiting.

### Public Exposure Checklist (if needed)

- Require auth (JWT or API key) and validate on every request.
- Do not rely on `Origin` or `Referer` headers for security (they can be spoofed).
- Configure CORS only if browsers will call the service directly.
- Add stricter rate limits and abuse detection.
- Enforce TLS and rotate credentials/keys.

### CORS vs Authentication (Reminder)

- CORS is a browser enforcement mechanism; it does not secure your API.
- `Origin`/`Referer` headers are not trustworthy for access control.
- If the service is public, use real auth (JWT/API key) and validate it server-side.

---

## Versioning

- All public routes are versioned under `/v1`.
- Backward-incompatible changes require a new version prefix (e.g. `/v2`).

---

## Config

Required environment variables (names are placeholders, confirm during setup):

- `DATABASE_URL` (Postgres connection string)
- `BARCODE_CACHE_TTL_DAYS` (default 7)
- `OPENFOODFACTS_BASE_URL` (default `https://world.openfoodfacts.org`)
- `OPENFOODFACTS_TIMEOUT_MS` (default 2000)
- `OPENFOODFACTS_RETRY_MAX` (default 2)
- `OPENFOODFACTS_RETRY_BACKOFF_MS` (default 200)
- `LOG_LEVEL` (default `info`)

---

## Upstream Timeouts and Retries (Pseudo-code)

```
function fetchFromOpenFoodFacts(barcode):
  attempts = 0
  maxAttempts = OPENFOODFACTS_RETRY_MAX + 1
  backoff = OPENFOODFACTS_RETRY_BACKOFF_MS

  while attempts < maxAttempts:
    attempts += 1
    response, err = httpGetWithTimeout(OPENFOODFACTS_TIMEOUT_MS)

    if err is timeout or network_error:
      if attempts == maxAttempts:
        return upstream_error(502)
      sleep(backoff)
      backoff = backoff * 2
      continue

    if response.status == 404 or response.body indicates "product not found":
      return not_found(404)

    if response.status >= 500:
      if attempts == maxAttempts:
        return upstream_error(502)
      sleep(backoff)
      backoff = backoff * 2
      continue

    return response.data
```

Surface partial failures as `502` with `UPSTREAM_ERROR` and include `requestId`
in logs and responses. Do not return upstream payloads directly.

---

## Testing (Planned)

- Unit: barcode validation (digits, length)
- Unit: normalization mapping (per-100g conversion, missing fields)
- Integration: mock upstream responses (found, not found, 5xx, timeout)

---

## Rollout Plan

1. Build and deploy Go service in a dev environment.
2. Wire TS server function to call Go API.
3. Add feature flag in the frontend for barcode lookup.
4. Monitor logs and cache hit rate.
5. Roll out to all users.

---

## Open Questions

- Should the service use a separate database or shared cluster?
- Do we need a USDA fallback in v1?
- What TTL is acceptable for cache freshness?
