# PRD: Database Schema Additions

## Overview

Add missing database tables to replace mock data with real data storage. This enables full functionality for features currently using hardcoded or computed values.

---

## Problem Statement

Several features are partially implemented with mock data but lack proper database storage:

| Feature | Current State | Impact |
|---------|--------------|--------|
| Water Tracking | UI works, data not persisted | Users lose water logs on refresh |
| Sleep Tracking | Mock data only | Progress page shows fake data |
| Step Tracking | Mock data only | No real step history |
| Achievements | Mock data only | Gamification not functional |
| Streaks | Computed on-the-fly | Slow, could be cached |

---

## Goals

| Goal | Metric |
|------|--------|
| Persist all tracked data | 0 features using hardcoded returns |
| Enable Progress page real data | Toggle mock data off |
| Support historical analysis | 1 year of data queryable |

---

## Priority Matrix

| Feature | Priority | Effort | Dependency |
|---------|----------|--------|------------|
| Water Tracking | High | Small | None (already has UI) |
| Step Tracking | High | Small | None (already has UI) |
| Sleep Tracking | Medium | Medium | New UI needed |
| Streaks Cache | Low | Small | Computed feature exists |
| Achievements | Low | Large | Gamification system |

---

## Phase 1: Water Tracking (DONE)

**Status:** ✅ Implemented

Already added in previous work:

- `WaterEntry` model in Prisma schema
- `getWaterIntake()` server function
- `updateWaterIntake()` server function
- Dashboard integration

---

## Phase 2: Step Tracking (DONE)

**Status:** ✅ Implemented

Already added in previous work:

- `StepEntry` model in Prisma schema
- `getStepCount()` server function
- `addSteps()` server function
- Dashboard integration

---

## Phase 3: Sleep Tracking

**Status:** Not Started
**Priority:** Medium
**Effort:** Medium (4-6 hours)

### Database Schema

```prisma
model SleepEntry {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  date         DateTime @db.Date
  hoursSlept   Decimal  @map("hours_slept") @db.Decimal(4, 2)
  quality      Int?     // 1-5 rating (optional)
  bedtime      DateTime? @db.Time
  wakeTime     DateTime? @map("wake_time") @db.Time
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

```typescript
// src/server/sleep.ts

export const getSleepEntry = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(async ({ data: { userId, date } }) => {
    const entry = await prisma.sleepEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
    return entry;
  });

export const saveSleepEntry = createServerFn({ method: "POST" })
  .inputValidator((data: {
    userId: string;
    date: string;
    hoursSlept: number;
    quality?: number;
    bedtime?: string;
    wakeTime?: string;
    notes?: string;
  }) => data)
  .handler(async ({ data }) => {
    return await prisma.sleepEntry.upsert({
      where: { userId_date: { userId: data.userId, date: new Date(data.date) } },
      create: { ...data, date: new Date(data.date) },
      update: { ...data },
    });
  });

export const getSleepHistory = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; days: number }) => data)
  .handler(async ({ data: { userId, days } }) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.sleepEntry.findMany({
      where: { userId, date: { gte: startDate } },
      orderBy: { date: "desc" },
    });
  });
