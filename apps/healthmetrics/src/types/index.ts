// Auth types
export type {
  LoginCredentials,
  SignupData,
  AuthError,
  UserSession,
  AuthResponse,
} from "./auth";

// Diary types
export type {
  DiaryEntryWithFood,
  DailyTotals,
  FoodItemSearchResult,
} from "./diary";

// Exercise types
export type {
  ExerciseCategory,
  Exercise,
  WorkoutLog,
  WorkoutSession,
  ExerciseSummary,
  ExerciseSearchResult,
} from "./exercise";

// Nutrition types (UI/display types)
export type {
  DailySummary,
  FoodItem,
  MealEntry,
  Activity,
  UserDisplayProfile,
} from "./nutrition";

// Water types
export type { WaterIntake } from "./water";

// Steps types
export type { StepCount } from "./steps";

// Sleep types
export type {
  SleepEntry,
  SleepData,
  SleepCardData,
  SaveSleepInput,
  SleepHistoryEntry,
} from "./sleep";
export { DEFAULT_SLEEP_GOAL } from "./sleep";

// Streak types
export type { UserStreaks, StreakUpdate } from "./streaks";

// Achievement types
export type {
  AchievementCategory,
  AchievementDefinition,
  AchievementRequirement,
  UserAchievementData,
  AchievementProgress,
  AchievementSummary,
} from "./achievements";
export {
  ACHIEVEMENT_DEFINITIONS,
  achievementRequirementSchema,
  parseAchievementRequirement,
} from "./achievements";

// Profile types (server/database types)
export type { UserProfile } from "./profile";

// Progress types
export type {
  ProgressWeightEntry,
  CalorieEntry,
  MacroData,
  ProgressExerciseEntry,
  Streak,
  Achievement,
  Milestone,
  Insight,
  WeekComparisonData,
  ProgressSleepData,
  ProgressData,
  DateRange,
  DateRangeOption,
  WeightEntry as ProgressChartWeightEntry,
  ExerciseEntry,
} from "./progress";

// Weight types
export type { WeightEntry } from "./weight";

// Onboarding types
export type {
  OnboardingGoalType,
  Gender,
  ActivityLevel,
  UnitsPreference,
  OnboardingStepData,
  OnboardingState,
  NutritionCalculationInput,
  NutritionGoals,
  SaveOnboardingStepInput,
} from "./onboarding";

// Fasting types
export type {
  FastingStatus,
  FastingProtocol,
  FastingProtocolOption,
  FastingSession,
  ActiveFast,
  FastingStats,
  FastingHistoryEntry,
  FastingCalendarDay,
  StartFastInput,
  EndFastInput,
  CreateProtocolInput,
  UpdateFastingPreferencesInput,
  FastingTimerState,
  FastingTimerDisplay,
} from "./fasting";
