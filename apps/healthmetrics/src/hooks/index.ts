// Dashboard hooks
export { useDashboardMeals, useRecentActivity } from "./useDashboard";

// Water hooks
export { useWaterIntake, useUpdateWaterIntake } from "./useWater";

// Steps hooks
export { useStepCount, useAddSteps } from "./useSteps";

// Sleep hooks
export {
  useSleepEntry,
  useSleepHistory,
  useSleepAverage,
  useSaveSleepEntry,
} from "./useSleep";

// Streak hooks
export {
  useStreaks,
  useUpdateLoggingStreak,
  useUpdateExerciseStreak,
} from "./useStreaks";

// Achievement hooks
export {
  useAchievementDefinitions,
  useUserAchievements,
  useAchievementSummary,
  useUnlockAchievement,
  useCheckAchievements,
} from "./useAchievements";

// Diary hooks
export {
  useDiaryDay,
  useDiaryTotals,
  useFoodSearch,
  useCreateDiaryEntry,
  useCopyDiaryDay,
} from "./useDiary";

// Exercise hooks
export {
  useExerciseSummary,
  useCreateWorkoutSession,
  useExerciseSearch,
} from "./useExercise";

// Profile hooks
export { useProfile, useUpdateProfile } from "./useProfile";

// Weight hooks
export { useLatestWeight, useSaveWeight, useWeightTrend } from "./useWeight";

// Onboarding hooks
export {
  useOnboardingState,
  useSaveOnboardingStep,
  useCalculateGoals,
  useCompleteOnboarding,
  useSkipOnboarding,
  useResetOnboarding,
  useOnboardingWizard,
} from "./useOnboarding";

// Goal calculation hook
export { useGoalCalculation } from "./useGoalCalculation";
