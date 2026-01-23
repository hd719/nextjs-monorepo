// Auth server functions
export { fetchUser } from "./auth";

// Dashboard server functions
export { getDashboardMeals, getRecentActivity } from "./dashboard";

// Diary server functions
export {
  getDiaryDay,
  getDailyTotals,
  searchFoodItems,
  createDiaryEntry,
  createDiaryEntryFromScan,
  copyDiaryDay,
} from "./diary";

// Exercise server functions
export {
  searchExercises,
  getExerciseActivity,
  getWorkoutDay,
  getTodayExerciseSummary,
  createWorkoutSession,
  updateWorkoutSession,
  updateWorkoutLog,
  deleteWorkoutSession,
  deleteWorkoutLog,
  copyPreviousWorkout,
} from "./exercise";

// Profile server functions
export { getUserProfile, updateUserProfile } from "./profile";

// Storage server functions
export { createUploadPostForUser } from "./storage";

// Integrations server functions
export {
  startWhoopOAuth,
  completeWhoopOAuth,
  getWhoopIntegrationStatus,
  triggerWhoopSync,
  disconnectWhoop,
} from "./integrations";

// Water server functions
export { getWaterIntake, updateWaterIntake, updateWaterGoal } from "./water";

// Step server functions
export { getStepCount, updateStepCount, addSteps } from "./steps";

// Sleep server functions
export {
  getSleepEntry,
  getSleepHistory,
  getSleepAverage,
  saveSleepEntry,
  deleteSleepEntry,
} from "./sleep";

// Streak server functions
export {
  getStreaks,
  updateLoggingStreak,
  updateExerciseStreak,
  updateCalorieStreak,
} from "./streaks";

// Achievement server functions
export {
  getAchievements,
  getUserAchievements,
  getAchievementSummary,
  unlockAchievement,
  checkAchievements,
} from "./achievements";

// Weight server functions
export { getLatestWeight, saveWeightEntry, getWeightTrend } from "./weight";

// Onboarding server functions
export {
  getOnboardingState,
  checkOnboardingRequired,
  saveOnboardingStep,
  calculateGoals,
  calculateGoalsFromProfile,
  completeOnboarding,
  skipOnboarding,
  resetOnboarding,
} from "./onboarding";

// Fasting server functions
export {
  getActiveFast,
  getFastingProtocols,
  getFastingHistory,
  getFastingStats,
  getFastingCalendar,
  startFast,
  endFast,
  cancelFast,
  pauseFast,
  resumeFast,
  createCustomProtocol,
  deleteCustomProtocol,
  updateFastingPreferences,
} from "./fasting";

// Barcode server functions
// Note: lookupBarcode calls Go microservice which handles caching + persistence
export { lookupBarcode, recordBarcodeScan, getRecentScans } from "./barcode";
