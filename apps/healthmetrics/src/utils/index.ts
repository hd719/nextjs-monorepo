// Auth utilities
export { getErrorMessage } from "./auth-helpers";

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
  kgToLbs,
  cmToInches,
  getDefaultFormValues,
  buildProfileUpdates,
  validateAvatarFile,
  fileToBase64,
  calculateMacroBreakdown,
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
} from "./profile-validators";

// Query keys
export { queryKeys } from "./query-keys";

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
