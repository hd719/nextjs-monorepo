// Auth server functions
export { fetchUser } from "./auth";

// Dashboard server functions
export {
  getDashboardMeals,
  getRecentActivity,
  getWaterIntake,
} from "./dashboard";

// Diary server functions
export {
  getDiaryDay,
  getDailyTotals,
  searchFoodItems,
  createDiaryEntry,
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

// Weight server functions
export { getLatestWeight, saveWeightEntry } from "./weight";
