# Fasting Feature Documentation

> Technical documentation for the HealthMetrics Fasting Timer feature.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Server Functions](#server-functions)
5. [React Hooks](#react-hooks)
6. [Components](#components)
7. [Integration Components](#integration-components)
8. [Styling](#styling)
9. [Utilities](#utilities)
10. [Usage Examples](#usage-examples)
11. [Timer Logic](#timer-logic)

---

## Overview

The Fasting Timer allows users to track intermittent fasting sessions. Users can:

- **Start a fast** using preset protocols (16:8, 18:6, 20:4, OMAD) or custom protocols
- **View real-time progress** with a circular progress ring and countdown timer
- **Pause/Resume** a fast if needed
- **End or Cancel** a fast at any time
- **View history** of past fasting sessions
- **Track streaks** and weekly fasting goals

---

## Architecture

### File Structure

```
src/
├── components/
│   ├── fasting/                        # Core fasting components
│   │   ├── index.ts                    # Barrel exports
│   │   ├── FastingPage.tsx             # Main page component
│   │   ├── FastingTimer.tsx            # Live timer display
│   │   ├── FastingProgress.tsx         # SVG circular progress ring
│   │   ├── FastingControls.tsx         # End/Pause/Cancel buttons
│   │   ├── FastingProtocolSelector.tsx # Protocol picker + custom creation
│   │   ├── FastingStatsCard.tsx        # Streak and goal display
│   │   ├── FastingHistory.tsx          # Recent fasts list
│   │   └── FastingCalendar.tsx         # Monthly calendar view
│   ├── dashboard/
│   │   └── FastingCard.tsx             # Dashboard widget
│   ├── progress/
│   │   └── FastingProgressCard.tsx     # Progress page stats card
│   ├── profile/
│   │   └── FastingPreferences.tsx      # Profile fasting settings
│   ├── diary/
│   │   ├── FastingWarningBanner.tsx    # Banner when fasting
│   │   └── FastingWarningDialog.tsx    # Warning when logging food
│   └── layout/
│       ├── Sidebar.tsx                 # Contains fasting nav item
│       └── BottomNav.tsx               # Contains fasting nav item
├── hooks/
│   └── useFasting.ts                   # React Query hooks
├── server/
│   └── fasting.ts                      # TanStack server functions
├── types/
│   └── fasting.ts                      # TypeScript types
├── constants/
│   └── fasting.ts                      # Protocols and helpers
├── utils/
│   └── time-helpers.ts                 # formatDuration utility
├── styles/components/
│   └── fasting.css                     # Component styles
└── routes/fasting/
    ├── index.tsx                       # Route with auth guard
    └── index.lazy.tsx                  # Lazy-loaded page
```

### Data Flow

```
User Action → React Component → useMutation Hook → Server Function → Prisma → PostgreSQL
                                                                          ↓
User Sees ← React Component ← useQuery Hook ← Server Function ← ─────────┘
```

---

## Database Schema

### FastingProtocol

Stores fasting protocols (both preset and user-created custom protocols).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID? | Null for presets, user ID for custom |
| `name` | String | Display name (e.g., "16:8") |
| `fasting_minutes` | Int | Fasting window duration |
| `eating_minutes` | Int | Eating window duration |
| `is_preset` | Boolean | True for system protocols |
| `is_default` | Boolean | True if user's default |

### FastingSession

Records individual fasting sessions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who fasted |
| `protocol_id` | UUID | Protocol used |
| `start_time` | DateTime | When fast started |
| `end_time` | DateTime? | When fast ended |
| `target_duration_min` | Int | Target duration in minutes |
| `actual_duration_min` | Int? | Actual fasting time |
| `paused_at` | DateTime? | When paused (if currently paused) |
| `total_paused_min` | Int | Cumulative paused time |
| `status` | Enum | active, paused, completed, cancelled |
| `completed_at_target` | Boolean? | Did user reach target? |
| `notes` | String? | Optional notes |

### FastingStatus Enum

```prisma
enum FastingStatus {
  active     // Currently fasting
  paused     // Fast is paused
  completed  // Successfully ended
  cancelled  // Cancelled without completing
}
```

---

## Server Functions

All server functions are in `src/server/fasting.ts` and use TanStack's `createServerFn`.

### Queries

| Function | Purpose | Parameters |
|----------|---------|------------|
| `getActiveFast` | Get user's currently active fast | `userId` |
| `getFastingProtocols` | Get all available protocols | `userId` |
| `getFastingHistory` | Get past fasting sessions | `userId`, `limit?` |
| `getFastingStats` | Get streak and goal progress | `userId` |
| `getFastingCalendar` | Get fasting data for calendar | `userId`, `month` |

### Mutations

| Function | Purpose | Parameters |
|----------|---------|------------|
| `startFast` | Begin a new fast | `userId`, `protocolId` |
| `endFast` | Complete a fast | `userId`, `sessionId` |
| `cancelFast` | Cancel without saving | `userId`, `sessionId` |
| `pauseFast` | Pause active fast | `userId`, `sessionId` |
| `resumeFast` | Resume paused fast | `userId`, `sessionId` |
| `createCustomProtocol` | Create custom protocol | `userId`, `name`, `fastingMinutes`, `eatingMinutes` |
| `updateFastingPreferences` | Update user defaults | `userId`, `defaultProtocolId?`, `goalPerWeek?` |

---

## React Hooks

All hooks are in `src/hooks/useFasting.ts` and exported from `src/hooks/index.ts`.

### Query Hooks

```typescript
// Get active fast (if any)
const { data: activeFast, isLoading } = useActiveFast(userId);

// Get fasting history
const { data: history } = useFastingHistory(userId, 10);

// Get available protocols
const { data: protocols } = useFastingProtocols(userId);

// Get streak and stats
const { data: stats } = useFastingStats(userId);
```

### Mutation Hooks

```typescript
// Start a fast
const startFast = useStartFast();
startFast.mutate({ userId, protocolId });

// End a fast
const endFast = useEndFast();
endFast.mutate({ userId, sessionId });

// Cancel a fast
const cancelFast = useCancelFast();
cancelFast.mutate({ userId, sessionId });

// Pause a fast
const pauseFast = usePauseFast();
pauseFast.mutate({ userId, sessionId });

// Resume a fast
const resumeFast = useResumeFast();
resumeFast.mutate({ userId, sessionId });
```

---

## Components

### FastingPage

Main container component that orchestrates the fasting UI.

**States:**
- **Idle**: No active fast → Shows "Start Fast" button
- **Active**: Fast in progress → Shows timer and controls

### FastingTimer

Displays the live countdown timer with elapsed/remaining time.

**Props:**
- `activeFast: ActiveFast` - The current fasting session

**Features:**
- Updates every second using `setInterval`
- Accounts for paused time in calculations
- Shows estimated completion time

### FastingProgress

SVG-based circular progress ring.

**Props:**
- `percentComplete: number` - Progress (0-100)
- `isPaused: boolean` - Changes color when paused
- `isCompleting: boolean` - Green color when near completion
- `children: ReactNode` - Timer display inside ring

### FastingControls

Action buttons for managing the active fast.

**Buttons:**
- **End Fast** - Complete the fast (primary)
- **Pause/Resume** - Toggle pause state (outline)
- **Cancel** - Cancel with confirmation dialog (ghost)

### FastingProtocolSelector

Dialog for choosing a fasting protocol before starting.

**Features:**
- Lists preset protocols with icons (Timer, Clock, Hourglass, Target)
- Difficulty badges (Beginner, Intermediate, Advanced, Expert)
- Protocol cards with gradient backgrounds and hover effects
- Custom protocol creation form with slider
- Delete custom protocols
- Click outside to close

### FastingStatsCard

Displays streak and weekly goal progress.

**Displays:**
- Current streak (consecutive days)
- Weekly goal progress (X/Y fasts)

### FastingHistory

List of recent fasting sessions.

**Features:**
- Shows date, protocol, duration
- Indicates completion status
- Color-coded status badges

### FastingCalendar

Monthly calendar view of fasting activity.

**Features:**
- Month navigation (previous/next)
- Color-coded days (complete, partial, none)
- Today indicator
- Monthly summary with total fasts and hours
- Legend for status colors

---

## Integration Components

These components integrate fasting into other parts of the app.

### FastingCard (Dashboard)

Dashboard widget showing fasting status.

**Location:** `src/components/dashboard/FastingCard.tsx`

**States:**
- **Active fast**: Shows progress ring, elapsed/remaining time, protocol name
- **Idle with stats**: Shows streak, weekly count, total fasts
- **Empty state**: Shows "Start Fast" CTA for new users

**Features:**
- Real-time timer updates
- Clickable to navigate to fasting page
- Loading skeleton state

### FastingProgressCard (Progress Page)

Stats card for the progress page.

**Location:** `src/components/progress/FastingProgressCard.tsx`

**Displays:**
- Current streak
- Weekly fasts (X/Y goal)
- Average fast duration
- Completion rate percentage

### FastingPreferences (Profile Page)

User preferences for fasting.

**Location:** `src/components/profile/FastingPreferences.tsx`

**Settings:**
- Default protocol selector
- Weekly fasting goal (3-7 days)
- Current streak display (read-only)
- Total fasts display (read-only)

### FastingWarningBanner (Diary Page)

Banner shown at top of diary when actively fasting.

**Location:** `src/components/diary/FastingWarningBanner.tsx`

**Features:**
- Shows protocol name and time remaining
- Warning that logging food will break fast
- Changes to success style when almost done (>95%)
- Link to view/manage fast

### FastingWarningDialog (Diary Page)

Dialog shown when user tries to log food while fasting.

**Location:** `src/components/diary/FastingWarningDialog.tsx`

**Options:**
- **End Fast & Log** - Ends the fast, then logs food
- **Log Anyway** - Logs food without ending fast
- **Keep Fasting** - Cancels the action

**Shows:**
- Current fast progress bar
- Elapsed and remaining time
- Protocol name

---

## Styling

All styles are in `src/styles/components/fasting.css` using CSS classes with `@apply`.

### Key CSS Classes

| Class | Purpose |
|-------|---------|
| `.fasting-page` | Page layout |
| `.fasting-timer-card` | Timer container |
| `.fasting-progress` | Progress ring container |
| `.fasting-timer-elapsed` | Large elapsed time |
| `.fasting-timer-remaining` | Remaining time |
| `.fasting-controls` | Button container |
| `.fasting-protocol-item` | Protocol selector item |
| `.fasting-history-item` | History list item |
| `.fasting-stat-card-content` | Stats card layout |

### State Colors

```css
.fasting-state-active    { color: var(--primary); }
.fasting-state-paused    { color: var(--warning); }
.fasting-state-completing { color: var(--success); }
```

---

## Utilities

### formatDuration

Shared utility for formatting minutes as human-readable duration.

**Location:** `src/utils/time-helpers.ts`

```typescript
import { formatDuration } from "@/utils";

formatDuration(90);   // "1h 30m"
formatDuration(45);   // "45m"
formatDuration(120);  // "2h"
```

Also available: `formatDurationLong()` for full words ("1 hour 30 minutes").

---

## Usage Examples

### Starting a Fast

```tsx
function StartFastButton({ userId }: { userId: string }) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <>
      <Button onClick={() => setShowSelector(true)}>
        Start Fast
      </Button>

      <FastingProtocolSelector
        userId={userId}
        open={showSelector}
        onOpenChange={setShowSelector}
      />
    </>
  );
}
```

### Displaying Active Fast

```tsx
function FastingDisplay({ userId }: { userId: string }) {
  const { data: activeFast, isLoading } = useActiveFast(userId);

  if (isLoading) return <Skeleton />;

  if (!activeFast) {
    return <FastingIdleState onStart={() => {}} />;
  }

  return (
    <>
      <FastingTimer activeFast={activeFast} />
      <FastingControls activeFast={activeFast} userId={userId} />
    </>
  );
}
```

---

## Timer Logic

### Calculating Elapsed Time

```typescript
const calculateElapsed = () => {
  const now = new Date();
  const startTime = new Date(session.startTime);
  let elapsedMs = now.getTime() - startTime.getTime();

  // Subtract time spent paused
  if (session.pausedAt) {
    const pausedMs = now.getTime() - new Date(session.pausedAt).getTime();
    elapsedMs -= pausedMs;
  }
  elapsedMs -= session.totalPausedMin * 60 * 1000;

  return Math.max(0, Math.floor(elapsedMs / 1000));
};
```

### Progress Calculation

```typescript
const targetSeconds = session.targetDurationMin * 60;
const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
const percentComplete = Math.min(100, (elapsedSeconds / targetSeconds) * 100);
```

### Pause/Resume Logic

**Pausing:**
1. Set `pausedAt` to current time
2. Change status to `paused`

**Resuming:**
1. Calculate time spent paused: `now - pausedAt`
2. Add to `totalPausedMin`
3. Clear `pausedAt`
4. Change status back to `active`

---

## Query Keys

All query keys are defined in `src/utils/query-keys.ts`:

```typescript
export const queryKeys = {
  activeFast: (userId: string) => ["fasting", "active", userId],
  fastingHistory: (userId: string, limit?: number) =>
    ["fasting", "history", userId, limit],
  fastingStats: (userId: string) => ["fasting", "stats", userId],
  fastingProtocols: (userId: string) => ["fasting", "protocols", userId],
  fastingCalendar: (userId: string, month: string) =>
    ["fasting", "calendar", userId, month],
};
```

### Cache Invalidation

Mutations invalidate related queries:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.activeFast(userId),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.fastingHistory(userId),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.fastingStats(userId),
  });
}
```

---

## Navigation

The fasting feature is accessible from:

- **Sidebar**: "Fasting" nav item with Clock icon
- **Bottom Nav**: "Fasting" nav item (mobile)
- **Dashboard**: FastingCard widget links to `/fasting`
- **Progress Page**: FastingProgressCard links to `/fasting`

Route: `/fasting` (requires auth and completed onboarding)

---

## Design System Enhancements

The fasting feature added these reusable enhancements:

| Enhancement | Location | Description |
|-------------|----------|-------------|
| `accent` button variant | `button.tsx` | Accent-colored button for CTAs |
| `xl` button size | `button.tsx` | Larger button for prominent actions |
| `closeOnOutsideClick` | `dialog.tsx` | Close dialog by clicking outside |
| `onClose` callback | `dialog.tsx` | Callback when dialog closes |

---

*Last updated: January 7, 2026*
