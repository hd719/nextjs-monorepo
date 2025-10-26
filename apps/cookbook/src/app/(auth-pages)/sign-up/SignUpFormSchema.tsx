import { z } from "zod";

export const schema = z
  .object({
    first: z.string().trim().min(1, {
      message: "First name is required",
    }),
    last: z.string().trim().min(1, {
      message: "Last name is required",
    }),
    email: z.string().email({
      message: "Invalid email address",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
    confirmPassword: z.string().min(1, {
      message: "Please confirm your password",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
