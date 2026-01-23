# PRD: WHOOP Integration v1 (OAuth + Data Sync)

## Status
- Stage: Implemented (v1)
- Target: account linking + sync

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
- v1 uses all available scopes (per decision).
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

## 5) Architecture (Chosen)
**Go service owns OAuth exchange + sync.**
- FE starts OAuth and validates state.
- Go service exchanges code, stores tokens (encrypted), and runs sync.
- Keeps rate-limiting and data ingestion centralized.

---

## 6) OAuth + Connection Flow (Detailed)

### 6.1 Start Connect (FE server action)
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

## 8) Data Model

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

### 8.3 Provider‑Agnostic Normalized Tables (v1)
**`integration_sleep`**, **`integration_recovery`**, **`integration_workout`**, **`integration_cycle`**
- Schema fields mapped from WHOOP API
- Foreign key: `integration_id`
- `external_id` unique per type

**Future providers note**
- Raw events stay provider‑specific; normalized tables are provider‑agnostic.
- This avoids schema churn when adding Garmin/Apple Health/Oura later.

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
- `GET /internal/whoop/metrics` (observability snapshot)

---

## 10) Security & Compliance

### OAuth Security
- State stored server‑side with TTL (5–10 minutes)
- One‑time use only
- Reject unknown redirect_uri

### Token Storage
- Encrypt tokens at rest (app-level key in v1; KMS later)
- Rotate refresh tokens when WHOOP issues new ones
- Never send tokens to browser

### Privacy
- Show user clearly what access was granted
- Provide disconnect in UI
- Reference privacy policy: `https://localhost:3003/privacy` (prod URL TBD)

---

## 11) Observability (v1 implemented)

### Metrics
- In-memory counters: exchange/sync/refresh/disconnect + WHOOP API calls
- Average sync duration computed from counters
- Snapshot endpoint: `GET /internal/whoop/metrics`

### Logging
- Correlation IDs shared across FE + Go (request_id logged)
- Store last error in `integration_connection.last_error`

---

## 12) Rollout Plan
- Ship to dev → QA → staged rollout

---

## 13) QA Checklist
- OAuth happy path (connect)
- OAuth deny path
- Manual sync success
- Background sync respects rate limits
- Token refresh works
- Disconnect revokes tokens and keeps data
