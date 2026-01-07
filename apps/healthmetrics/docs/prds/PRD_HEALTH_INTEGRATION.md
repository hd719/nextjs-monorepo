# PRD: Apple Health & Google Fit Integration

> **Status:** Not Started
> **Priority:** Medium
> **Effort:** High (5-7 days)
> **Dependencies:** Native app wrapper or PWA Health API access

---

## Problem Statement

Users already track health data in native apps (Apple Health, Google Fit). Without integration:

- **Duplicate entry**: Steps, weight, workouts entered twice
- **Incomplete picture**: Health data fragmented across apps
- **Missed insights**: Can't correlate nutrition with activity/sleep
- **Lower adoption**: Users prefer apps that sync with their ecosystem

**Goal:** Seamless two-way sync with Apple Health and Google Fit for a unified health experience.

---

## Goals

### Must Have

- [ ] Read steps from Apple Health / Google Fit
- [ ] Read weight entries from health platforms
- [ ] Write weight entries to health platforms
- [ ] Read workout/exercise data
- [ ] User authorization flow

### Should Have

- [ ] Write nutrition data (calories consumed)
- [ ] Read sleep data
- [ ] Read heart rate data
- [ ] Background sync (periodic)
- [ ] Conflict resolution for duplicate entries

### Nice to Have

- [ ] Read water intake (Apple Health)
- [ ] Write exercise to health platforms
- [ ] Real-time sync
- [ ] Fitbit, Garmin, Samsung Health support

### Non-Goals

- Building native iOS/Android apps (initially)
- Medical device integration
- Insurance/healthcare provider integrations
- HIPAA compliance (v1)

---

## User Stories

### As a user with Apple Watch

- I want my steps automatically synced to HealthMetrics
- I want my workouts from Apple Fitness logged automatically
- I want weight I log here to appear in Apple Health

### As a user with Fitbit/Android

- I want my Google Fit steps in HealthMetrics
- I want to see all my health data in one place
- I don't want to log the same workout twice

### As any user

- I want to choose what data to sync
- I want to disconnect integration easily
- I want to know when data was last synced

---

## Technical Architecture

### Platform Options

| Approach | Apple Health | Google Fit | Effort | UX |
|----------|-------------|------------|--------|-----|
| **Native App** | HealthKit | Google Fit API | High | Best |
| **Capacitor/Ionic** | Plugin | Plugin | Medium | Good |
| **Terra API** | ✅ | ✅ | Low | Good |
| **Vital API** | ✅ | ✅ | Low | Good |

**Recommendation:** Use **Terra API** or **Vital API** as aggregator to avoid building native apps initially. These services handle OAuth and normalize data across platforms.

### Using Terra API (Recommended)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │     │   Server     │     │   Terra API  │
│   (Web)      │────▶│   (Node)     │────▶│  (Aggregator)│
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                            ┌─────────────────────┼─────────────────────┐
                            │                     │                     │
                            ▼                     ▼                     ▼
                     ┌──────────┐          ┌──────────┐          ┌──────────┐
                     │  Apple   │          │  Google  │          │  Fitbit  │
                     │  Health  │          │   Fit    │          │          │
                     └──────────┘          └──────────┘          └──────────┘
```

### Database Schema

```prisma
model HealthIntegration {
  id           String   @id @default(cuid())
  userId       String
  provider     String   // "apple_health", "google_fit", "fitbit"
  accessToken  String   // Encrypted
  refreshToken String?  // Encrypted
  terraUserId  String?  // Terra's user identifier
  scopes       String[] // ["steps", "weight", "workouts", "sleep"]
  status       String   // "active", "expired", "revoked"
  lastSyncAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         BetterAuthUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, provider])
  @@map("health_integration")
}

