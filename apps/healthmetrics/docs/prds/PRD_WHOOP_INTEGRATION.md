# PRD: WHOOP Integration v1 (OAuth + Data Sync)

## Status
- Stage: Draft (needs final inputs listed in Open Questions)
- Target: v1 account linking + sync

---

## 1) Problem & Goal
Healthmetrics users want WHOOP data inside the app without re-entering it manually. We need a secure account-linking flow (OAuth 2.0), background sync, and a clear UI state for connection management.

### Goals
- Let an already-authenticated user connect WHOOP.
- Sync WHOOP data into Healthmetrics (profile + sleep + recovery + workouts + cycles + body measurement).
- Provide clear connection state, last sync time, and manual "Sync now".

### Non‑Goals (v1)
- "Sign in with WHOOP" (no auth provider login).
- Collecting WHOOP username/password inside Healthmetrics.
- Webhooks (defer to v2 unless requested).

---

## 2) Key Constraints / Guardrails
- OAuth only (no credential collection).
- Client secret must never reach browser.
- Minimize scopes (least privilege) but **v1 uses full available scopes** per user decision.
- Use HTTPS and strict redirect validation.

---

## 3) WHOOP OAuth Facts (Inputs)
- Authorization URL: `https://api.prod.whoop.com/oauth/oauth2/auth`
- Token URL: `https://api.prod.whoop.com/oauth/oauth2/token`
- Scopes available: `read:recovery`, `read:cycles`, `read:workout`, `read:sleep`, `read:profile`, `read:body_measurement`
- Refresh tokens only if `offline` scope is requested
- Rate limits: 100 req/min, 10,000 req/day

---

## 4) Product Requirements (v1)

### 4.1 UX / UI
**Integrations Page**
- Route: `/integrations`
- Show list of integrations (WHOOP only for now).
- WHOOP card states:
  - **Disconnected** → CTA: “Connect WHOOP”
  - **Connecting** → inline spinner
  - **Connected** → shows: `Connected`, `Last Sync`, `Next Sync`, `Sync now`, `Disconnect`
  - **Error** → shows error and “Try again”

**Connection success**
- Show toast: “WHOOP connected successfully”

**Connection denied**
- If WHOOP denies consent or returns error, show friendly error and CTA to retry.

**Disconnect**
- CTA: “Disconnect” → confirmation modal.
- Behavior: revoke tokens locally; keep historical data (per decision).

---

## 5) Architecture Options

### Go service owns OAuth exchange + sync (Recommended)
**Flow**
1) User clicks Connect WHOOP on `/integrations`
2) FE server action creates `state`, stores it, redirects to WHOOP `/auth`
3) WHOOP redirects to `/integrations/whoop/callback?code=...&state=...`
4) FE callback validates `state` then sends `code` to Go service
5) Go exchanges token server-to-server, stores tokens (encrypted), kicks sync

**Pros**
- Clear boundary: Go service is system of record for WHOOP sync
- Centralized rate limiting and data ingestion
- FE remains thin and secure

**Cons**
- Extra hop from FE to Go
- Requires internal auth between FE and Go service

**Decision:** **Option B** (Go owns exchange + sync).

---

## 6) OAuth + Connection Flow (Detailed)

### 6.1 Start Connect
**Endpoint (FE server action):** `POST /integrations/whoop/start`
- Validate user session
- Generate `state` (min 8 chars, crypto‑random)
- Store in DB: `oauth_states` table (user_id, provider, state_hash, expires_at)
- Redirect to WHOOP:
  - `response_type=code`
  - `client_id`
  - `redirect_uri`
  - `scope` (v1 includes all + `offline`)
  - `state`

### 6.2 Callback
**Route:** `/integrations/whoop/callback`
- Validate session (user must be logged in)
- Verify `state`:
  - hash comparison
  - not expired
  - one‑time use (delete after success)
- If invalid → show error state and allow retry

**Call Go service:**
`POST /internal/whoop/oauth/exchange`
```json
{
  "userId": "uuid",
  "code": "auth_code",
  "redirectUri": "https://localhost:3003/integrations/whoop/callback"
}
```
Go service:
- Exchanges token with WHOOP `/token`
- Stores tokens (encrypted)
- Marks integration connected
- Enqueues initial sync

### 6.3 Disconnect
**Endpoint (FE server action):** `POST /integrations/whoop/disconnect`
- Validate session
- Call Go service to revoke local tokens and mark integration disconnected
- Keep historical data (per decision)

**Go service action**
- Delete or mark tokens inactive
- Update `integration` status to `disconnected`
- Optionally call WHOOP revoke endpoint if supported (TBD)

---

