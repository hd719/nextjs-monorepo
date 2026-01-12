# Go Barcode Lookup Service - Ticket Backlog

Source PRD: apps/healthmetrics/docs/prds/barcode/PRD_GO_BARCODE_LOOKUP_SERVICE.md

## Epic 0: Planning and Contract

### Story 0.1: Confirm data contract
- Task: Align response fields with existing FoodItem schema (per-100g values).
  - Subtask: Document canonical units for each nutrient.
  - Subtask: Decide rounding rules and precision for numeric fields.
- Task: Confirm request and response headers.
  - Subtask: Define Content-Type for success and error responses.
  - Subtask: Decide if X-Request-Id is required in all responses.
- Task: Confirm error codes and mapping to HTTP status.
  - Subtask: List all error codes and when each is used.
  - Subtask: Document client expectations for error handling.

## Epic 1: Service Skeleton and Config

### Story 1.1: Project structure
- Task: Choose entrypoint location (root main.go or cmd/api/main.go).
  - Subtask: Decide folder layout for internal packages (db, http, upstream).
  - Subtask: Add minimal README with run instructions.

### Story 1.2: Config loading
- Task: Define config struct for env vars.
  - Subtask: Add defaults for TTL, timeouts, and log level.
  - Subtask: Validate required vars and fail fast on missing values.
  - Subtask: Print a safe startup summary (no secrets).

### Story 1.3: Graceful startup and shutdown
- Task: Wire HTTP server with proper startup logs.
  - Subtask: Handle SIGINT/SIGTERM and graceful shutdown.
  - Subtask: Ensure in-flight requests complete or time out.

## Epic 2: HTTP Routing and Response Shapes

### Story 2.1: Router setup
- Task: Define route group for /v1.
  - Subtask: Register GET /v1/barcodes/{code}.
  - Subtask: Add optional POST /v1/barcodes/lookup placeholder.

### Story 2.2: Response and error envelopes
- Task: Create response DTOs for barcode lookup.
  - Subtask: Include servingSize and servingSizeG for UI defaults.
  - Subtask: Ensure nutrient fields are per-100g values.
- Task: Create error response envelope.
  - Subtask: Ensure error code, message, and requestId are always present.
  - Subtask: Add a helper to write error responses consistently.

### Story 2.3: Request ID handling
- Task: Generate request ID if missing.
  - Subtask: Accept X-Request-Id from caller if present.
  - Subtask: Attach requestId to response header and error body.

## Epic 3: Validation

### Story 3.1: Barcode format validation
- Task: Validate barcode digits only.
  - Subtask: Reject empty strings or non-digit characters.
  - Subtask: Enforce length between 8 and 14.

### Story 3.2: Barcode checksum validation
- Task: Implement checksum validation for EAN-13 and UPC-A.
  - Subtask: Identify which formats are supported by length.
  - Subtask: Add validation rules per format.
  - Subtask: Return INVALID_BARCODE on checksum failures.

## Epic 4: Database Integration

### Story 4.1: DB connection
- Task: Initialize Postgres connection pool.
  - Subtask: Validate DATABASE_URL on startup.
  - Subtask: Configure max connections and timeouts.

### Story 4.2: Query by barcode
- Task: Fetch FoodItem row by barcode.
  - Subtask: Map DB fields to response DTO.
  - Subtask: Handle barcode not found.

### Story 4.3: TTL and staleness
- Task: Compute cache freshness from updated_at and TTL.
  - Subtask: Define stale vs fresh conditions.
  - Subtask: Record cache hit and miss for logs/metrics.

### Story 4.4: Upsert behavior
- Task: Upsert by barcode on stale or missing records.
  - Subtask: Update updated_at on refresh.
  - Subtask: Preserve source and source_id rules.

### Story 4.5: Raw JSON storage (optional)
- Task: Store raw upstream JSON for debugging.
  - Subtask: Decide if raw_json is stored in a separate table or column.
  - Subtask: Ensure storage is safe and size-bounded.

## Epic 5: Upstream Client (OpenFoodFacts)

### Story 5.1: HTTP client setup
- Task: Create HTTP client with base URL and timeout.
  - Subtask: Configure base URL from env.
  - Subtask: Add user-agent header for upstream requests.

### Story 5.2: Response parsing
- Task: Parse upstream response into internal struct.
  - Subtask: Detect not-found conditions from status/body.
  - Subtask: Capture image URL, brand, serving size, nutrients.

### Story 5.3: Normalization
- Task: Normalize upstream values to per-100g.
  - Subtask: Convert per-serving to per-100g when needed.
  - Subtask: Handle missing values gracefully.

### Story 5.4: Retry and backoff
- Task: Implement retry for timeout and 5xx errors.
  - Subtask: Use exponential backoff with max attempts.
  - Subtask: Stop retrying for 404 or invalid responses.

## Epic 6: End-to-End Lookup Flow

### Story 6.1: Handler flow
- Task: Implement GET /v1/barcodes/{code} flow.
  - Subtask: Validate barcode.
  - Subtask: Check DB cache and freshness.
  - Subtask: Call upstream if stale or missing.
  - Subtask: Upsert and return normalized response.

### Story 6.2: Error mapping
- Task: Map errors to HTTP status and error codes.
  - Subtask: INVALID_BARCODE -> 400.
  - Subtask: NOT_FOUND -> 404.
  - Subtask: UPSTREAM_ERROR -> 502.
  - Subtask: INTERNAL_ERROR -> 500.

## Epic 7: Observability

### Story 7.1: Logging
- Task: Add structured request logs.
  - Subtask: Include requestId, barcode, status, duration.
  - Subtask: Log upstream errors with status and short body snippet.

### Story 7.2: Metrics (optional)
- Task: Add counters for cache hit, miss, and upstream error.
  - Subtask: Measure upstream latency.
  - Subtask: Track error rates by status code.

## Epic 8: Security and Access

### Story 8.1: Internal auth passthrough
- Task: Accept user JWT forwarded by TS server.
  - Subtask: Define header name and format.
  - Subtask: Log presence of auth header for auditing.

### Story 8.2: Public exposure guardrails (if exposed)
- Task: Add auth validation middleware.
  - Subtask: Define required scopes/roles.
  - Subtask: Add rate limiting for public access.

## Epic 9: Testing

### Story 9.1: Unit tests
- Task: Test barcode format validation.
  - Subtask: Digits only and length boundaries.
  - Subtask: Checksum pass and fail cases.
- Task: Test normalization logic.
  - Subtask: Per-serving to per-100g conversion.
  - Subtask: Missing field handling.

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
- Task: Add run instructions and example curl requests.
  - Subtask: Document required env vars and defaults.
  - Subtask: Add sample response and error examples.

### Story 10.2: Deployment notes
- Task: Add deployment checklist.
  - Subtask: Health check endpoints and readiness.
  - Subtask: Required secrets and config.
