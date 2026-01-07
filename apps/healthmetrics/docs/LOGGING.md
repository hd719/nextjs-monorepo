# Logging Strategy

This document outlines logging best practices and recommended libraries to replace raw `console.*` statements for production-ready logging.

## Current State

The codebase currently uses `console.log`, `console.warn`, and `console.error` for:
- Development email logging (auth verification, password reset)
- Error logging in server functions
- Debug output during development

## Recommended Libraries

### 1. **Pino** (Recommended for Production)

Fast, low-overhead JSON logger ideal for Node.js servers.

```bash
npm install pino pino-pretty
```

```typescript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development" 
    ? { target: "pino-pretty" } 
    : undefined,
});

// Usage
logger.info({ userId }, "User logged in");
logger.error({ error, userId }, "Failed to update profile");
```

**Pros:**
- Extremely fast (low overhead)
- Structured JSON output (great for log aggregation)
- Built-in log levels
- Easy integration with log management services

---

### 2. **Winston**

Feature-rich logger with multiple transports.

```bash
npm install winston
```

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === "development"
        ? winston.format.simple()
        : winston.format.json(),
    }),
  ],
});

// Usage
logger.info("User logged in", { userId });
logger.error("Failed to update profile", { error, userId });
```

**Pros:**
- Multiple transports (file, console, HTTP, etc.)
- Flexible formatting
- Widely adopted

---

### 3. **Consola** (Good for Dev Experience)

Beautiful console output with minimal setup.

```bash
npm install consola
```

```typescript
import { consola } from "consola";

// Usage
consola.info("Server started on port 3003");
consola.success("User profile updated");
consola.error("Database connection failed", error);
consola.warn("Rate limit approaching");
```

**Pros:**
- Beautiful terminal output
- Zero config needed
- Great for development
- Supports log levels

---

### 4. **@logtail/node** (Cloud-Native)

For sending logs to Logtail/Better Stack.

```bash
npm install @logtail/node
```

```typescript
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

// Usage
logtail.info("User signed up", { userId, email });
logtail.error("Payment failed", { orderId, error: error.message });
```

---

## Implementation Strategy

### Phase 1: Create Logger Utility

Create `src/lib/logger.ts`:

```typescript
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development"
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
});

// Convenience methods with context
export const createLogger = (context: string) => logger.child({ context });
```

### Phase 2: Replace Console Statements

Replace existing console statements:

```typescript
// Before
console.log("User created:", userId);
console.error("Failed to fetch profile:", error);

// After
import { logger } from "@/lib/logger";

logger.info({ userId }, "User created");
logger.error({ error }, "Failed to fetch profile");
```

### Phase 3: Environment-Based Configuration

```env
# .env.development
LOG_LEVEL=debug

# .env.production
LOG_LEVEL=info
```

---

## Log Levels

| Level | Use Case |
|-------|----------|
| `error` | Errors that need immediate attention |
| `warn` | Potential issues, deprecated usage |
| `info` | General operational messages |
| `debug` | Detailed debugging information |
| `trace` | Very detailed tracing (rarely used) |

---

## Best Practices

1. **Always include context** - Add relevant IDs (userId, requestId, etc.)
2. **Don't log sensitive data** - Never log passwords, tokens, or PII
3. **Use structured logging** - Pass objects, not string concatenation
4. **Set appropriate levels** - Use `debug` for dev, `info` for prod
5. **Handle errors properly** - Log the error object, not just the message

```typescript
// ❌ Bad
console.log("User " + userId + " failed to login");

// ✅ Good
logger.warn({ userId, reason: "invalid_password" }, "Login failed");
```

---

## Files to Update

The following files currently use console statements and should be updated:

| File | Console Calls | Priority |
|------|---------------|----------|
| `src/lib/auth-config.ts` | 15 | Medium (dev email logging) |
| `src/server/exercise.ts` | 9 | High |
| `src/server/diary.ts` | 4 | High |
| `src/server/dashboard.ts` | 2 | Medium |
| `src/server/profile.ts` | 2 | Medium |
| `src/server/weight.ts` | 2 | Medium |
| `src/server/auth.ts` | 1 | Low |
