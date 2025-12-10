import type { ValidationError } from "@tanstack/react-form";

/**
 * Form Error Utilities
 *
 * Helper functions to extract and format validation error messages
 * from TanStack Form's error objects.
 */

/**
 * Get the first error message from a field's errors array
 *
 * @param errors - Array of validation errors from field.state.meta.errors
 * @returns A clean error message string, or null if no errors
 */
export function getFieldError(errors: ValidationError[]): string | null {
  if (!errors || errors.length === 0) {
    return null;
  }

  const firstError = errors[0];

  // Handle string errors
  if (typeof firstError === "string") {
    return firstError;
  }

  // Handle Zod error objects (Standard Schema format)
  if (firstError && typeof firstError === "object" && "message" in firstError) {
    return (firstError as { message: string }).message;
  }

  // Fallback for unknown error formats
  return "Validation error";
}

/**
 * Check if a field has any errors
 *
 * @param errors - Array of validation errors from field.state.meta.errors
 * @returns true if there are errors, false otherwise
 */
export function hasFieldError(errors: ValidationError[]): boolean {
  return errors && errors.length > 0;
}
