# Mock Data Analysis

Technical documentation of mock data structures and their alignment with the database schema.

---

## Overview

The application uses mock data files for development and UI prototyping:

| File | Purpose |
|------|---------|
| `src/data/mockData.ts` | Dashboard mock data (meals, activities, water, exercise) |
| `src/data/progressMockData.ts` | Progress page analytics (weight, calories, streaks) |

---

## Mock Data Toggle

Dashboard mock data can be activated via environment variable:

```bash
VITE_USE_MOCK_DASHBOARD=true
```

**Files affected:**

- `src/routes/dashboard/index.lazy.tsx` - Data source switching
- `src/components/dashboard/WaterGlass.tsx` - Loading state behavior

> **Note:** The Progress page currently always uses mock data.

---

## Schema Alignment Status

### Fully Implemented (Real Data)

| Feature | Mock Type | Database Model | Server Function |
|---------|-----------|----------------|-----------------|
| User Profile | `UserDisplayProfile` | `User` | `getUserProfile` |
| Meal Entries | `MealEntry` + `FoodItem` | `DiaryEntry` + `FoodItem` | `getDashboardMeals` |
| Exercise Logging | `ExerciseSummary` | `WorkoutSession` + `WorkoutLog` | `getTodayExerciseSummary` |
| Weight Tracking | `Activity` | `WeightEntry` | `getRecentActivity` |
| Daily Summary | `DailySummary` | Computed from `DiaryEntry` | `getDailyTotals` |
| Recent Activity | `Activity[]` | Combined workouts + weights | `getRecentActivity` |
| Water Tracking | `WaterIntake` | `WaterEntry` | `getWaterIntake` |
| Step Tracking | `StepCount` | `StepEntry` | `getStepCount` |

### Mock Data Only (No Database)

| Feature | Mock Type | Notes |
|---------|-----------|-------|
| Sleep Data | `SleepData` | Progress page only |
| Streaks | `Streak` | Could be computed or cached |
| Achievements | `Achievement[]` | Gamification feature |
| Milestones | `Milestone[]` | Goal tracking extension |
| AI Insights | `Insight[]` | Could be computed on-demand |
| Week Comparison | `WeekComparisonData` | Computed from diary data |

---

## Data Structure Transformations

### FoodItem: Database → UI

**Database (normalized per 100g):**

```prisma
model FoodItem {
  id              String  @id
  name            String
  servingSizeG    Decimal // Base serving size
  caloriesPer100g Decimal // Nutrition per 100g
  proteinG        Decimal
  carbsG          Decimal
  fatG            Decimal
}
```

**UI (display-ready):**

```typescript
interface FoodItem {
  id: string;
  name: string;
  quantity: string;     // "1 cup", "200g"
  calories: number;     // Already calculated for quantity
  protein: number;
  carbs: number;
  fat: number;
}
```

**Transformation:** Handled in `getDashboardMeals()`:

```typescript
// Calculate actual values based on quantity
const multiplier = entry.quantityG / 100;
return {
  id: food.id,
  name: food.name,
  quantity: `${entry.quantityG}g`,
  calories: Math.round(Number(food.caloriesPer100g) * multiplier),
  protein: Math.round(Number(food.proteinG) * multiplier),
  carbs: Math.round(Number(food.carbsG) * multiplier),
  fat: Math.round(Number(food.fatG) * multiplier),
};
```

### Activity: Database → UI

**Database (separate models):**

```prisma
model WorkoutSession {
  id          String
  userId      String
  date        DateTime
  totalCalories Int
  // ...
}

model WeightEntry {
  id        String
  userId    String
  date      DateTime
  weightLbs Decimal
}
```

**UI (unified type):**

```typescript
interface Activity {
  id: string;
  type: "exercise" | "weight" | "goal";
  description: string;
  timestamp: string;
  timeAgo: string;      // Pre-formatted for SSR
  calories?: number;
  duration?: string;
}
```

**Transformation:** Handled in `getRecentActivity()`:

```typescript
// Merge workout sessions and weight entries
const workoutActivities = workouts.map(w => ({
  id: w.id,
  type: "exercise" as const,
  description: `${w.workoutLogs.length} exercises`,
  timestamp: w.date.toISOString(),
  timeAgo: formatTimeAgo(w.date),
  calories: w.totalCalories,
}));

const weightActivities = weights.map(w => ({
  id: w.id,
  type: "weight" as const,
  description: `Logged weight: ${w.weightLbs} lbs`,
  timestamp: w.date.toISOString(),
  timeAgo: formatTimeAgo(w.date),
}));

// Merge and sort by timestamp
return [...workoutActivities, ...weightActivities]
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  .slice(0, limit);
```

---

## Mock Data Files

### mockData.ts Exports

```typescript
export const mockUser: UserDisplayProfile
export const mockDailySummary: DailySummary
export const mockMealEntries: MealEntry[]
export const mockActivities: Activity[]
export const mockExerciseSummary: ExerciseSummary
export const mockWaterIntake: WaterIntake
```

### progressMockData.ts Exports

```typescript
export const mockProgressData: ProgressData
export const dashboardProgressData: Partial<ProgressData>
export function filterByDateRange(data: ProgressData, range: DateRange): ProgressData
```

---

## Usage Patterns

### Dashboard Data Switching

```typescript
// src/routes/dashboard/index.lazy.tsx
const useMockDashboard = import.meta.env.VITE_USE_MOCK_DASHBOARD === "true";

const waterData = useMockDashboard
  ? mockWaterIntake
  : (waterIntake ?? { current: 0, goal: 8, date: today });

const mealData = useMockDashboard ? mockMealEntries : meals;
const activityData = useMockDashboard ? mockActivities : activities;
```

### Progress Page (Always Mock)

```typescript
// src/routes/progress/index.lazy.tsx
// Currently no toggle - always uses mock
import { mockProgressData, filterByDateRange } from "@/data/progressMockData";

const filteredData = filterByDateRange(mockProgressData, dateRange);
```

---

## Type Definitions

### Location: `src/types/nutrition.ts`

```typescript
export interface DailySummary {
  date: string;
  calories: { consumed: number; goal: number };
  protein: { consumed: number; goal: number };
  carbs: { consumed: number; goal: number };
  fat: { consumed: number; goal: number };
}

export interface MealEntry {
  id: string;
  type: MealType;
  foods: FoodItem[];
  totalCalories: number;
}

export interface Activity {
  id: string;
  type: "exercise" | "weight" | "goal";
  description: string;
  timestamp: string;
  timeAgo: string;
  calories?: number;
  duration?: string;
}

export interface WaterIntake {
  current: number;
  goal: number;
  date: string;
}

export interface StepCount {
  current: number;
  goal: number;
  date: string;
}
```

### Location: `src/types/progress.ts`

```typescript
export interface ProgressData {
  weightHistory: WeightEntry[];
  calorieHistory: CalorieEntry[];
  macroData: MacroData;
  exerciseHistory: ExerciseEntry[];
  streaks: Streak;
  achievements: Achievement[];
  milestones: Milestone[];
  insights: Insight[];
  weekComparison: WeekComparisonData;
  sleepData: SleepData;
}

export interface Streak {
  currentDays: number;
  longestStreak: number;
  lastLogDate: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}
```

---

## Related Documents

- [PRD: Schema Additions](../prds/PRD_SCHEMA_ADDITIONS.md) - Future database work
- [Health Formulas](./health-formulas.md) - Calculation logic
