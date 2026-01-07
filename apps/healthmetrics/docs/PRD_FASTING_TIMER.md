# PRD: Fasting Timer Feature

> **Feature:** Track your intermittent fasts and nutrition in one app

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [User Stories](#user-stories)
5. [Feature Requirements](#feature-requirements)
6. [Technical Architecture](#technical-architecture)
7. [Database Schema](#database-schema)
8. [API Design](#api-design)
9. [UI/UX Design](#uiux-design)
10. [Integration Points](#integration-points)
11. [Implementation Phases](#implementation-phases)
12. [Testing Strategy](#testing-strategy)
13. [Future Considerations](#future-considerations)

---

## Executive Summary

The Fasting Timer feature enables users to track intermittent fasting sessions alongside their existing nutrition tracking. Users can start, pause, and complete fasts using popular protocols (16:8, 18:6, 20:4, OMAD, or custom), view their fasting history, track streaks, and see how fasting correlates with their nutrition goals.

This feature seamlessly integrates with the existing HealthMetrics ecosystem, appearing on the dashboard and providing insights in the progress section.

---

## Problem Statement

### Current State
- Users track meals, water, steps, weight, and exercise
- No way to track fasting windows alongside nutrition
- Users interested in intermittent fasting must use separate apps
- Disconnected experience between fasting and eating windows

### Desired State
- Unified experience for fasting and nutrition tracking
- Visual timer showing current fast progress
- Historical data and streak tracking
- Smart integration with diary (eating window awareness)
- Insights correlating fasting with weight/nutrition trends

### Target Users
- Intermittent fasting practitioners (16:8, 18:6, 20:4, OMAD)
- Users exploring fasting for weight management
- Health-conscious users wanting complete daily health tracking

---

## Goals & Success Metrics

### Primary Goals
1. Enable users to track intermittent fasting sessions
2. Integrate fasting data with existing nutrition tracking
3. Provide motivational feedback through streaks and achievements

### Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature Adoption | 40% of active users try fasting within 30 days | Database query |
| Retention | 60% of fasting users complete 7+ fasts | Streak tracking |
| Completion Rate | 70% of started fasts reach target duration | Fasting records |
| User Satisfaction | 4.0+ rating in feedback | Survey/feedback |

---

## User Stories

### Core Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| F-01 | User | Start a fast with a preset protocol | I can quickly begin tracking | P0 |
| F-02 | User | See a live timer of my current fast | I know how much time remains | P0 |
| F-03 | User | End my fast early or mark it complete | I can accurately log my fasting | P0 |
| F-04 | User | View my fasting history | I can see patterns over time | P0 |
| F-05 | User | Track my fasting streak | I stay motivated to continue | P1 |
| F-06 | User | Create custom fasting protocols | I can follow my own schedule | P1 |
| F-07 | User | See fasting status on dashboard | I have a quick overview | P1 |
| F-08 | User | Get notified when my fast is complete | I know when I can eat | P2 |
| F-09 | User | See correlations between fasting and weight | I understand my progress | P2 |
| F-10 | User | Pause and resume a fast | I can handle unexpected situations | P2 |

### Edge Cases
- User starts a new fast while one is already active
- User logs food during a fast (warning/confirmation)
- User's fast spans midnight (new day)
- User changes timezones mid-fast
- Fast data sync across devices

---

## Feature Requirements

### Functional Requirements

#### FR-01: Fasting Protocols
- **Preset Protocols:**
  - 16:8 (16 hours fasting, 8 hours eating)
  - 18:6 (18 hours fasting, 6 hours eating)
  - 20:4 (20 hours fasting, 4 hours eating)
  - OMAD (23:1 - One Meal A Day)
  - Custom (user-defined duration)
- **Default Protocol:** Configurable in user profile (default: 16:8)
- **Quick Start:** One-tap to start fast with default protocol

#### FR-02: Fast Timer
- Real-time countdown/count-up display
- Visual progress indicator (circular or linear)
- Current phase indication (fasting vs eating window)
- Time elapsed and time remaining
- Estimated completion time

#### FR-03: Fast Management
- Start fast (with protocol selection)
- End fast (early or at target)
- Cancel fast (delete without logging)
- Pause/Resume fast (optional P2)
- Edit fast start time (for retroactive logging)

#### FR-04: Fasting History
- List of past fasts with duration and completion status
- Calendar view of fasting days
- Weekly/monthly fasting summaries
- Average fasting duration
- Longest fast achieved

#### FR-05: Streaks & Achievements
- Current streak (consecutive days with completed fast)
- Longest streak (historical best)
- Achievements for milestones (first fast, 7-day streak, etc.)
- Weekly fasting goal tracking

#### FR-06: Dashboard Integration
- Fasting widget showing current status
- Quick action to start/view fast
- Integration with daily summary

### Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Performance | Timer updates every second with <100ms latency |
| Offline | Timer continues in offline mode, syncs on reconnect |
| Persistence | Active fast survives app restart/refresh |
| Responsiveness | Works on mobile, tablet, and desktop |
| Accessibility | WCAG 2.1 AA compliant |

---

## Technical Architecture

### Component Structure

```
src/
├── components/
│   └── fasting/
│       ├── index.ts                    # Exports
│       ├── FastingTimer.tsx            # Main timer display
│       ├── FastingControls.tsx         # Start/Stop/Pause buttons
│       ├── FastingProgress.tsx         # Circular progress indicator
│       ├── FastingProtocolSelector.tsx # Protocol picker dialog
│       ├── FastingHistory.tsx          # History list view
│       ├── FastingCalendar.tsx         # Calendar view
│       ├── FastingStreakCard.tsx       # Streak display
│       ├── FastingDashboardWidget.tsx  # Dashboard integration
│       └── FastingInsights.tsx         # Progress section insights
├── hooks/
│   └── useFasting.ts                   # Fasting hooks
├── server/
│   └── fasting.ts                      # Server functions
├── types/
│   └── fasting.ts                      # TypeScript types
├── constants/
│   └── fasting.ts                      # Fasting constants
└── routes/
    └── fasting/
        ├── index.tsx                   # Main fasting page
        └── index.lazy.tsx              # Lazy loading
```

### Data Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Client    │───▶│   Server Fn  │───▶│   Prisma    │
│  (React)    │◀───│  (TanStack)  │◀───│ (PostgreSQL)│
└─────────────┘    └──────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐
│ Local Timer │  (Client-side countdown, syncs with server)
└─────────────┘
```

### State Management

```typescript
// Active fast state (stored in DB, synced to client)
interface ActiveFast {
  id: string;
  userId: string;
  protocolId: string;
  startTime: Date;
  targetDuration: number; // minutes
  pausedAt?: Date;
  totalPausedMinutes: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

// Client-side timer state
interface FastingTimerState {
  elapsedMinutes: number;
  remainingMinutes: number;
  percentComplete: number;
  phase: 'fasting' | 'eating';
  isActive: boolean;
}
```

---

## Database Schema

### New Models

```prisma
// Fasting protocols (preset + custom)
model FastingProtocol {
  id              String   @id @default(uuid())
  userId          String?  @map("user_id")  // null = preset
  name            String
  fastingMinutes  Int      @map("fasting_minutes")
  eatingMinutes   Int      @map("eating_minutes")
  isPreset        Boolean  @default(false) @map("is_preset")
  isDefault       Boolean  @default(false) @map("is_default")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // Relations
  user           User?          @relation(fields: [userId], references: [id], onDelete: Cascade)
  fastingSessions FastingSession[]

  @@index([userId])
  @@index([isPreset])
  @@map("fasting_protocols")
}

// Individual fasting sessions
model FastingSession {
  id                  String   @id @default(uuid())
  userId              String   @map("user_id")
  protocolId          String   @map("protocol_id")
  startTime           DateTime @map("start_time")
  endTime             DateTime? @map("end_time")
  targetDurationMin   Int      @map("target_duration_min")
  actualDurationMin   Int?     @map("actual_duration_min")
  pausedAt            DateTime? @map("paused_at")
  totalPausedMin      Int      @default(0) @map("total_paused_min")
  status              FastingStatus
  completedAtTarget   Boolean? @map("completed_at_target")
  notes               String?
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  // Relations
  user     User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  protocol FastingProtocol @relation(fields: [protocolId], references: [id], onDelete: Restrict)

  @@index([userId])
  @@index([userId, status])
  @@index([userId, startTime])
  @@map("fasting_sessions")
}

// Enum for fasting status
enum FastingStatus {
  active
  paused
  completed
  cancelled
}
```

### User Model Updates

```prisma
model User {
  // ... existing fields ...
  
  // Fasting preferences
  defaultFastingProtocolId String? @map("default_fasting_protocol_id")
  fastingGoalPerWeek       Int?    @map("fasting_goal_per_week") // target fasts per week
  
  // Relations
  fastingProtocols  FastingProtocol[]
  fastingSessions   FastingSession[]
}
```

### Seed Data (Preset Protocols)

```typescript
const presetProtocols = [
  { name: '16:8', fastingMinutes: 960, eatingMinutes: 480, isPreset: true },
  { name: '18:6', fastingMinutes: 1080, eatingMinutes: 360, isPreset: true },
  { name: '20:4', fastingMinutes: 1200, eatingMinutes: 240, isPreset: true },
  { name: 'OMAD (23:1)', fastingMinutes: 1380, eatingMinutes: 60, isPreset: true },
];
```

---

## API Design

### Server Functions (`src/server/fasting.ts`)

```typescript
// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

// Get active fast for user
export const getActiveFast = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<FastingSession | null> => { ... });

// Get fasting history
export const getFastingHistory = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; limit?: number; offset?: number }) => data)
  .handler(async ({ data }): Promise<FastingSession[]> => { ... });

// Get fasting protocols (preset + user custom)
export const getFastingProtocols = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<FastingProtocol[]> => { ... });

// Get fasting stats (streak, totals)
export const getFastingStats = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<FastingStats> => { ... });

// Get fasting calendar data
export const getFastingCalendar = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; month: string }) => data)
  .handler(async ({ data }): Promise<FastingCalendarDay[]> => { ... });

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

// Start a new fast
export const startFast = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; protocolId: string; startTime?: Date }) => data)
  .handler(async ({ data }): Promise<FastingSession> => { ... });

