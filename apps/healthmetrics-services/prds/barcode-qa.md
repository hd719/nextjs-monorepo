# QA Checklist: Barcode Lookup (UI -> Go Service -> DB)

## Goal

Validate the full barcode lookup flow from the Healthmetrics UI through the Go service and into Postgres.

## Prereqs

- Go service running: `apps/healthmetrics-services/run.sh`
- Healthmetrics app running with the TS server function wired to Go service
- Valid `.env` values for both services (API key, cookie name, DB URL)
- Logged-in user session in the UI

## Test Data

- Known good barcode (OFF hit): `819215021416`
- Not-found candidate (valid checksum, may 404): `4006381333931`
- Invalid checksum (EAN-13): `4006381333930`
- Not-found candidate (9 digits to skip checksum): `123456789`
- Invalid format: `ABC123`

## Checklist

- [x] Flow 1: Happy path scan (UI -> 200)
- [x] Flow 2: Cache hit (repeat scan)
- [x] Flow 3: Cache stale (optional)
- [x] Flow 4: Invalid barcode format (UI -> 400)
- [x] Flow 5: Invalid checksum (UI -> 400)
- [x] Flow 6: Not found (UI -> 404) (validated with `4006381333931`)
- [x] Flow 7: Auth failures (server -> 401)
- [x] Flow 8: Rate limiting (UI -> 429)
- [x] Flow 9: Request ID traceability

## Flow 1: Happy path scan (UI -> 200)

Steps:
- In the UI, scan or enter `819215021416`.
- Confirm the UI shows product details.
- Confirm Go logs include `request_log` with `status=200`.

Expected:
- HTTP 200 with valid JSON payload.
- `X-Request-ID` echoed in response header.
- New row exists in `food_items` with `source=open_food_facts`.

## Flow 2: Cache hit (repeat scan)

Steps:
- Immediately scan the same barcode again in the UI (`819215021416`).
- Optionally check `food_items.updated_at` before/after.

Expected:
- HTTP 200 with same payload.
- `updated_at` does not change (cache hit).

## Flow 3: Cache stale (optional)

Steps:
- Manually set `food_items.updated_at` to an old timestamp:
  - Example (psql): `UPDATE food_items SET updated_at = now() - interval '8 days' WHERE barcode = '819215021416';`
- Scan the same barcode again.

Expected:
- HTTP 200 with payload.
- `updated_at` changes to a recent timestamp (cache refresh).

## Flow 4: Invalid barcode format (UI -> 400)

Steps:
- Enter `ABC123`.

Expected:
- HTTP 400 with `code=INVALID_BARCODE`.
- UI shows error state.

## Flow 5: Invalid checksum (UI -> 400)

Steps:
- Enter `4006381333930`.

Expected:
- HTTP 400 with `code=INVALID_BARCODE`.
- UI shows error state.

## Flow 6: Not found (UI -> 404)

Steps:
- Enter `4006381333931` (valid checksum but currently not found).
- If that returns data, try `123456789` (skips checksum).

Expected:
- HTTP 404 with `code=NOT_FOUND`.
- UI shows “not found” state or equivalent.

## Flow 7: Auth failures (server -> 401)

Steps:
- Temporarily unset `BARCODE_SERVICE_API_KEY` in the TS server env, or remove the header in code.
- Call the UI flow again.

Expected:
- HTTP 401 with `code=UNAUTHORIZED`.
- Go logs show `auth_error` with a reason.

## Flow 8: Rate limiting (UI -> 429)

Steps:
- Trigger the same barcode scan repeatedly (10+ in a short burst).

Expected:
- HTTP 429 with `code=RATE_LIMITED`.
- Response includes `Retry-After` header.

## Flow 9: Request ID traceability

Steps:
- Trigger any barcode scan.
- Compare the request ID in TS logs vs Go logs vs response header.

Expected:
- All three values match.

## Notes

- If the not-found barcode returns data, try a different 9-digit code.
- Integration tests are deferred; this checklist is manual QA only.
