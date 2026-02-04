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
**Status:** Done ✅
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
**Status:** Done ✅
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
**Status:** Done ✅ (wired to Go sync + last_sync_at updates)
**Goal:** Allow users to trigger sync from UI.

**Scope**
- Button triggers `POST /internal/whoop/sync`.
- Show sync progress + result status.

**Acceptance Criteria**
- Manual sync enqueues job and updates UI state.

---

## WHOOP-11: Disconnect flow
**Status:** Done ✅
**Goal:** Disconnect WHOOP without deleting data.

**Scope**
- FE action calls `POST /internal/whoop/disconnect`.
- Tokens revoked locally (and remote revoke if available).
- Integration marked disconnected.

**Acceptance Criteria**
- User sees disconnected state.
- Historical data remains.

---

## Next Recommended Ticket
**WHOOP-09: Scheduled sync (2x/day)**
Now that OAuth + manual sync + disconnect are done, the next step is to add a cron/scheduler in the Go service and populate the “Next sync” UI field.

---

## WHOOP-12: Observability + metrics
**Status:** Done ✅
**Goal:** Add metrics and structured logs.

**Scope**
- Metrics for sync duration, API errors, refresh failures (in-memory counters + snapshot endpoint).
- Correlation IDs between FE + Go (request IDs logged per handler).
- Persist last sync error on the integration connection for debugging.

**Acceptance Criteria**
- Errors visible in logs with traceable IDs and request IDs.

---

## WHOOP-14: Normalize + map raw WHOOP data
**Status:** Done ✅
**Goal:** Convert raw WHOOP payloads into provider-agnostic tables.

**Scope**
- Normalize sleep/recovery/workout/cycle into `integration_*` tables.
- Preserve provider-specific fields in `extras` (jsonb).
- Mark primary sleep (longest session per local date).

**Acceptance Criteria**
- Normalized rows upserted on sync.
- Primary sleep computed per day.

---

## WHOOP-15: UI surfaces WHOOP metrics
**Status:** Done ✅
**Goal:** Display WHOOP data in UI when connected.

**Scope**
- Sleep page uses WHOOP data when connected (no toggle in v1).
- Dashboard + Progress sleep cards show WHOOP badge and data.
- Fallback to manual sleep when not connected.

**Acceptance Criteria**
- WHOOP data is visible in dashboard/progress/sleep when connected.
- UI shows manual state when disconnected.

---

## WHOOP-16: Exercises page shows wearable workouts
**Status:** Done ✅
**Goal:** Merge manual workouts with wearable workouts in the Exercises UI.

**Scope**
- Fetch manual `workout_sessions` + `integration_workout` for the selected day.
- Display a unified list with a source badge (Manual / WHOOP).
- Keep wearable workouts read‑only and show both sources (no dedupe).

**Acceptance Criteria**
- Exercises page shows both manual + WHOOP workouts for the day.
- WHOOP rows are labeled and read‑only.

---

## WHOOP-13: QA checklist + test fixtures
**Status:** Not started
**Goal:** Add QA scenarios and test scaffolding.

**Scope**
- Manual QA doc updates.
- Mock WHOOP responses for integration tests.

**Acceptance Criteria**
- QA passes for connect/deny/sync/disconnect.