// End current fast
export const endFast = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; sessionId: string; endTime?: Date }) => data)
  .handler(async ({ data }): Promise<FastingSession> => { ... });

// Cancel fast (delete without completing)
export const cancelFast = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; sessionId: string }) => data)
  .handler(async ({ data }): Promise<void> => { ... });

// Pause fast
export const pauseFast = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; sessionId: string }) => data)
  .handler(async ({ data }): Promise<FastingSession> => { ... });

// Resume fast
export const resumeFast = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; sessionId: string }) => data)
  .handler(async ({ data }): Promise<FastingSession> => { ... });

// Create custom protocol
export const createCustomProtocol = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateProtocolInput) => data)
  .handler(async ({ data }): Promise<FastingProtocol> => { ... });

// Update user fasting preferences
export const updateFastingPreferences = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; defaultProtocolId?: string; goalPerWeek?: number }) => data)
  .handler(async ({ data }): Promise<void> => { ... });
```

### Hooks (`src/hooks/useFasting.ts`)

```typescript
// Query hooks
export function useActiveFast(userId: string);
export function useFastingHistory(userId: string, limit?: number);
export function useFastingProtocols(userId: string);
export function useFastingStats(userId: string);
export function useFastingCalendar(userId: string, month: string);

// Mutation hooks
export function useStartFast();
export function useEndFast();
export function useCancelFast();
export function usePauseFast();
export function useResumeFast();
export function useCreateCustomProtocol();
export function useUpdateFastingPreferences();
```

---

## UI/UX Design

### Main Fasting Page (`/fasting`)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Fasting Timer                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           CIRCULAR PROGRESS TIMER                     │   │
│  │                                                       │   │
│  │              ┌───────────────┐                       │   │
│  │              │   12:34:56    │  ← Elapsed time       │   │
│  │              │   remaining   │                       │   │
│  │              │   3:25:04     │                       │   │
│  │              └───────────────┘                       │   │
│  │                                                       │   │
│  │  [═══════════════════░░░░░░░░░░] 78%                 │   │
│  │                                                       │   │
│  │  Protocol: 16:8 | Target: 16h | End: 12:30 PM       │   │
│  │                                                       │   │
│  │     [ End Fast ]    [ Pause ]    [ Cancel ]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ 🔥 Current Streak │  │ 📊 This Week     │               │
│  │      7 days       │  │    5/7 fasts     │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Recent History                          [View All →] │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Today     | 16:8 | 14h 32m ✓ Completed             │   │
│  │ Yesterday | 16:8 | 16h 00m ✓ Completed             │   │
│  │ Jan 4     | 18:6 | 12h 45m ✗ Ended Early           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Widget

```
┌─────────────────────────────────────┐
│ ⏱️ Fasting                          │
├─────────────────────────────────────┤
│                                     │
│  Currently Fasting                  │
│  ████████████░░░░░░ 72%            │
│                                     │
│  11:32:15 elapsed                   │
│  4:27:45 remaining                  │
│                                     │
│  [ View Details ]                   │
└─────────────────────────────────────┘

