// Auth utilities
export { getErrorMessage } from "./auth-helpers";

// Environment validation
export {
  validateEnv,
  getEnv,
  isProduction,
  isDevelopment,
  isTest,
  type Env,
} from "./env";

// Class name utility
export { cn } from "./cn";

// Exercise utilities
export {
  calculateCalories,
  estimateStrengthDuration,
  getUserWeightLbs,
  validateExerciseRequirements,
} from "./exercise-helpers";

// Form utilities
export { getFieldError, hasFieldError } from "./form-errors";

// Profile utilities
export {
  formatDate,
  formatKgToLbs,
  cmToInches,
  getDefaultFormValues,
  buildProfileUpdates,
  validateAvatarFile,
  fileToBase64,
  calculateMacroBreakdown,
  calculateProfileCompletion,
} from "./profile-helpers";

// Profile form validators (TanStack Form)
export {
  displayNameValidator,
  heightValidator,
  weightValidator,
  calorieGoalValidator,
  proteinGoalValidator,
  carbGoalValidator,
  fatGoalValidator,
  waterGoalValidator,
  stepGoalValidator,
} from "./profile-validators";

// Nutrition calculator
export {
  calculateBMR,
  calculateTDEE,
  calculateCalorieGoal,
  calculateMacros,
  lbsToKg,
  kgToLbs,
  feetInchesToCm,
  cmToFeetInches,
  calculateAge,
  calculateNutritionGoals,
} from "./nutrition-calculator";

// Query keys
export { queryKeys } from "./query-keys";

// Route guards
export { requireAuthAndOnboarding, requireAuth } from "./route-guards";

// Sleep utilities
export { toSleepCardData } from "./sleep-helpers";

// Time utilities
export { formatDuration, formatDurationLong } from "./time-helpers";

// Validation schemas and types (Zod)
export {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createDiaryEntrySchema,
  searchFoodItemsSchema,
  updateUserProfileSchema,
  searchExercisesSchema,
  createWorkoutSessionSchema,
  updateWorkoutSessionSchema,
  updateWorkoutLogSchema,
  deleteWorkoutSessionSchema,
  deleteWorkoutLogSchema,
  getWorkoutDaySchema,
  getTodayExerciseSummarySchema,
  copyPreviousWorkoutSchema,
  type LoginFormData,
  type SignupFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
  type CreateDiaryEntryInput,
  type SearchFoodItemsInput,
  type UpdateUserProfileInput,
  type SearchExercisesInput,
  type CreateWorkoutSessionInput,
  type UpdateWorkoutSessionInput,
  type UpdateWorkoutLogInput,
  type DeleteWorkoutSessionInput,
  type DeleteWorkoutLogInput,
  type GetWorkoutDayInput,
  type GetTodayExerciseSummaryInput,
  type CopyPreviousWorkoutInput,
} from "./validation";
