# PRD: Production Logging System

> **Status:** Phase 1 Complete

## Overview

Replace raw `console.*` statements with a structured, production-ready logging system that provides better debugging, monitoring, and observability.

---

## Problem Statement

The codebase currently uses 57 `console.log`, `console.warn`, and `console.error` statements scattered across 16 files. This approach has several issues:

1. **No log levels** - Cannot filter logs by severity
2. **No structured data** - Logs are unstructured strings, hard to parse
3. **No timestamps** - Difficult to correlate events
4. **No context** - Missing request IDs, user IDs for tracing
5. **No centralization** - Logs only visible in server console
6. **Production noise** - Debug logs appear in production

---

## Goals

| Goal | Metric |
|------|--------|
| Replace all console statements | 0 raw console.* calls in src/ |
| Structured JSON logging | All logs parseable as JSON |
| Environment-based filtering | Different log levels per environment |
| Request tracing | All logs include correlation ID |
| Zero performance impact | < 1ms overhead per log call |

---

## Non-Goals

- Log aggregation service integration (future phase)
- Client-side logging (browser)
- Analytics/metrics collection

---

## Technical Decision

### Recommended: Pino

After evaluating options, **Pino** is recommended for this project:

| Library | Speed | Structured | Size | SSR Compatible |
|---------|-------|------------|------|----------------|
| **Pino** | Fastest | Yes | 150KB | Yes |
| Winston | Slow | Yes | 500KB | Yes |
| Consola | Medium | Partial | 50KB | Yes |

**Why Pino:**

- 5x faster than Winston
- Native JSON output
- Built for Node.js/SSR
- Easy Logtail/Datadog integration later
- `pino-pretty` for beautiful dev output

---

## Implementation Plan

### Phase 1: Logger Setup [x] COMPLETE

**Status:** Done
**Completed:** January 2026

#### What Was Implemented

- [x] Installed `pino` and `pino-pretty` dependencies
- [x] Created `src/lib/logger.ts` with:
  - Environment-based log levels (debug in dev, info in prod)
  - Pretty printing in development
  - JSON output in production
  - Automatic sensitive field redaction
  - Child logger pattern with `createLogger()`
  - Pre-configured loggers: `serverLog`, `authLog`, `dbLog`
- [x] Exported from `src/lib/index.ts` barrel

#### Usage

```typescript
import { createLogger } from "@/lib";

const log = createLogger("server:diary");

log.info({ userId, date }, "Creating diary entry");
log.error({ err: error, userId }, "Failed to create entry");
log.warn({ attempts: 5 }, "Rate limit approaching");
```

---

### Phase 2: Server Function Migration (1-2 hours)

**Priority:** High
**Effort:** Medium

Replace console statements in server functions with structured logging.

#### Migration Pattern

```typescript
// BEFORE
console.log("Creating diary entry for user:", userId);
console.error("Failed to create diary entry:", error);

// AFTER
import { createLogger } from "@/lib/logger";
const log = createLogger("server:diary");

log.info({ userId, date, mealType }, "Creating diary entry");
log.error({ err: error, userId }, "Failed to create diary entry");
```

#### Files to Migrate (Priority Order)

| File | Console Calls | Priority | Reason |
|------|---------------|----------|--------|
| `src/server/onboarding.ts` | 8 | High | Core user flow |
| `src/server/exercise.ts` | 9 | High | Frequent errors |
| `src/server/diary.ts` | 5 | High | Core feature |
| `src/server/weight.ts` | 3 | Medium | Simple CRUD |
| `src/server/water.ts` | 3 | Medium | Simple CRUD |
| `src/server/steps.ts` | 3 | Medium | Simple CRUD |
| `src/server/profile.ts` | 2 | Medium | Settings |
| `src/server/dashboard.ts` | 2 | Medium | Read-only |
| `src/server/auth.ts` | 1 | Low | Minimal logging |

---

### Phase 3: Auth Logging (30 min)

**Priority:** Medium
**Effort:** Small

Special handling for auth-related logs (email verification, password reset).

#### Auth Logger Pattern

```typescript
// src/lib/auth-config.ts
import { createLogger } from "@/lib/logger";
const authLog = createLogger("auth");

// Email verification
emailVerification: {
  sendVerificationEmail: async ({ user, token }) => {
    const url = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    // Development: Log full details
    if (process.env.NODE_ENV === "development") {
      authLog.info({
        type: "verification_email",
        to: user.email,
        url,
      }, "Verification email (dev mode)");
    } else {
      // Production: Log only event, not sensitive data
      authLog.info({
        type: "verification_email",
        userId: user.id,
      }, "Verification email sent");
    }
  },
}
```

---

### Phase 4: Component Error Logging (30 min)

**Priority:** Low
**Effort:** Small

Replace console statements in React components.

#### Files to Update

