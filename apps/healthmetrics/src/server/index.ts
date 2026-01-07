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
  copyDiaryDay,
} from "./diary";

// Exercise server functions
export {
  searchExercises,
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

// Water server functions
export { getWaterIntake, updateWaterIntake, updateWaterGoal } from "./water";

// Step server functions
export { getStepCount, updateStepCount, addSteps } from "./steps";

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
