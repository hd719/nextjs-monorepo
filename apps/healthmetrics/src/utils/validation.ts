import { z } from "zod";
import { AUTH_ERRORS } from "@/constants/errors";

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email(AUTH_ERRORS.INVALID_EMAIL),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup validation schema
export const signupSchema = z
  .object({
    email: z.string().email(AUTH_ERRORS.INVALID_EMAIL),
    password: z.string().min(8, AUTH_ERRORS.PASSWORD_TOO_SHORT),
    confirmPassword: z.string().min(8, AUTH_ERRORS.PASSWORD_TOO_SHORT),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_ERRORS.PASSWORDS_DONT_MATCH,
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().email(AUTH_ERRORS.INVALID_EMAIL),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset password validation schema
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, AUTH_ERRORS.PASSWORD_TOO_SHORT),
    confirmPassword: z.string().min(8, AUTH_ERRORS.PASSWORD_TOO_SHORT),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_ERRORS.PASSWORDS_DONT_MATCH,
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Diary entry validation schema
export const createDiaryEntrySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  foodItemId: z.string().uuid("Invalid food item ID"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "other"], {
    message: "Invalid meal type",
  }),
  quantityG: z
    .number()
    .min(0, "Quantity must be positive")
    .max(10000, "Quantity too large"),
  servings: z.number().min(0).max(100).optional(),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

export type CreateDiaryEntryInput = z.infer<typeof createDiaryEntrySchema>;

// Food item search validation
export const searchFoodItemsSchema = z.object({
  query: z.string().min(1, "Search query is required").max(100),
  limit: z.number().min(1).max(50).optional().default(10),
});

export type SearchFoodItemsInput = z.infer<typeof searchFoodItemsSchema>;

// User profile validation schema
export const updateUserProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  timezone: z.string().optional(),
  dailyCalorieGoal: z.number().min(500).max(10000).optional(),
  dailyProteinGoalG: z.number().min(0).max(500).optional(),
  dailyCarbGoalG: z.number().min(0).max(1000).optional(),
  dailyFatGoalG: z.number().min(0).max(300).optional(),
  dailyWaterGoal: z.number().min(1).max(20).optional(),
  dailyStepGoal: z.number().min(1000).max(50000).optional(),
  heightInches: z.number().min(36).max(96).optional(),
  currentWeightLbs: z.number().min(50).max(1000).optional(), // Weight in pounds (50-1000 lbs)
  targetWeightLbs: z.number().min(50).max(1000).optional(), // Target weight in pounds
  dateOfBirth: z.string().optional(), // ISO date string
  gender: z.enum(["male", "female", "other"]).optional(),
  activityLevel: z
    .enum([
      "sedentary",
      "lightly_active",
      "moderately_active",
      "very_active",
      "extremely_active",
    ])
    .optional(),
  goalType: z
    .enum(["lose_weight", "maintain_weight", "gain_weight", "build_muscle"])
    .optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

// ============================================================================
// EXERCISE VALIDATION SCHEMAS
// ============================================================================

// Reusable schema for optional strings that treats empty strings as undefined
const optionalString = (maxLength = 100) =>
  z
    .string()
    .max(maxLength)
    .optional()
    .transform((val) => (val === "" ? undefined : val));

