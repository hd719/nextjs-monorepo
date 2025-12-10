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
