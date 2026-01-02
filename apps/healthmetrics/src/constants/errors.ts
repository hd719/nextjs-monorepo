// Centralized error messages for authentication

export const AUTH_ERRORS = {
  // Login errors
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  EMAIL_NOT_VERIFIED:
    "Please verify your email before logging in. Check your inbox for the verification link.",
  USER_NOT_FOUND: "No account found with this email address.",

  // Signup errors
  EMAIL_EXISTS: "This email is already registered. Please log in instead.",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  INVALID_EMAIL: "Invalid email address",

  // Verification errors
  TOKEN_INVALID:
    "This verification link is invalid or has expired. Please request a new one.",
  NO_TOKEN: "No verification token found",

  // Password reset errors
  RESET_TOKEN_INVALID:
    "This password reset link is invalid or has expired. Please request a new one.",
  RESET_EMAIL_SENT:
    "If an account exists with this email, you will receive a password reset link shortly.",

  // Generic errors
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  LOGOUT_FAILED: "Failed to log out. Please try again.",
} as const;