## 7) Sync Strategy

### v1 Sync Plan
- **Manual:** “Sync now” button on Integrations page
- **Scheduled:** **2x/day** background sync (final times TBD)
- **Rate limiting:** Honor WHOOP limits (100 req/min, 10k/day) via Go service limiter
- **Refresh tokens:** Use `offline` scope to refresh access tokens when expired

### Sync Behavior
- **Initial sync** on connect:
  - profile
  - sleep
  - recovery
  - workouts
  - cycles
  - body measurements
- **Incremental sync**:
  - Use `last_sync_at` watermark per domain
  - Fetch updates since last sync

---

## 8) Data Model (Proposed)

### 8.1 Generic Integration Tables (recommended for future providers)
**`integration`**
- `id`
- `user_id`
- `provider` (enum: `whoop`, future providers)
- `status` (`connected`, `disconnected`, `error`)
- `last_sync_at`
- `created_at`, `updated_at`

**`integration_token`**
- `id`
- `integration_id`
- `access_token_encrypted`
- `refresh_token_encrypted`
- `expires_at`
- `scopes` (text[])
- `created_at`, `updated_at`

**`integration_connection`**
- `id`
- `integration_id`
- `provider_user_id` (if provided by API)
- `connected_at`
- `last_error`

### 8.2 Generic Raw JSON (recommended)
**`integration_raw_event`**
- `id`
- `integration_id`
- `resource_type` (sleep/recovery/workout/cycle/profile/body_measurement)
- `payload` (jsonb)
- `source_id` (provider object id)
- `created_at`

Retention: **TBD** (recommend 30–90 days).

### 8.3 Provider‑Specific Normalized Tables (WHOOP v1)
**`whoop_sleep`**, **`whoop_recovery`**, **`whoop_workout`**, **`whoop_cycle`**, **`whoop_profile`**, **`whoop_body_measurement`**
- Schema fields mapped from WHOOP API
- Foreign key: `integration_id` (or `user_id` if preferred)
- `source_id` unique per type

**Future providers note**
- This hybrid model keeps shared OAuth/token/raw event data generic while allowing provider‑specific normalized tables.
- It avoids schema churn when adding Garmin/Apple Health/Oura later while preserving efficient queries.

### Constraints
- One WHOOP account per user.
- Unique constraint on `(user_id, provider)` in `integration`
- Unique constraint on `(integration_id, source_id, resource_type)` in raw table

---

## 9) API Design

### FE Routes
- `/integrations` (UI page)
- `/integrations/whoop/callback` (OAuth callback)

### FE Server Actions
- `startWhoopConnect()` → redirect to WHOOP auth
- `disconnectWhoop()` → call Go service to revoke + update status
- `syncWhoopNow()` → call Go service to enqueue sync
- `getWhoopStatus()` → returns connection + last sync

### Go Service Endpoints (internal)
- `POST /internal/whoop/oauth/exchange`
- `POST /internal/whoop/sync`
- `POST /internal/whoop/disconnect`
- `GET /internal/whoop/status`

---

## 10) Security & Compliance

### OAuth Security
- State stored server‑side with TTL (5–10 minutes)
- One‑time use only
- Reject unknown redirect_uri

### Token Storage
- Encrypt tokens at rest (KMS recommended)
- Rotate refresh tokens when WHOOP issues new ones
- Never send tokens to browser

### Privacy
- Show user clearly what access was granted
- Provide disconnect in UI
- Reference privacy policy: `https://localhost:3003/privacy` (prod URL TBD)

---

## 11) Observability

### Metrics
- Token refresh failures
- Sync duration
- WHOOP API errors
- Rate‑limit hits

### Logging
- Correlation IDs shared across FE + Go
- Store last error in `whoop_connection.last_error`

---

## 12) Rollout Plan
- Feature flag: `FEATURE_WHOOP_INTEGRATION=true`
- Dev only (internal) → QA → staged rollout

---

## 13) QA Checklist
- OAuth happy path (connect)
- OAuth deny path
- Manual sync success
- Background sync respects rate limits
- Token refresh works
- Disconnect revokes tokens and keeps data

---

## 14) Open Questions (Need Your Final Answers)
Please confirm these so we can finalize v1:

1) Background sync: confirm **offline scope = yes**
2) Data freshness: confirm **2x/day** and preferred times / timezone
3) Raw JSON retention period: 30, 60, 90 days, or indefinitely?
4) Token encryption: confirm **AWS KMS** vs app‑level secret
5) Callback route: `/integrations/whoop/callback` vs keep `/oauth/callback`
6) Final prod redirect URL (exact)
7) Staging domain and redirect URL (if any)
