// TanStack Query key factory
// Centralized query keys for consistent cache management

export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  profileBase: () => ["profile"] as const,
  diaryDay: (userId: string, date: string) =>
    ["diaryDay", userId, date] as const,
  diaryDayBase: () => ["diaryDay"] as const,
  diaryTotals: (userId: string, date: string) =>
    ["diaryTotals", userId, date] as const,
  diaryTotalsBase: () => ["diaryTotals"] as const,
  foodSearch: (query: string) => ["foodSearch", query] as const,
  foodSearchBase: () => ["foodSearch"] as const,
  exerciseSearch: (query: string, category?: string) =>
    ["exercises", "search", query, category] as const,
  exerciseSearchBase: () => ["exercises", "search"] as const,
  exerciseSummary: (userId: string, date: string) =>
    ["exerciseSummary", userId, date] as const,
  workoutDay: (userId: string, date: string) =>
    ["workoutDay", userId, date] as const,
  exerciseSummaryBase: () => ["exerciseSummary"] as const,
  workoutDayBase: () => ["workoutDay"] as const,
  dashboardMeals: (userId: string, date: string) =>
    ["dashboardMeals", userId, date] as const,
  dashboardMealsBase: () => ["dashboardMeals"] as const,
  recentActivity: (userId: string, limit: number) =>
    ["recentActivity", userId, limit] as const,
  recentActivityBase: (limit: number) => ["recentActivity", limit] as const,
  waterIntake: (userId: string, date: string) =>
    ["waterIntake", userId, date] as const,
  waterIntakeBase: () => ["waterIntake"] as const,
  // Weight queries
  weightLatest: (userId: string) => ["weight", "latest", userId] as const,
  weightHistory: (userId: string, limit?: number) =>
    ["weight", "history", userId, limit] as const,
  weightBase: () => ["weight"] as const,
};
