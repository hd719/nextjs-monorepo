import { z } from "zod";

export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim(),
  question: z
    .string()
    .min(1, "Question is required")
    .min(10, "Question must be at least 10 characters")
    .max(1000, "Question must be less than 1000 characters")
    .trim(),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;
