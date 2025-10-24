// PostgreSQL Error Codes
export const DB_ERROR_CODES = {
  UNIQUE_VIOLATION: "23505", // Unique constraint violation
  FOREIGN_KEY_VIOLATION: "23503", // Foreign key constraint violation
  NOT_NULL_VIOLATION: "23502", // Not null constraint violation
  CHECK_VIOLATION: "23514", // Check constraint violation
} as const;

// HTTP Status Codes (for consistency)
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Recipe-specific constants
export const RECIPE_CONSTANTS = {
  MAX_SLUG_ATTEMPTS: 5, // Max numbered slug attempts before timestamp
  MAX_TITLE_LENGTH: 100, // Max recipe title length
  MAX_DESCRIPTION_LENGTH: 500, // Max recipe description length
  DEFAULT_PAGE_SIZE: 10, // Default pagination size
  MAX_PAGE_SIZE: 100, // Maximum pagination size
} as const;

// Validation messages
export const ERROR_MESSAGES = {
  RECIPE_NOT_FOUND: "Recipe not found",
  RECIPE_ACCESS_DENIED: "Recipe not found or access denied",
  DUPLICATE_SLUG: "Recipe with this slug already exists",
  AUTHENTICATION_REQUIRED: "Authentication required",
  INVALID_JSON: "Invalid JSON in request body",
  INVALID_RECIPE_DATA: "Invalid recipe data",
  FAILED_TO_CREATE: "Failed to create recipe",
  FAILED_TO_UPDATE: "Failed to update recipe",
  FAILED_TO_DELETE: "Failed to delete recipe",
  FAILED_TO_GENERATE_SLUG: "Failed to generate unique slug",
  INTERNAL_SERVER_ERROR: "Internal server error",
} as const;

export type DbErrorCode = (typeof DB_ERROR_CODES)[keyof typeof DB_ERROR_CODES];
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
