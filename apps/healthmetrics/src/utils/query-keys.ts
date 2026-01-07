// TanStack Query key factory
// Centralized query keys for consistent cache management
// Uses nested pattern: [feature, action, ...params] for better organization

export const queryKeys = {
  // Profile
  profile: (userId: string) => ["profile", "detail", userId] as const,
  profileBase: () => ["profile"] as const,

  // Diary
  diaryDay: (userId: string, date: string) =>
    ["diary", "day", userId, date] as const,
  diaryDayBase: () => ["diary"] as const,
  diaryTotals: (userId: string, date: string) =>
    ["diary", "totals", userId, date] as const,
  diaryTotalsBase: () => ["diary"] as const,

  // Food search
  foodSearch: (query: string) => ["food", "search", query] as const,
  foodSearchBase: () => ["food"] as const,

  // Exercise
  exerciseSearch: (query: string, category?: string) =>
    ["exercise", "search", query, category] as const,
  exerciseSearchBase: () => ["exercise"] as const,
  exerciseSummary: (userId: string, date: string) =>
    ["exercise", "summary", userId, date] as const,
  exerciseSummaryBase: () => ["exercise"] as const,
  workoutDay: (userId: string, date: string) =>
    ["exercise", "workout", userId, date] as const,
  workoutDayBase: () => ["exercise"] as const,

  // Dashboard
  dashboardMeals: (userId: string, date: string) =>
    ["dashboard", "meals", userId, date] as const,
  dashboardMealsBase: () => ["dashboard"] as const,
  recentActivity: (userId: string, limit: number) =>
    ["dashboard", "activity", userId, limit] as const,
  recentActivityBase: (limit: number) =>
    ["dashboard", "activity", limit] as const,

  // Water
  waterIntake: (userId: string, date: string) =>
    ["water", "intake", userId, date] as const,
  waterIntakeBase: () => ["water"] as const,

  // Steps
  stepCount: (userId: string, date: string) =>
    ["steps", "count", userId, date] as const,
  stepCountBase: () => ["steps"] as const,

  // Weight
  weightLatest: (userId: string) => ["weight", "latest", userId] as const,
  weightHistory: (userId: string, limit?: number) =>
    ["weight", "history", userId, limit] as const,
  weightTrend: (userId: string, days?: number) =>
    ["weight", "trend", userId, days] as const,
  weightBase: () => ["weight"] as const,

  // Onboarding
  onboardingState: (userId: string) => ["onboarding", "state", userId] as const,
  onboardingBase: () => ["onboarding"] as const,
};
