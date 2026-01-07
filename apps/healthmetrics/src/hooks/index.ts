// Dashboard hooks
export {
  useDashboardMeals,
  useRecentActivity,
  useWaterIntake,
  useUpdateWaterIntake,
  useStepCount,
  useAddSteps,
} from "./useDashboard";

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