```

### UI Components Needed

- [ ] `SleepEntryDialog` - Log sleep for a day
- [ ] `SleepCard` - Already exists, needs real data
- [ ] `SleepChart` - Progress page visualization

### Acceptance Criteria

- [ ] Database migration created and run
- [ ] Server functions implemented
- [ ] Hook created (`useSleep.ts`)
- [ ] Export from server/index.ts and hooks/index.ts
- [ ] `SleepCard` connected to real data
- [ ] Quick action to log sleep

---

## Phase 4: Streaks Caching

**Status:** Not Started
**Priority:** Low
**Effort:** Small (2-3 hours)

### Problem

Streaks are currently computed on-the-fly by querying diary entries. This is:

- Slow for long streak histories
- Repeated on every page load

### Solution

Cache streak data in a dedicated table, updated when entries are created.

### Database Schema

```prisma
model UserStreak {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @unique @map("user_id") @db.Uuid

  // Current streaks
  currentLogging  Int      @default(0) @map("current_logging")   // Days in a row logging food
  currentCalorie  Int      @default(0) @map("current_calorie")   // Days hitting calorie goal
  currentExercise Int      @default(0) @map("current_exercise")  // Days with exercise

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

### Update Logic

```typescript
// Called after creating diary entry
async function updateLoggingStreak(userId: string, date: Date) {
  const streak = await prisma.userStreak.findUnique({ where: { userId } });

  if (!streak) {
    await prisma.userStreak.create({
      data: { userId, currentLogging: 1, lastLoggingDate: date },
    });
    return;
  }

  const daysSinceLastLog = differenceInDays(date, streak.lastLoggingDate);

  if (daysSinceLastLog === 1) {
    // Consecutive day - increment streak
    const newStreak = streak.currentLogging + 1;
    await prisma.userStreak.update({
      where: { userId },
      data: {
        currentLogging: newStreak,
        bestLogging: Math.max(newStreak, streak.bestLogging),
        lastLoggingDate: date,
      },
    });
  } else if (daysSinceLastLog > 1) {
    // Streak broken - reset to 1
    await prisma.userStreak.update({
      where: { userId },
      data: { currentLogging: 1, lastLoggingDate: date },
    });
  }
  // daysSinceLastLog === 0: Same day, no update needed
}
```

### Acceptance Criteria

- [ ] Database migration created
- [ ] Streak update logic in diary/exercise server functions
- [ ] `getStreaks()` server function
- [ ] `StreaksCard` connected to real data

---

## Phase 5: Achievements System

**Status:** Not Started
**Priority:** Low
**Effort:** Large (8-12 hours)

### Overview

Gamification system with unlockable achievements based on user actions.

### Database Schema

```prisma
// Achievement definitions (seeded)
model Achievement {
  id          String   @id @default(uuid()) @db.Uuid
  key         String   @unique  // "first_meal", "streak_7_days", etc.
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

### Achievement Examples

```typescript
const ACHIEVEMENTS = [
  { key: "first_meal", name: "First Bite", description: "Log your first meal", category: "logging" },
  { key: "streak_7", name: "Week Warrior", description: "7-day logging streak", category: "streaks" },
  { key: "streak_30", name: "Monthly Master", description: "30-day logging streak", category: "streaks" },
  { key: "calorie_goal_7", name: "On Target", description: "Hit calorie goal 7 days", category: "goals" },
  { key: "first_workout", name: "Getting Moving", description: "Log your first workout", category: "exercise" },
  { key: "water_goal_7", name: "Hydrated", description: "Hit water goal 7 days", category: "goals" },
];
```

### Acceptance Criteria

- [ ] Database models created
- [ ] Seed script for achievements
- [ ] Achievement unlock logic
- [ ] Toast notification on unlock
- [ ] Achievements page in profile
- [ ] `AchievementsCard` connected to real data

---

## Migration Checklist

### Before Each Phase

- [ ] Create Prisma migration
- [ ] Run migration on dev database
- [ ] Generate Prisma client
- [ ] Test server functions manually

### After Each Phase

- [ ] Update types/index.ts if new types
- [ ] Update hooks/index.ts exports
- [ ] Update server/index.ts exports
- [ ] Remove/update mock data toggle
- [ ] Test full user flow

---

## Environment Variables

```bash
# Progress page mock data toggle (add this)
VITE_USE_MOCK_PROGRESS=true  # Set to false when real data ready
```

---

## Related Documents

- [Mock Data Analysis](../explainations/mock-data-analysis.md) - Current state documentation
- [PRD: Onboarding Flow](./PRD_ONBOARDING_FLOW.md) - User profile data
