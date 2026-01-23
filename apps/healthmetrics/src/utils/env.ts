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
  // AWS (optional in dev, required in prod for email/storage)
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  AWS_REGION: z.string().min(1).optional(),
  S3_BUCKET_NAME: z.string().min(1).optional(),
  CLOUDFRONT_URL: z.string().url().optional(),
  CLOUDFRONT_KEY_PAIR_ID: z.string().min(1).optional(),
  CLOUDFRONT_PRIVATE_KEY: z.string().min(1).optional(),
  SES_REGION: z.string().min(1).optional(),
  SES_FROM_EMAIL: z.string().email().optional(),
  SES_CONFIGURATION_SET: z.string().min(1).optional(),
  EMAIL_DELIVERY_MODE: z.enum(["log", "ses"]).optional(),
  // WHOOP integration
  WHOOP_CLIENT_ID: z.string().min(1).optional(),
  WHOOP_REDIRECT_URL: z.string().url().optional(),
  // Go service configuration (barcode + integrations)
  GO_SERVICE_URL: z.string().url().optional(),
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
      `Environment validation failed. Check your .env file.\n${errors}`,
    );
  }

  if (result.data.NODE_ENV === "production") {
    const required = [
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "AWS_REGION",
      "S3_BUCKET_NAME",
      "CLOUDFRONT_URL",
      "CLOUDFRONT_KEY_PAIR_ID",
      "CLOUDFRONT_PRIVATE_KEY",
      "SES_REGION",
      "SES_FROM_EMAIL",
    ] as const;

    const missing = required.filter((key) => !result.data[key as keyof Env]);

    if (missing.length > 0) {
      throw new Error(
        `Environment validation failed. Missing: ${missing.join(", ")}`,
      );
    }
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
