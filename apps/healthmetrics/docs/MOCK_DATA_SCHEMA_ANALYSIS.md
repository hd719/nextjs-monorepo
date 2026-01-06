# Mock Data vs Database Schema Analysis

> **Last Updated:** January 2026  
> **Status:** Active Development

This document analyzes the alignment between mock data structures and the Prisma database schema, identifying gaps and providing recommendations.

---

## Overview

The application uses two mock data files for development and UI prototyping:

- `src/data/mockData.ts` - Dashboard mock data (meals, activities, water, exercise)
- `src/data/progressMockData.ts` - Progress page analytics (weight history, calories, streaks, achievements)

Mock data can be activated on the dashboard via environment variable:

```bash
VITE_USE_MOCK_DASHBOARD=true
```

> **Note:** The Progress page currently always uses mock data with no toggle.

---

## Schema Alignment Status

### ✅ Fully Implemented (Real Data Available)

| Feature | Mock Type | Database Model | Server Function |
|---------|-----------|----------------|-----------------|
| User Profile | `UserProfile` | `User` | `useProfile` hook |
| Meal Entries | `MealEntry` + `FoodItem` | `DiaryEntry` + `FoodItem` | `getDashboardMeals` |
| Exercise Logging | `ExerciseSummary` | `WorkoutSession` + `WorkoutLog` | `useExerciseSummary` |
| Weight Tracking | `Activity` (weight) | `WeightEntry` | `getRecentActivity` |
| Daily Summary | `DailySummary` | Computed from `DiaryEntry` + goals | `useDiaryTotals` |
| Recent Activity | `Activity[]` | Combined from workouts + weights | `getRecentActivity` |

### ❌ Missing Database Tables

| Mock Data | Expected Table | Priority | Notes |
|-----------|----------------|----------|-------|
| Water Intake | `WaterEntry` | 🔴 **Critical** | Currently returns hardcoded `{current: 0, goal: 8}` |
| Sleep Data | `SleepEntry` | 🟡 Medium | Progress page feature |
| Steps Data | `StepsEntry` | 🟡 Medium | Could integrate with health APIs |
| Streaks | `UserStreak` | 🟢 Low | Could be computed, but caching helps |
| Achievements | `Achievement` + `UserAchievement` | 🟢 Low | Gamification feature |
| Milestones | `Milestone` + `UserMilestone` | 🟢 Low | Goal tracking extension |
| AI Insights | `Insight` | 🟢 Low | Could be computed on-demand |

---

## Data Structure Differences

### FoodItem: Mock vs Database

**Mock (display-ready):**

```typescript
interface FoodItem {
  id: string;
  name: string;
  quantity: string;      // "1 cup", "200g"
  calories: number;      // Already calculated
  protein: number;
  carbs: number;
  fat: number;
}
```

**Database (normalized per 100g):**

```prisma
model FoodItem {
  id              String
  name            String
  servingSizeG    Decimal    // Base serving size
  caloriesPer100g Decimal    // Nutrition per 100g
  proteinG        Decimal
  carbsG          Decimal
  fatG            Decimal
  // ... additional fields
}
```

**Transformation:** Handled in `getDashboardMeals()` - calculates actual values based on `quantityG`.

### Activity: Mock vs Database

**Mock (unified type):**

```typescript
interface Activity {
  id: string;
  type: "exercise" | "weight" | "goal";
  description: string;
  timestamp: string;
  timeAgo: string;
  calories?: number;
  duration?: string;
}
```

**Database (separate models):**

- `WorkoutSession` + `WorkoutLog` → exercise activities
- `WeightEntry` → weight activities
- `Goal` → goal activities (not yet implemented)

**Transformation:** Handled in `getRecentActivity()` - merges and sorts by timestamp.

---

## Recommended Database Additions

### 1. Water Tracking (Critical)

```prisma
model WaterEntry {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  date      DateTime @db.Date
  glasses   Int      @default(0)  // Number of glasses (8oz each)
  goalGlasses Int    @default(8)  @map("goal_glasses")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
  @@map("water_entries")
}
```

### 2. Sleep Tracking (Medium)

```prisma
model SleepEntry {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  date         DateTime @db.Date
  hoursSlept   Decimal  @map("hours_slept") @db.Decimal(4, 2)
  quality      Int?     // 1-5 rating
  bedtime      DateTime?
  wakeTime     DateTime? @map("wake_time")
  notes        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
  @@map("sleep_entries")
}
```

---

## Environment Configuration

| Variable | Values | Effect |
|----------|--------|--------|
| `VITE_USE_MOCK_DASHBOARD` | `"true"` / `"false"` | Toggles mock data for dashboard components |

**Files affected:**

- `src/routes/dashboard/index.tsx` - Water, meals, activities
- `src/components/dashboard/WaterGlass.tsx` - Loading state behavior

---

## Migration Path

1. **Phase 1:** Add `WaterEntry` table, implement `getWaterIntake()` properly
2. **Phase 2:** Add toggle for Progress page mock data
3. **Phase 3:** Implement remaining tables (sleep, steps) as features are built
4. **Phase 4:** Add achievements/gamification system

---

## Related Documentation

- [Authentication](./AUTHENTICATION.md)
- [Nutrition Project Plan](./NUTRITION_PROJECT_PLAN.md)
