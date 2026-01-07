# PRD: Database Schema Additions

## Overview

Add missing database tables to replace mock data with real data storage. This enables full functionality for features currently using hardcoded or computed values.

---

## Status

- [x] **Complete** - All phases implemented and tested

---

## Problem Statement

Several features were partially implemented with mock data but lacked proper database storage:

| Feature | Status | Implementation |
|---------|--------|----------------|
| Water Tracking | [x] Complete | Data persisted to database, dashboard card |
| Sleep Tracking | [x] Complete | Full UI at `/sleep` with logging, analytics, insights |
| Step Tracking | [x] Complete | Data persisted to database |
| Achievements | [x] Complete | Full UI at `/achievements` with gallery and filters |
| Streaks | [x] Complete | Cached in database, displayed on dashboard and achievements page |

---

## Goals

| Goal | Metric | Status |
|------|--------|--------|
| Persist all tracked data | 0 features using hardcoded returns | [x] Complete |
| Enable Progress page real data | Toggle mock data off | [x] Complete |
| Support historical analysis | 1 year of data queryable | [x] Complete |

---

## Priority Matrix

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| Water Tracking | High | Small | [x] Done |
| Step Tracking | High | Small | [x] Done |
| Sleep Tracking | Medium | Medium | [x] Done (schema + UI + dashboard) |
| Streaks Cache | Low | Small | [x] Done |
| Achievements | Low | Large | [x] Done (schema + UI + seed + dashboard) |

---

## Phase 1: Water Tracking

**Status:** [x] Complete

Implemented:

- [x] `WaterEntry` model in Prisma schema
- [x] `getWaterIntake()` server function
- [x] `updateWaterIntake()` server function
- [x] Dashboard integration

---

## Phase 2: Step Tracking

**Status:** [x] Complete

Implemented:

- [x] `StepEntry` model in Prisma schema
- [x] `getStepCount()` server function
- [x] `addSteps()` server function
- [x] Dashboard integration

---

## Phase 3: Sleep Tracking

**Status:** [x] Complete

### Database Schema

```prisma
model SleepEntry {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  date         DateTime @db.Date
  hoursSlept   Decimal  @map("hours_slept") @db.Decimal(4, 2)
  quality      Int      // 1-5 rating (required)
  bedtime      String   // HH:MM format (required)
  wakeTime     String   @map("wake_time") // HH:MM format (required)
  notes        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
  @@map("sleep_entries")
}
```

### Server Functions

- [x] `getSleepEntry()` - Get sleep entry for a specific date
- [x] `saveSleepEntry()` - Create or update sleep entry
- [x] `getSleepHistory()` - Get sleep history for charts
- [x] `getSleepAverage()` - Get average sleep stats
- [x] `deleteSleepEntry()` - Delete a sleep entry

### Acceptance Criteria

- [x] Database migration created and run
- [x] Server functions implemented
- [x] Hook created (`useSleep.ts`)
- [x] Export from server/index.ts and hooks/index.ts
- [x] Sleep page with logging table, analytics, and insights
- [x] LogSleepDialog with edit functionality
- [x] `SleepCard` on dashboard connected to real data
- [x] Quick action to log sleep from dashboard

### Phase 3b: Sleep Page UI

**Status:** [x] Complete
**Route:** `/sleep`

#### Features

1. **Sleep Logging Table**
   - [x] View all sleep entries (sortable by date)
   - [x] Card-based list layout with edit/delete actions
   - [x] Fields: Date, Bedtime, Wake Time, Hours, Quality (1-5 stars)
   - [x] Delete entries with confirmation

2. **Sleep Analytics**
   - [x] Weekly average hours + quality
   - [x] Monthly trend chart
   - [x] Sleep quality insights

3. **Quick Log**
   - [x] Log sleep via modal dialog
   - [x] 12-hour time format with AM/PM selectors
   - [x] Pre-filled with smart defaults

#### Components

- [x] `SleepPage` - Main page layout (`/sleep` route)
- [x] `SleepLogTable` - Card-based list of entries with edit/delete
- [x] `SleepAnalytics` - Charts and insights
- [x] `SleepInsights` - Recommendations
- [x] `LogSleepDialog` - Quick log modal with TanStack Form + Zod validation
- [x] `SleepCard` - Dashboard card with real data

---

## Phase 4: Streaks Caching

**Status:** [x] Complete

### Problem

Streaks were computed on-the-fly by querying diary entries, which was slow and repeated on every page load.

### Solution

Cache streak data in a dedicated table, updated when entries are created.

### Database Schema

