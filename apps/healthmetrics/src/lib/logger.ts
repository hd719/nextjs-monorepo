import pino from "pino";

// Determine log level based on environment
const getLogLevel = (): string => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
};

// Base logger configuration
export const logger = pino({
  level: getLogLevel(),

  // Pretty print in development only
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,

  // Base context included in all logs
  base: {
    env: process.env.NODE_ENV,
    app: "healthmetrics",
  },

  // Redact sensitive fields automatically
  redact: {
    paths: [
      "password",
      "token",
      "authorization",
      "cookie",
      "secret",
      "*.password",
      "*.token",
      "*.secret",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },
});

/**
 * Create a child logger with context
 *
 * Use this to create module-specific loggers with automatic context.
 *
 */
export function createLogger(context: string) {
  return logger.child({ context });
}

// Pre-configured loggers for common modules
export const serverLog = createLogger("server");
export const authLog = createLogger("auth");
export const dbLog = createLogger("database");

// Type export for consumers
export type Logger = typeof logger;