// Exercise search validation
export const searchExercisesSchema = z.object({
  query: optionalString(100),
  category: z
    .enum(["cardio", "strength", "flexibility", "sports", "other"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  limit: z.number().min(1).max(50).default(20),
});

export type SearchExercisesInput = z.infer<typeof searchExercisesSchema>;

// Base exercise input schema (without category-specific refinements)
const baseExerciseInputSchema = z.object({
  exerciseId: z.string().uuid("Invalid exercise ID"),
  category: z.enum(["cardio", "strength", "flexibility", "sports", "other"]),
  // Cardio fields
  durationMinutes: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 10 hours")
    .optional(),
  distanceKm: z
    .number()
    .min(0, "Distance must be positive")
    .max(500, "Distance too large")
    .optional(),
  // Strength fields
  sets: z
    .number()
    .min(1, "Sets must be at least 1")
    .max(50, "Sets cannot exceed 50")
    .optional(),
  reps: z
    .number()
    .min(1, "Reps must be at least 1")
    .max(500, "Reps cannot exceed 500")
    .optional(),
  weightLbs: z
    .number()
    .min(0, "Weight must be positive")
    .max(2000, "Weight too large")
    .optional(),
  // Common
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

// Exercise input schema with category-specific refinements
const exerciseInputSchema = baseExerciseInputSchema
  .refine(
    (data) => {
      // Cardio requires duration
      if (data.category === "cardio") {
        return data.durationMinutes !== undefined && data.durationMinutes > 0;
      }
      return true;
    },
    {
      message: "Duration is required for cardio exercises",
      path: ["durationMinutes"],
    }
  )
  .refine(
    (data) => {
      // Strength requires sets and reps
      if (data.category === "strength") {
        return (
          data.sets !== undefined &&
          data.sets > 0 &&
          data.reps !== undefined &&
          data.reps > 0
        );
      }
      return true;
    },
    {
      message: "Sets and reps are required for strength exercises",
      path: ["sets"],
    }
  )
  .refine(
    (data) => {
      // Flexibility, sports, and other require duration
      if (
        data.category === "flexibility" ||
        data.category === "sports" ||
        data.category === "other"
      ) {
        return data.durationMinutes !== undefined && data.durationMinutes > 0;
      }
      return true;
    },
    {
      message: "Duration is required for this exercise type",
      path: ["durationMinutes"],
    }
  );

// Workout session creation validation
export const createWorkoutSessionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  sessionType: z.enum(["quick", "full"]).default("full"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  exercises: z
    .array(exerciseInputSchema)
    .min(1, "At least one exercise required"),
});

export type CreateWorkoutSessionInput = z.infer<
  typeof createWorkoutSessionSchema
>;

// Workout session update validation
export const updateWorkoutSessionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  userId: z.string().min(1, "User ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  sessionType: z.enum(["quick", "full"]).optional(),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  exercises: z.array(exerciseInputSchema).min(1).optional(),
});

export type UpdateWorkoutSessionInput = z.infer<
  typeof updateWorkoutSessionSchema
>;

// Workout log update validation
export const updateWorkoutLogSchema = z.object({
  logId: z.string().uuid("Invalid log ID"),
  userId: z.string().min(1, "User ID is required"),
  exerciseId: z.string().uuid("Invalid exercise ID").optional(),
  category: z
    .enum(["cardio", "strength", "flexibility", "sports", "other"])
    .optional(),
  durationMinutes: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 10 hours")
    .optional(),
  distanceKm: z
    .number()
    .min(0, "Distance must be positive")
    .max(500, "Distance too large")
    .optional(),
  sets: z
    .number()
    .min(1, "Sets must be at least 1")
    .max(50, "Sets cannot exceed 50")
    .optional(),
  reps: z
    .number()
    .min(1, "Reps must be at least 1")
    .max(500, "Reps cannot exceed 500")
    .optional(),
  weightLbs: z
    .number()
    .min(0, "Weight must be positive")
    .max(2000, "Weight too large")
    .optional(),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

export type UpdateWorkoutLogInput = z.infer<typeof updateWorkoutLogSchema>;

// Delete workout session validation
export const deleteWorkoutSessionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  userId: z.string().min(1, "User ID is required"),
});

export type DeleteWorkoutSessionInput = z.infer<
  typeof deleteWorkoutSessionSchema
>;

// Delete workout log validation
export const deleteWorkoutLogSchema = z.object({
  logId: z.string().uuid("Invalid log ID"),
  userId: z.string().min(1, "User ID is required"),
});

export type DeleteWorkoutLogInput = z.infer<typeof deleteWorkoutLogSchema>;

// Get workout day validation
export const getWorkoutDaySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type GetWorkoutDayInput = z.infer<typeof getWorkoutDaySchema>;

// Get today's exercise summary validation
export const getTodayExerciseSummarySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type GetTodayExerciseSummaryInput = z.infer<
  typeof getTodayExerciseSummarySchema
>;

// Copy previous workout validation
export const copyPreviousWorkoutSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type CopyPreviousWorkoutInput = z.infer<
  typeof copyPreviousWorkoutSchema
>;
