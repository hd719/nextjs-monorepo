# WHOOP Integration v1 - JIRA Tickets

These tickets break down the WHOOP OAuth + sync integration into implementable tasks.

---

## WHOOP-01: Add feature flag + env config
**Status:** Done ✅
**Goal:** Gate WHOOP integration behind a flag and validate envs.

**Scope**
- Add `FEATURE_WHOOP_INTEGRATION` to env validation.
- Add WHOOP OAuth envs (client id, secret, redirect, base URLs).
- Default disabled in prod until rollout.

**Acceptance Criteria**
- App boots with clear error if required envs are missing.
- Flag disables Integrations UI + routes when off.

**Note**
- Remove feature flag once WHOOP integration is stable in production.

---

## WHOOP-02: Integrations page + WHOOP card UI
**Status:** Done ✅
**Goal:** Add `/integrations` page with WHOOP card.

**Scope**
- New Integrations route in TanStack Start.
- WHOOP card with states: Disconnected / Connected / Error / Syncing.
- Show Last Sync, Next Sync, Sync Now, Disconnect.

**Acceptance Criteria**
- Page renders and state changes match API responses.

---

## WHOOP-03: OAuth start (server action)
**Status:** Done ✅
**Goal:** Start OAuth flow with CSRF state.

**Scope**
- Server action creates `state`, persists with TTL.
- Redirect to WHOOP auth URL with required params.

**Acceptance Criteria**
- State saved and redirect includes correct params.

---

## WHOOP-04: OAuth callback route
**Status:** Done ✅
**Goal:** Handle callback and hand off code to Go service.

**Scope**
- Route: `/integrations/whoop/callback`
- Validate state (one‑time, TTL).
- Forward `code` to Go service exchange endpoint.

**Acceptance Criteria**
- Successful link marks integration connected.
- Invalid/expired state shows error and does not link.

---

## WHOOP-05: DB schema for integrations (generic) (Do first)
**Status:** Done ✅
**Goal:** Add generic integration tables.

**Scope**
- `integration`
- `integration_token`
- `integration_connection`
- `integration_raw_event`
- Constraints (unique per user/provider).

**Acceptance Criteria**
- Prisma migrations apply cleanly.
- One WHOOP account per user enforced.

---

## WHOOP-06: Go service OAuth exchange
**Status:** Done ✅
**Goal:** Exchange auth code for tokens server‑to‑server.

**Scope**
- Endpoint: `POST /internal/whoop/oauth/exchange`
- Calls WHOOP token endpoint with client_secret.
- Stores encrypted tokens + scopes + expiry.
- Marks integration connected.

**Acceptance Criteria**
- Tokens stored securely and refresh token saved.
- Errors logged with correlation IDs.

---

## WHOOP-07: Token encryption
**Status:** Done ✅
**Goal:** Encrypt access/refresh tokens at rest.

**Scope**
- Use AWS KMS (preferred) or app‑level secret.
- Decrypt only inside Go service when needed.

**Acceptance Criteria**
- Tokens never stored plaintext.
- Rotation path documented.

---

## WHOOP-08: Initial sync job (Go)
**Status:** Next ⏭️
**Goal:** Fetch WHOOP profile, sleep, recovery, workout, cycles, body measurements.

**Scope**
- `POST /internal/whoop/sync` triggers job.
- Store raw JSON + normalized tables.
- Persist `last_sync_at` and watermarks.

**Acceptance Criteria**
- All domains ingested.
- No duplicate data on re‑sync.

---

## WHOOP-09: Scheduled sync (2x/day)
**Status:** Not started
**Goal:** Run background sync on schedule.

**Scope**
- Cron in Go service (2x/day, timezone TBD).
- Respect rate limits (100 req/min, 10k/day).
- Populate “Next sync” in UI once scheduler exists (currently leave blank/manual).

**Acceptance Criteria**
- Sync runs on schedule without exceeding limits.
- UI shows the next scheduled sync time after cron is live.

---

## WHOOP-10: Manual “Sync now”
**Status:** Done ✅ (stub sync; data ingestion pending WHOOP-08)
**Goal:** Allow users to trigger sync from UI.

**Scope**
- Button triggers `POST /internal/whoop/sync`.
- Show sync progress + result status.

**Acceptance Criteria**
- Manual sync enqueues job and updates UI state.

---

## WHOOP-11: Disconnect flow
**Status:** Not started
**Goal:** Disconnect WHOOP without deleting data.

**Scope**
- FE action calls `POST /internal/whoop/disconnect`.
- Tokens revoked locally (and remote revoke if available).
- Integration marked disconnected.

**Acceptance Criteria**
- User sees disconnected state.
- Historical data remains.

---

## WHOOP-12: Observability + metrics
**Status:** Not started
**Goal:** Add metrics and structured logs.

**Scope**
- Metrics for sync duration, API errors, refresh failures.
- Correlation IDs between FE + Go.

**Acceptance Criteria**
- Errors visible in logs with traceable IDs.

---

## WHOOP-13: QA checklist + test fixtures
**Status:** Not started
**Goal:** Add QA scenarios and test scaffolding.

**Scope**
- Manual QA doc updates.
- Mock WHOOP responses for integration tests.

**Acceptance Criteria**
- QA passes for connect/deny/sync/disconnect.
