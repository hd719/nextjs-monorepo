import { AUTH_ERRORS } from "@/constants/errors";

const ERROR_CODE_MAP: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: AUTH_ERRORS.EMAIL_EXISTS,
  INVALID_CREDENTIALS: AUTH_ERRORS.INVALID_CREDENTIALS,
  EMAIL_NOT_VERIFIED: AUTH_ERRORS.EMAIL_NOT_VERIFIED,
  INVALID_TOKEN: AUTH_ERRORS.TOKEN_INVALID,
  EXPIRED_TOKEN: AUTH_ERRORS.TOKEN_INVALID,
  USER_NOT_FOUND: AUTH_ERRORS.USER_NOT_FOUND,
};

/**
 * Extract user-friendly error messages from Better-Auth errors
 * First checks for structured error codes, then falls back to message matching
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const errorCode = (error as { code: string }).code;
    if (errorCode && errorCode in ERROR_CODE_MAP) {
      return ERROR_CODE_MAP[errorCode];
    }
  }

  // Fallback to message-based matching for unstructured errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("email") && message.includes("already")) {
      return AUTH_ERRORS.EMAIL_EXISTS;
    }
    if (message.includes("invalid") && message.includes("credentials")) {
      return AUTH_ERRORS.INVALID_CREDENTIALS;
    }
    if (message.includes("email") && message.includes("not verified")) {
      return AUTH_ERRORS.EMAIL_NOT_VERIFIED;
    }
    if (
      message.includes("token") &&
      (message.includes("invalid") || message.includes("expired"))
    ) {
      return AUTH_ERRORS.TOKEN_INVALID;
    }
    if (message.includes("user") && message.includes("not found")) {
      return AUTH_ERRORS.USER_NOT_FOUND;
    }

    return error.message;
  }

  return AUTH_ERRORS.UNKNOWN_ERROR;
}