model SyncedHealthData {
  id            String   @id @default(cuid())
  userId        String
  provider      String
  dataType      String   // "steps", "weight", "workout", "sleep"
  externalId    String   // ID from provider to prevent duplicates
  data          Json     // The actual data
  recordedAt    DateTime // When the data was recorded
  syncedAt      DateTime @default(now())

  @@unique([userId, provider, externalId])
  @@index([userId, dataType, recordedAt])
  @@map("synced_health_data")
}
```

---

## Implementation Plan

### Phase 1: Terra Setup & Authorization (Day 1-2)

#### 1.1 Terra Account Setup

1. Create Terra API account
2. Configure webhooks for real-time updates
3. Set up supported providers (Apple Health, Google Fit)

#### 1.2 OAuth Flow

**File:** `src/server/health-integration.ts`

```typescript
// Generate connection URL for user
export async function getHealthConnectionUrl(
  userId: string,
  provider: "apple" | "google" | "fitbit"
): Promise<string>

// Handle OAuth callback
export async function handleHealthCallback(
  code: string,
  state: string
): Promise<HealthIntegration>

// Disconnect integration
export async function disconnectHealthProvider(
  userId: string,
  provider: string
): Promise<void>
```

#### 1.3 Connection UI

**File:** `src/components/integrations/HealthConnectCard.tsx`

- Provider logo and name
- Connect/Disconnect button
- Last synced timestamp
- Sync status indicator

### Phase 2: Data Sync (Day 2-4)

#### 2.1 Read Steps

```typescript
export async function syncSteps(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<StepEntry[]>
```

- Fetch daily step totals
- Create/update StepEntry records
- Avoid duplicates using externalId

#### 2.2 Read/Write Weight

```typescript
export async function syncWeight(userId: string): Promise<WeightEntry[]>

export async function pushWeightToHealth(
  userId: string,
  weight: WeightEntry
): Promise<void>
```

- Two-way sync for weight
- Conflict resolution: most recent wins
- User preference: "prefer HealthMetrics" or "prefer Apple Health"

#### 2.3 Read Workouts

```typescript
export async function syncWorkouts(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WorkoutSession[]>
```

- Map provider workout types to our types
- Calculate calories if not provided
- Link to existing exercises in our database

#### 2.4 Read Sleep (Should Have)

```typescript
export async function syncSleep(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<SleepEntry[]>
```

### Phase 3: Background Sync (Day 4-5)

#### 3.1 Webhook Handler

**File:** `src/server/webhooks/terra.ts`

```typescript
// Handle incoming data from Terra
export async function handleTerraWebhook(payload: TerraWebhookPayload): Promise<void>
```

- Process new data as it arrives
- Update local records
- Trigger UI updates if user is active

#### 3.2 Scheduled Sync

- Daily full sync at midnight (user's timezone)
- Hourly incremental sync for active users
- Manual "Sync Now" button

### Phase 4: UI & Settings (Day 5-6)

#### 4.1 Integrations Page

**File:** `src/routes/settings/integrations.tsx`

- List of available integrations
- Connected status per provider
- Granular data type toggles
- Sync history

#### 4.2 Data Attribution

Show source of data in UI:

- "Steps synced from Apple Watch"
- "Weight from Google Fit"
- Icon indicating data source

### Phase 5: Polish & Edge Cases (Day 6-7)

- Token refresh handling
- Expired connection notifications
- Duplicate detection improvements
- Timezone handling
- Error recovery

---

## UI/UX Design

### Integrations Page

```
┌─────────────────────────────────┐
│  ← Health Integrations          │
├─────────────────────────────────┤
│                                 │
│  Connect your health apps to    │
│  sync data automatically        │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🍎 Apple Health             ││
│  │                             ││
│  │ Connected ✓                 ││
│  │ Last sync: 5 min ago        ││
│  │                             ││
│  │ Syncing: Steps, Weight,     ││
│  │          Workouts           ││
│  │                             ││
│  │ [Configure]    [Disconnect] ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🟢 Google Fit               ││
│  │                             ││
│  │ Not connected               ││
│  │                             ││
│  │        [Connect]            ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 💪 Fitbit                   ││
│  │                             ││
│  │ Not connected               ││
│  │                             ││
│  │        [Connect]            ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

### Configuration Modal

```
┌─────────────────────────────────┐
│  Apple Health Settings     ✕    │
├─────────────────────────────────┤
│                                 │
│  Choose what to sync:           │
│                                 │
│  ┌─────────────────────────────┐│
│  │ Steps              [====●] ││
│  │ Read from Apple Health      ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ Weight             [====●] ││
│  │ ○ Read only                 ││
│  │ ● Two-way sync              ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ Workouts           [====●] ││
│  │ Read from Apple Health      ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ Sleep              [●────] ││
│  │ Read from Apple Health      ││
│  └─────────────────────────────┘│
│                                 │
│  ─────────────────────────────  │
│                                 │
│  [Sync Now]                     │
│                                 │
│  Last full sync: Today, 8:00 AM │
│                                 │
└─────────────────────────────────┘
```

---

## File Structure

```
src/
├── components/
│   └── integrations/
│       ├── HealthConnectCard.tsx
│       ├── IntegrationConfig.tsx
│       ├── SyncStatus.tsx
│       ├── ProviderLogo.tsx
│       └── index.ts
├── server/
│   ├── health-integration.ts
│   └── webhooks/
│       └── terra.ts
├── hooks/
│   ├── useHealthIntegrations.ts
│   └── useSyncStatus.ts
├── routes/
│   └── settings/
│       └── integrations.tsx
├── types/
│   └── health.ts
└── constants/
    └── health-providers.ts
```

---

## Data Mapping

### Steps

| Source | Our Format |
|--------|------------|
| Apple Health | `StepEntry.count` |
| Google Fit | `StepEntry.count` |

### Weight

| Source | Our Format |
|--------|------------|
| Apple Health (kg) | Convert if user prefers lbs |
| Google Fit (kg) | Convert if user prefers lbs |

### Workouts

| Apple Health Type | Our Exercise Type |
|-------------------|-------------------|
| Running | running |
| Walking | walking |
| Cycling | cycling |
| Swimming | swimming |
| Strength Training | strength |
| HIIT | hiit |
| Yoga | yoga |
| Other | other |

---

## Error Handling

| Scenario | User Experience |
|----------|-----------------|
| OAuth denied | Show message, allow retry |
| Token expired | Auto-refresh, notify if fails |
| Sync failed | Show error, allow manual retry |
| Duplicate data | Silently skip, log for debugging |
| API rate limited | Queue and retry with backoff |
| Provider down | Show status, retry later |

---

## Acceptance Criteria

### Functional

- [ ] User can connect Apple Health
- [ ] User can connect Google Fit
- [ ] Steps sync automatically
- [ ] Weight syncs both directions
- [ ] Workouts appear in activity log
- [ ] User can disconnect integration
- [ ] User can configure what syncs

### Technical

- [ ] Tokens stored encrypted
- [ ] Webhook processing < 5 seconds
- [ ] Duplicates prevented
- [ ] Background sync runs reliably

### UX

- [ ] Clear connection status
- [ ] Last sync time shown
- [ ] Data source attribution
- [ ] Easy troubleshooting

---

## Privacy & Security

- Tokens encrypted at rest
- Minimal data scopes requested
- User can delete all synced data
- Clear privacy policy for health data
- No sharing with third parties

---

## Future Enhancements

- **Fitbit direct integration**
- **Garmin Connect**
- **Samsung Health**
- **Oura Ring**
- **Whoop**
- **MyFitnessPal import**
- **Native app** for direct HealthKit/Google Fit access

---

## References

- [Terra API Documentation](https://docs.tryterra.co/)
- [Vital API Documentation](https://docs.vital.dev/)
- [Apple HealthKit](https://developer.apple.com/documentation/healthkit)
- [Google Fit API](https://developers.google.com/fit)
