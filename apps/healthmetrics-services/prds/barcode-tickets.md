# Go Barcode Lookup Service - Ticket Backlog

Source PRD: apps/healthmetrics/docs/prds/barcode/PRD_GO_BARCODE_LOOKUP_SERVICE.md

Legend: [x] done, [~] partial, [ ] pending

## Epic 0: Planning and Contract

### Story 0.1: Confirm data contract

- [~] Task: Align response fields with existing FoodItem schema (per-100g values).
  - [~] Subtask: Document canonical units for each nutrient (sodium currently returned as `sodium_g`; confirm contract).
  - [x] Subtask: Decide rounding rules and precision for numeric fields (handled on FE).
  - [x] Subtask: Add missing fields to response (`servingSizeG`) or handle on FE (handled on FE).
- [~] Task: Confirm request and response headers.
  - [x] Subtask: Define Content-Type for success and error responses (Gin sets JSON Content-Type by default).
  - [x] Subtask: Echo `X-Request-ID` from TS server (do not generate new IDs).
- [~] Task: Confirm error codes and mapping to HTTP status.
  - [x] Subtask: INVALID_BARCODE -> 400, NOT_FOUND -> 404, UPSTREAM_ERROR -> 502.
  - [x] Subtask: Define INTERNAL_ERROR mapping and when it is returned.
  - [x] Subtask: Ensure `X-Request-ID` is echoed in the response header (header-only).
  - [ ] Subtask: Document client expectations for error handling.

## Epic 1: Service Skeleton and Config

### Story 1.1: Project structure

- [~] Task: Choose entrypoint location (root main.go or cmd/api/main.go).
  - [x] Subtask: Entry point uses root `main.go`.
  - [x] Subtask: Internal packages started (`ratelimiter`, `internal/barcode`, `internal/auth`).
  - [ ] Subtask: Add minimal README with run instructions.

### Story 1.2: Config loading

- [~] Task: Define config struct for env vars.
  - [~] Subtask: Add defaults for TTL, timeouts, and log level (rate limit defaults added).
  - [x] Subtask: Validate required vars and fail fast on missing values.
  - [x] Subtask: Print a safe startup summary (no secrets).

### Story 1.3: Graceful startup and shutdown

- [x] Task: Wire HTTP server with proper startup logs.
  - [x] Subtask: Handle SIGINT/SIGTERM and graceful shutdown.
  - [x] Subtask: Ensure in-flight requests complete or time out.

## Epic 2: HTTP Routing and Response Shapes

### Story 2.1: Router setup

- [~] Task: Define route group for /v1.
  - [x] Subtask: Register GET /v1/barcodes/{code}.
  - [ ] Subtask: Add optional POST /v1/barcodes/lookup placeholder (deferred).
  - [x] Subtask: Align router choice with PRD (keep gin).

### Story 2.2: Response and error envelopes

- [~] Task: Create response DTOs for barcode lookup.
  - [x] Subtask: Include `servingSize` for UI defaults.
  - [x] Subtask: Add `servingSizeG` if parsing is implemented (handled on FE).
  - [x] Subtask: Ensure nutrient fields are per-100g values.
- [~] Task: Create error response envelope.
  - [x] Subtask: Ensure error code and message are present.
  - [x] Subtask: Use header-only request ID (`X-Request-ID`).
  - [x] Subtask: Add a helper to write error responses consistently.

### Story 2.3: Request ID handling

- [x] Task: Require request ID from caller and echo it.
  - [x] Subtask: Accept X-Request-Id from caller if present.
  - [x] Subtask: Attach requestId to response header (echo only, no generation per PRD).

## Epic 3: Validation

### Story 3.1: Barcode format validation

- [x] Task: Validate barcode digits only.
  - [x] Subtask: Reject empty strings or non-digit characters.
  - [x] Subtask: Enforce length between 8 and 14.

### Story 3.2: Barcode checksum validation

- [x] Task: Implement checksum validation for EAN-13 and UPC-A.
  - [x] Subtask: Identify which formats are supported by length.
  - [x] Subtask: Add validation rules per format.
  - [x] Subtask: Return INVALID_BARCODE on checksum failures.

## Epic 4: Database Integration

### Story 4.1: DB connection

- [x] Task: Initialize Postgres connection pool.
  - [x] Subtask: Validate DATABASE_URL on startup.
  - [x] Subtask: Configure max connections and timeouts.

### Story 4.2: Query by barcode

- [x] Task: Fetch FoodItem row by barcode.
  - [x] Subtask: Map DB fields to response DTO.
  - [x] Subtask: Handle barcode not found.

### Story 4.3: TTL and staleness

- [~] Task: Compute cache freshness from updated_at and TTL.
  - [x] Subtask: Define stale vs fresh conditions.
  - [ ] Subtask: Record cache hit and miss for logs/metrics.
  - [ ] Subtask: Log cache hit/miss with requestId + barcode.

### Story 4.4: Upsert behavior

- [x] Task: Upsert by barcode on stale or missing records.
  - [x] Subtask: Update updated_at on refresh.
  - [x] Subtask: Preserve source and source_id rules.

### Story 4.5: Raw JSON storage (optional)

- Task: Store raw upstream JSON for debugging.
  - Subtask: Decide if raw_json is stored in a separate table or column.
  - Subtask: Ensure storage is safe and size-bounded.

## Epic 5: Upstream Client (OpenFoodFacts)

