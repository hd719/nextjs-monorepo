import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url().optional(),
  APP_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .optional(),
  // Barcode service configuration
  BARCODE_SERVICE_URL: z.string().url().optional(),
  BARCODE_SERVICE_API_KEY: z.string().min(32).optional(),
  // Mock data flags
  VITE_USE_MOCK_DASHBOARD: z.string().optional(),
  VITE_USE_MOCK_ACHIEVEMENTS: z.string().optional(),
  VITE_USE_MOCK_BARCODE: z.string().optional(),
  VITE_SIMULATE_SCANNER_OFFLINE: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables at startup
 *
 * Throws an error with detailed messages if required variables
 * are missing or invalid. Call this early in app initialization.
 *
 * @returns Validated environment object
 * @throws Error if validation fails
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error("Environment validation failed:\n" + errors);

    throw new Error(
      `Environment validation failed. Check your .env file.\n${errors}`
    );
  }

  return result.data;
}

/**
 * Get validated environment variables
 *
 * Returns the validated environment object. Safe to call multiple times.
 * On first call, validates and caches the result.
 */
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === "development";
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === "test";
}