| File | Console Calls | Notes |
|------|---------------|-------|
| `src/components/dev/DevTools.tsx` | 1 | Dev-only, can keep |
| `src/components/profile/ProfileForm.tsx` | 1 | Error boundary |
| `src/components/diary/AddFoodDialog.tsx` | 1 | Error handling |
| `src/components/exercise/WorkoutReview.tsx` | 1 | Error handling |
| `src/components/layout/ProfileMenu.tsx` | 1 | Logout error |
| `src/hooks/useGoalCalculation.ts` | 1 | Calculation error |

#### Pattern for Components

```typescript
// Components should use error boundaries + minimal logging
import { logger } from "@/lib/logger";

try {
  await updateProfile(data);
} catch (error) {
  logger.error({ err: error, component: "ProfileForm" }, "Profile update failed");
  // Show user-friendly error in UI
  setError("Failed to save profile");
}
```

---

## Log Levels Guide

| Level | When to Use | Example |
|-------|-------------|---------|
| `fatal` | App cannot continue | Database connection lost |
| `error` | Operation failed, needs attention | Failed to save entry |
| `warn` | Potential issue, degraded behavior | Rate limit approaching |
| `info` | Normal operations | User logged in |
| `debug` | Development debugging | Request/response details |
| `trace` | Very verbose tracing | Function entry/exit |

### Environment Defaults

| Environment | Default Level | Shows |
|-------------|---------------|-------|
| Development | `debug` | debug, info, warn, error, fatal |
| Staging | `info` | info, warn, error, fatal |
| Production | `warn` | warn, error, fatal |

---

## Structured Logging Conventions

### Standard Fields

Always include these fields when relevant:

```typescript
{
  // User context
  userId: "uuid",

  // Request context
  requestId: "uuid",

  // Operation context
  operation: "createDiaryEntry",

  // Timing
  durationMs: 123,

  // Error (use 'err' not 'error' for Pino)
  err: errorObject,
}
```

### Naming Conventions

```typescript
// Context names: lowercase with colons
createLogger("server:diary")
createLogger("server:auth")
createLogger("component:profile")
createLogger("hook:goalCalculation")

// Log messages: Present tense, action-oriented
log.info({}, "Creating diary entry");      // ✅
log.info({}, "Created diary entry");       // ✅
log.info({}, "Diary entry creation");      // ❌ Noun phrase
log.info({}, "About to create entry");     // ❌ Future tense
```

---

## Security Considerations

### Never Log

- Passwords (plain or hashed)
- API keys/tokens
- Full credit card numbers
- SSN or government IDs
- Session tokens
- Email content

### Safe to Log

- User IDs (UUIDs)
- Email addresses (for debugging, redact in prod)
- Request IDs
- Timestamps
- Operation names
- Error messages (not stack traces in prod)

### Pino Redaction

```typescript
redact: {
  paths: [
    "password",
    "token",
    "authorization",
    "cookie",
    "*.password",
    "*.token",
    "req.headers.authorization",
  ],
  censor: "[REDACTED]",
}
```

---

## Testing

### Verify Logging Works

```typescript
// src/lib/logger.test.ts
import { logger, createLogger } from "./logger";

describe("Logger", () => {
  it("creates child logger with context", () => {
    const log = createLogger("test");
    expect(log.bindings()).toEqual(
      expect.objectContaining({ context: "test" })
    );
  });

  it("redacts sensitive fields", () => {
    // Pino redaction is tested by checking output
  });
});
```

---

## Future Enhancements

### Phase 5: Log Aggregation (Future)

Integrate with log management service:

```typescript
// Option 1: Logtail/Better Stack
import { Logtail } from "@logtail/pino";
const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

export const logger = pino({
  // ... existing config
  transport: {
    targets: [
      { target: "pino-pretty", level: "debug" },
      { target: "@logtail/pino", options: { sourceToken: process.env.LOGTAIL_TOKEN } },
    ],
  },
});

// Option 2: Datadog
// Option 3: AWS CloudWatch
// Option 4: Axiom
```

### Phase 6: Request Tracing (Future)

Add request ID to all logs:

```typescript
// Middleware to inject request ID
export function withRequestId(handler) {
  return async (req, res) => {
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();
    const log = logger.child({ requestId });
    // Attach to context
  };
}
```

---

## Acceptance Criteria

- [x] Logger utility created at `src/lib/logger.ts`
- [ ] All server/*.ts files use structured logging
- [ ] No raw console.* statements in src/ (except DevTools)
- [x] LOG_LEVEL environment variable works
- [x] Pretty printing works in development
- [x] JSON output works in production
- [x] Sensitive fields are redacted
- [x] Documentation updated

---

## Environment Variables

```bash
# Add to .env.example
LOG_LEVEL=info  # fatal, error, warn, info, debug, trace

# Development
LOG_LEVEL=debug

# Production
LOG_LEVEL=warn
```

---

## Rollout Plan

| Phase | Timeline | Status |
|-------|----------|--------|
| Phase 1: Logger Setup | Day 1 | Complete |
| Phase 2: Server Migration | Day 1-2 | Not Started |
| Phase 3: Auth Logging | Day 2 | Not Started |
| Phase 4: Component Logging | Day 3 | Not Started |
| Testing & Review | Day 3 | Not Started |

**Remaining Effort:** ~3-4 hours
