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
  SleepData,
  ProgressData,
  DateRange,
  DateRangeOption,
  // Aliases for chart components
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