### Story 5.1: HTTP client setup

- [~] Task: Create HTTP client with base URL and timeout.
  - [x] Subtask: Create OpenFoodFacts client.
  - [~] Subtask: Configure base URL from env (library supports sandbox vs live).
  - [x] Subtask: Add timeout and user-agent header for upstream requests.
  - [ ] Subtask: Add custom HTTP client to support arbitrary base URL (beyond .net sandbox).

### Story 5.2: Response parsing

- [~] Task: Parse upstream response into internal struct.
  - [x] Subtask: Detect not-found conditions via ErrNoProduct.
  - [x] Subtask: Capture image URL, brand, serving size, nutrients.
  - [ ] Subtask: Handle OpenFoodFacts JSON type mismatches (e.g., `max_imgid` number vs string) that cause unmarshal errors → 502.

### Story 5.3: Normalization

- [~] Task: Normalize upstream values to per-100g.
  - [x] Subtask: Use per-100g fields from OpenFoodFacts.
  - [x] Subtask: Convert per-serving to per-100g when needed (handled on FE).
  - [x] Subtask: Handle missing values gracefully (optional nutrients nullable; FE shows N/A).

### Story 5.4: Retry and backoff

- [x] Task: Implement retry for timeout and 5xx errors.
  - [x] Subtask: Use exponential backoff with max attempts.
  - [x] Subtask: Stop retrying for 404 or invalid responses.

## Epic 6: End-to-End Lookup Flow

### Story 6.1: Handler flow

- [~] Task: Implement GET /v1/barcodes/{code} flow.
  - [x] Subtask: Validate barcode.
  - [x] Subtask: Check DB cache and freshness.
  - [x] Subtask: Call upstream if missing.
  - [x] Subtask: Upsert and return normalized response.

### Story 6.2: Error mapping

- [~] Task: Map errors to HTTP status and error codes.
  - [x] Subtask: INVALID_BARCODE -> 400.
  - [x] Subtask: NOT_FOUND -> 404.
  - [x] Subtask: UPSTREAM_ERROR -> 502.
  - [x] Subtask: INTERNAL_ERROR -> 500.

## Epic 7: Observability

### Story 7.1: Logging

- [~] Task: Add structured request logs.
  - [x] Subtask: Basic request logs via Gin default logger (PRD references chi).
  - [x] Subtask: Include requestId, barcode, status, duration.
  - [ ] Subtask: Log upstream errors with status and short body snippet (requires custom client).
  - [x] Subtask: Log upstream error type (timeout vs parse vs other).

### Story 7.2: Metrics (optional)

- Task: Add counters for cache hit, miss, and upstream error.
  - Subtask: Measure upstream latency.
  - Subtask: Track error rates by status code.

## Epic 8: Security and Access

### Story 8.1: Internal auth passthrough

- [~] Task: Accept user JWT forwarded by TS server.
  - [x] Subtask: Validate `X-API-Key` against `BARCODE_SERVICE_API_KEY`.
  - [x] Subtask: Validate session token from `Cookie` against DB.
  - [x] Subtask: Read `X-User-ID` for auditing/logging.
  - [x] Subtask: Read `X-Request-ID` for auditing/logging.

### Story 8.2: Public exposure guardrails (if exposed)

- [ ] Task: Add auth validation middleware.
  - [ ] Subtask: Define required scopes/roles.
  - [ ] Subtask: Add rate limiting for public access.

### Story 8.3: Rate limiting (internal)

- [~] Task: Create reusable rate limiter package.
  - [x] Subtask: Implement token bucket in `ratelimiter` package.
  - [x] Subtask: Add concurrency safety (mutex/atomic).
  - [x] Subtask: Wire rate limiter middleware into API.
  - [x] Subtask: Key by `X-User-ID` (per PRD) and define limits.
  - [x] Subtask: Add TTL cleanup for inactive user buckets.
  - [x] Subtask: Make limits configurable via env.
  - [ ] Subtask: Compute dynamic `Retry-After` (e.g., expose `NextAllowedIn()` on bucket) (deferred).

## Epic 9: Testing

### Story 9.1: Unit tests

- [x] Task: Test barcode format validation.
  - [x] Subtask: Digits only and length boundaries.
  - [x] Subtask: Checksum pass and fail cases.
- [~] Task: Test normalization logic.
  - [x] Subtask: Per-serving to per-100g conversion (handled on FE).
  - [x] Subtask: Missing field handling.
- [~] Task: Test rate limiter package.
  - [x] Subtask: Unit tests for Allow/AllowN and refill behavior.
  - [x] Subtask: Concurrency test for Allow under parallel requests.

### Story 9.2: Integration tests

- Task: Mock upstream responses.
  - Subtask: Success response with full data.
  - Subtask: Not found response.
  - Subtask: Timeout and 5xx response.
- Task: DB cache behavior.
  - Subtask: Cache hit returns without upstream.
  - Subtask: Stale record triggers refresh and upsert.

## Epic 10: Documentation and Ops

### Story 10.1: Service docs

- [ ] Task: Add run instructions and example curl requests.
  - [ ] Subtask: Document required env vars and defaults.
  - [ ] Subtask: Add sample response and error examples.

### Story 10.2: Deployment notes

- Task: Add deployment checklist.
  - Subtask: Health check endpoints and readiness.
  - Subtask: Required secrets and config.