```prisma
model UserStreak {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @unique @map("user_id") @db.Uuid

  // Current streaks
  currentLogging  Int      @default(0) @map("current_logging")
  currentCalorie  Int      @default(0) @map("current_calorie")
  currentExercise Int      @default(0) @map("current_exercise")

  // Best streaks (all-time)
  bestLogging     Int      @default(0) @map("best_logging")
  bestCalorie     Int      @default(0) @map("best_calorie")
  bestExercise    Int      @default(0) @map("best_exercise")

  // Last activity dates (for streak calculation)
  lastLoggingDate DateTime? @map("last_logging_date") @db.Date
  lastExerciseDate DateTime? @map("last_exercise_date") @db.Date

  updatedAt       DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_streaks")
}
```

### Acceptance Criteria

- [x] Database migration created
- [x] Streak update logic in diary/exercise server functions
- [x] `getStreaks()` server function
- [x] Streaks dashboard on `/achievements` page
- [x] `StreaksCard` on dashboard connected to real data

---

## Phase 5: Achievements System

**Status:** [x] Complete

### Overview

Gamification system with unlockable achievements based on user actions.

### Database Schema

```prisma
// Achievement definitions (seeded)
model Achievement {
  id          String   @id @default(uuid()) @db.Uuid
  key         String   @unique
  name        String
  description String
  icon        String   // Lucide icon name
  category    String   // "logging", "streaks", "goals", "exercise"
  requirement Json     // { type: "streak", target: 7 }
  points      Int      @default(10)

  userAchievements UserAchievement[]

  @@map("achievements")
}

// User's unlocked achievements
model UserAchievement {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @map("user_id") @db.Uuid
  achievementId String   @map("achievement_id") @db.Uuid
  unlockedAt    DateTime @default(now()) @map("unlocked_at")

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@map("user_achievements")
}
```

### Seeded Achievements (24 total)

| Category | Achievements |
|----------|-------------|
| Logging | First Bite, Food Logger, Centurion Chef, Nutrition Master, Early Bird, Sleep Tracker, Scale Starter |
| Streaks | Week Warrior, Monthly Master, Centurion Logger, Well Rested, Progress Tracker |
| Goals | On Target, Precision Eater, Hydrated, Hydration Hero, 10K Steps, Sweet Dreams |
| Exercise | Getting Moving, Fitness Fanatic, Iron Will, Gym Goer, Fitness Enthusiast, Workout Warrior |

### Acceptance Criteria

- [x] Database models created
- [x] Seed script for achievements (24 achievements)
- [x] Achievement unlock logic
- [x] Achievements page (`/achievements` route)
- [x] Streaks dashboard with current/best streaks
- [x] Achievements gallery with category filters
- [x] `AchievementsCard` on dashboard connected to real data
- [ ] Toast notification on unlock (future enhancement)

### Phase 5b: Achievements & Streaks Page UI

**Status:** [x] Complete
**Route:** `/achievements`

#### Features

1. **Streaks Dashboard**
   - [x] Current streaks (logging, calorie goal, exercise)
   - [x] Best streaks (all-time records)
   - [x] Visual flame/fire indicators
   - [x] Streak cards with current/best display

2. **Achievements Gallery**
   - [x] All achievements grid (locked + unlocked)
   - [x] Filter by category (logging, streaks, goals, exercise)
   - [x] Total points earned
   - [x] Locked achievements shown with dimmed styling

3. **Summary Cards**
   - [x] Total points earned
   - [x] Achievements unlocked count
   - [x] Current streak
   - [x] Best streak

#### Components

- [x] `AchievementsPage` - Main page layout (`/achievements` route)
- [x] `StreaksDashboard` - Current and best streaks with streak cards
- [x] `AchievementsGallery` - Grid of all achievements with category filters
- [x] `AchievementsSummary` - Summary cards (points, unlocked, streaks)
- [x] `AchievementsCard` - Dashboard card with real data
- [x] `StreaksCard` - Dashboard card with real data
- [ ] `StreakCalendar` - Heatmap of activity (future enhancement)
- [ ] `AchievementUnlockToast` - Celebration notification (future enhancement)

---

## Dashboard Integration

**Status:** [x] Complete

New dashboard cards added to display real data:

- [x] `SleepCard` - Last night's sleep (hours, quality, bedtime)
- [x] `StreaksCard` - Current streaks with best records
- [x] `AchievementsCard` - Points, unlocked count, completion percentage
- [x] Quick Action: Log Sleep added to dashboard

---

## Future Enhancements

Items not included in initial scope but planned for future:

- [ ] `StreakCalendar` - GitHub-style heatmap of activity
- [ ] `AchievementUnlockToast` - Celebration notification when unlocking
- [ ] Progress page integration with real sleep/weight data
- [ ] Achievement progress tracking (partial completion display)

---

## Related Documents

- [Mock Data Analysis](../explainations/mock-data-analysis.md) - Current state documentation
- [PRD: Onboarding Flow](./PRD_ONBOARDING_FLOW.md) - User profile data