-- OR (when not fasting) --

┌─────────────────────────────────────┐
│ ⏱️ Fasting                          │
├─────────────────────────────────────┤
│                                     │
│  No active fast                     │
│  Last fast: 16h (yesterday)         │
│  🔥 7 day streak                    │
│                                     │
│  [ Start Fast ]                     │
└─────────────────────────────────────┘
```

### Protocol Selector Dialog

```
┌─────────────────────────────────────────┐
│ Select Fasting Protocol          [ × ]  │
├─────────────────────────────────────────┤
│                                         │
│  Popular Protocols                      │
│  ┌───────────────────────────────────┐ │
│  │ ○ 16:8  (16h fast, 8h eating)    │ │
│  │ ○ 18:6  (18h fast, 6h eating)    │ │
│  │ ○ 20:4  (20h fast, 4h eating)    │ │
│  │ ○ OMAD  (23h fast, 1h eating)    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Custom Protocols                       │
│  ┌───────────────────────────────────┐ │
│  │ ○ My Evening Fast (14h)          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [ + Create Custom Protocol ]           │
│                                         │
│  [ Cancel ]            [ Start Fast ]   │
└─────────────────────────────────────────┘
```

### Timer Component States

1. **Idle State** - No active fast, show "Start Fast" button
2. **Active State** - Timer running, show progress and controls
3. **Paused State** - Timer paused, show "Resume" button
4. **Completing State** - Near target, celebratory styling
5. **Completed State** - Just finished, show summary and next actions

### CSS Styling Considerations

```css
/* Match existing app styling patterns */
.fasting-timer-container { ... }
.fasting-progress-ring { ... }
.fasting-time-display { ... }
.fasting-controls { ... }
.fasting-streak-card { ... }
.fasting-history-list { ... }

