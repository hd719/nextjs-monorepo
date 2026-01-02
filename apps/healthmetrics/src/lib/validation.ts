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
    errorMap: () => ({ message: "Invalid meal type" }),
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
  heightInches: z.number().min(36).max(96).optional(), // Height in inches (3ft - 8ft)
  currentWeightLbs: z.number().min(50).max(1000).optional(), // Weight in pounds (50-1000 lbs)
  currentWeightKg: z.number().min(23).max(454).optional(), // Weight in kg
  targetWeightLbs: z.number().min(50).max(1000).optional(), // Target weight in pounds
  targetWeightKg: z.number().min(23).max(454).optional(), // Target weight in kg
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
