# Healthmetrics Services (Go)

Go microservice for barcode lookup and caching. This service is called by the
Healthmetrics TS server function, not directly by browsers.

## Features

- `GET /v1/barcodes/:code` with validation and checksum enforcement
- Cache-first lookup using Postgres (`food_items`)
- OpenFoodFacts fetch with retry + backoff
- Service-to-service auth + session validation
- Per-user rate limiting
- Request logging with request ID, barcode, status, duration

## Requirements

- Go 1.25.3 (see `apps/healthmetrics-services/go.mod`)
- Postgres database (shared with Healthmetrics app)
- Healthmetrics TS server function configured to call this service

## Environment

Required:

- `BARCODE_SERVICE_API_KEY` (shared secret with TS server)
- `BETTER_AUTH_COOKIE_NAME` (session cookie name)
- `DATABASE_URL` (Postgres connection string)

OpenFoodFacts:

- `OPENFOODFACTS_TIMEOUT` (default `5s`)
- `OPENFOODFACTS_USER_AGENT` (optional)
- `OPENFOODFACTS_BASE_URL` (optional; `.net` enables sandbox)
- `OPENFOODFACTS_RETRY_MAX_ATTEMPTS` (default 3)
- `OPENFOODFACTS_RETRY_BASE_DELAY` (default `200ms`)
- `OPENFOODFACTS_RETRY_MAX_DELAY` (default `2s`)

Caching:

- `BARCODE_CACHE_TTL_DAYS` (default 7)

Rate limiting:

- `RATE_LIMIT_CAPACITY` (default 10)
- `RATE_LIMIT_REFILL_RATE` (default 1 token/sec)

Logging:

- `LOG_LEVEL` (default `info`)

Example `.env`:

```
BARCODE_SERVICE_API_KEY=replace_me
BETTER_AUTH_COOKIE_NAME=better-auth.session_token
DATABASE_URL=postgresql://user:pass@host:5432/db

OPENFOODFACTS_TIMEOUT=5s
OPENFOODFACTS_USER_AGENT=
OPENFOODFACTS_BASE_URL=
OPENFOODFACTS_RETRY_MAX_ATTEMPTS=3
OPENFOODFACTS_RETRY_BASE_DELAY=200ms
OPENFOODFACTS_RETRY_MAX_DELAY=2s

BARCODE_CACHE_TTL_DAYS=7

RATE_LIMIT_CAPACITY=10
RATE_LIMIT_REFILL_RATE=1

LOG_LEVEL=info
```

## Database Setup

This service writes to `food_items` in the existing Healthmetrics database.
Ensure these column defaults exist so raw SQL inserts succeed:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE food_items
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE food_items
ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE food_items
ALTER COLUMN updated_at SET DEFAULT now();
```

## Run Locally

From `apps/healthmetrics-services`:

```
./run.sh
```

## Endpoints

`GET /healthz`

`GET /v1/barcodes/:code`

Required headers for `/v1/barcodes/:code`:

- `X-API-Key`
- `X-User-ID`
- `X-Request-ID`
- `Cookie` (Better Auth session token)

Example curl:

```
curl -i \
  -H "Accept: application/json" \
  -H "X-API-Key: $BARCODE_SERVICE_API_KEY" \
  -H "X-User-ID: $USER_ID" \
  -H "X-Request-ID: req_test_1" \
  -H "Cookie: $COOKIE_HEADER" \
  "http://localhost:8080/v1/barcodes/819215021416"
```

## Error Codes

- `INVALID_BARCODE` (400)
- `NOT_FOUND` (404)
- `UPSTREAM_ERROR` (502)
- `INTERNAL_ERROR` (500)
- `UNAUTHORIZED` (401)
- `RATE_LIMITED` (429)

## Testing

Unit tests:

```
go test ./internal/barcode
go test ./ratelimiter
```

Rate limit test script:

1) Fill in `apps/healthmetrics-services/scripts/rate_limit_env.txt`
2) Run:

```
bash apps/healthmetrics-services/scripts/rate_limit_test.sh \
  apps/healthmetrics-services/scripts/rate_limit_env.txt
```

## QA Checklist

Manual QA steps are tracked in:

- `apps/healthmetrics-services/prds/barcode-qa.md`