/* Animations for timer progress */
.fasting-progress-animate { ... }

/* State-based colors */
.fasting-state-active { color: var(--color-success); }
.fasting-state-paused { color: var(--color-warning); }
.fasting-state-completing { color: var(--color-accent); }
```

---

## Integration Points

### 1. Dashboard Integration
- Add `FastingDashboardWidget` to dashboard grid
- Update `QuickActions` to include "Start Fast" option
- Show fasting status in daily summary

### 2. Diary Integration
- Show eating window indicator on diary page
- Warn if logging food during fasting window
- Quick action to end fast when logging food

### 3. Progress Integration
- Add fasting insights to `InsightsPanel`
- Correlate fasting patterns with weight trends
- Add fasting heatmap to progress page

### 4. Profile Integration
- Add fasting preferences section
- Default protocol selection
- Weekly fasting goal setting

### 5. Navigation
- Add "Fasting" to main navigation
- Update `ROUTES` constant with fasting routes

```typescript
// constants/routes.ts
export const ROUTES = {
  // ... existing routes ...
  FASTING: "/fasting",
} as const;
```

---

## Implementation Phases

### Phase 1: Core Timer (Week 1-2) - P0

**Goal:** Basic fasting timer with start/stop functionality

| Task | Estimate | Dependencies |
|------|----------|--------------|
| Database schema + migration | 4h | None |
| Seed preset protocols | 1h | Schema |
| Server functions (start, end, get) | 4h | Schema |
| Hooks for fasting data | 3h | Server functions |
| Types and constants | 2h | None |
| FastingTimer component | 6h | Hooks |
| FastingControls component | 4h | Hooks |
| FastingProgress component | 4h | None |
| FastingProtocolSelector | 4h | Server functions |
| Fasting route page | 4h | Components |
| Basic CSS styling | 4h | Components |

**Deliverable:** Users can start/stop fasts with preset protocols

### Phase 2: History & Stats (Week 3) - P0/P1

| Task | Estimate | Dependencies |
|------|----------|--------------|
| Server functions (history, stats) | 4h | Phase 1 |
| Hooks for history/stats | 2h | Server functions |
| FastingHistory component | 4h | Hooks |
| FastingStreakCard component | 3h | Hooks |
| History integration on fasting page | 3h | Components |

**Deliverable:** Users can view history and track streaks

### Phase 3: Dashboard Integration (Week 4) - P1

| Task | Estimate | Dependencies |
|------|----------|--------------|
| FastingDashboardWidget component | 4h | Phase 1 hooks |
| Dashboard layout updates | 2h | Widget |
| QuickActions fasting button | 2h | Phase 1 |
| Navigation updates | 1h | Route |

**Deliverable:** Fasting visible on dashboard

### Phase 4: Advanced Features (Week 5-6) - P1/P2

| Task | Estimate | Dependencies |
|------|----------|--------------|
| Pause/Resume functionality | 4h | Phase 1 |
| Custom protocol creation | 4h | Phase 1 |
| FastingCalendar component | 6h | Phase 2 |
| Diary integration (warnings) | 4h | Phase 1 |
| Progress insights integration | 4h | Phase 2 |
| Profile preferences | 3h | Phase 1 |

**Deliverable:** Full feature set complete

### Phase 5: Polish & Optimization (Week 7) - P2

| Task | Estimate | Dependencies |
|------|----------|--------------|
| Offline timer persistence | 4h | All phases |
| Animations and micro-interactions | 4h | Components |
| Achievements system | 6h | Stats |
| Performance optimization | 4h | All phases |
| Accessibility audit | 3h | Components |
| Documentation | 2h | All |

**Deliverable:** Production-ready feature

---

## Testing Strategy

### Unit Tests
- Server function input validation
- Duration calculations
- Streak calculation logic
- Timer state transitions

### Integration Tests
- Start fast → timer runs → end fast flow
- Fast with pause/resume
- Concurrent fast prevention
- History query pagination

### E2E Tests
- Complete fasting workflow
- Dashboard widget interactions
- Protocol selection
- Cross-page navigation

### Manual Testing Scenarios
1. Start fast, wait, end normally
2. Start fast, end early
3. Start fast, cancel
4. Start fast, pause, resume, complete
5. View history after multiple fasts
6. Verify streak calculations
7. Mobile responsiveness
8. Offline timer behavior

---

## Future Considerations

### V2 Features (Not in scope)
- **Push notifications** for fast completion
- **Apple Health / Google Fit** integration
- **Social sharing** of fasting achievements
- **Fasting challenges** with friends
- **AI insights** correlating fasting with other metrics
- **Extended fasts** (24h+) with safety features
- **Fasting window scheduling** (auto-start based on last meal)

### Technical Debt Prevention
- Keep timer logic isolated for easy testing
- Use consistent patterns with existing features
- Document edge cases thoroughly
- Consider timezone handling from the start

### Analytics & Monitoring
- Track feature adoption rates
- Monitor timer accuracy
- Log error rates for server functions
- User feedback collection mechanism

---

## Appendix

### A. Competitive Analysis

| App | Strengths | Weaknesses |
|-----|-----------|------------|
| Zero | Beautiful UI, streaks | No nutrition integration |
| Fastic | Guided fasting | Separate from diet tracking |
| MyFitnessPal | Great nutrition | No fasting feature |
| **HealthMetrics** | Unified experience | Building new |

### B. Related Documentation
- [Nutrition Project Plan](./NUTRITION_PROJECT_PLAN.md)
- [Database Schema](../prisma/schema.prisma)
- [Component Patterns](./CSS_FOUC_FIX.md)

### C. Design Mockup References
- Timer designs inspired by Zero, Life Fasting Tracker
- Progress rings similar to Apple Watch activity rings
- History layout matches existing diary patterns

---

*Document Version: 1.0*  
*Created: January 6, 2026*  
*Author: HealthMetrics Team*
