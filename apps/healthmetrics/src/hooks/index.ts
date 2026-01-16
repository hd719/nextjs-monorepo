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
  useCreateDiaryEntryFromScan,
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

// Fasting hooks
export {
  useActiveFast,
  useFastingProtocols,
  useFastingHistory,
  useFastingStats,
  useFastingCalendar,
  useStartFast,
  useEndFast,
  useCancelFast,
  usePauseFast,
  useResumeFast,
  useCreateCustomProtocol,
  useDeleteCustomProtocol,
} from "./useFasting";

// Scanner hooks
export {
  useBarcodeLookup,
  usePrimeBarcodeCache,
  barcodeQueryKeys,
} from "./useBarcodeLookup";
export { useScannerDialog } from "./useScannerDialog";
export { useRecentlyScanned } from "./useRecentlyScanned";
export type { RecentlyScannedItem } from "./useRecentlyScanned";
export { useCameraPermission } from "./useCameraPermission";
export type { CameraPermissionStatus } from "./useCameraPermission";
export { useScreenReaderAnnounce } from "./useScreenReaderAnnounce";
export { useNetworkStatus } from "./useNetworkStatus";
export { useOfflineBarcodeQueue } from "./useOfflineBarcodeQueue";
