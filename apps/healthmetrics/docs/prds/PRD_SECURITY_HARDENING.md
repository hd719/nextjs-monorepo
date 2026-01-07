# PRD: Security Hardening

## Overview

This document outlines security enhancements required before production deployment. The codebase has good baseline protection but needs additional hardening for a public-facing health application.

---

## Problem Statement

Health applications handle sensitive personal data (weight, diet, exercise habits). Current security measures rely on framework defaults. Production deployment requires explicit security controls to protect against common web vulnerabilities.

---

## Goals

1. **Prevent XSS attacks** - Block script injection in user inputs
2. **Implement CSP headers** - Restrict resource loading to trusted sources
3. **Add rate limiting** - Prevent brute force and DoS attacks
4. **Secure sensitive data** - Ensure PII is properly protected
5. **Validate environment** - Fail fast on missing security configuration

---

## Non-Goals

- Full penetration testing (separate engagement)
- SOC 2 / HIPAA compliance (future phase)
- Web Application Firewall (WAF) - infrastructure concern

---

## Current State Analysis

### Already Protected

| Area | Protection | Notes |
|------|------------|-------|
| Password hashing | Better Auth (Argon2) | Industry standard |
| SQL injection | Prisma ORM | Parameterized queries |
| CSRF | Better Auth cookies | SameSite + HttpOnly |
| XSS (basic) | React JSX auto-escape | Framework default |
| Input validation | Zod schemas | Length limits on all fields |
| Session management | Better Auth | Secure cookie handling |

### Needs Implementation

| Area | Risk Level | Current State |
|------|------------|---------------|
| CSP headers | Medium | Not configured |
| Rate limiting | High | Not implemented |
| Input sanitization | Low | Zod only (no pattern blocking) |
| Environment validation | Low | No runtime checks |
| Error message exposure | Medium | Stack traces in dev mode |
| Audit logging | Medium | Only console.error |

---

## Technical Specification

### Phase 1: Input Sanitization (Priority: High)

#### 1.1 Enhanced Zod Validators

Add pattern-based blocking for dangerous content:

```typescript
// src/utils/security.ts

/**
 * Regex patterns for potentially dangerous input
 * Blocks script tags, event handlers, and javascript: URLs
 */
const DANGEROUS_PATTERNS = [
  /<script\b/i,           // Script tags
  /javascript:/i,         // JavaScript URLs
  /on\w+\s*=/i,           // Event handlers (onclick=, onerror=, etc.)
  /data:\s*text\/html/i,  // Data URLs with HTML
  /<iframe\b/i,           // Iframe injection
  /<object\b/i,           // Object tag injection
  /<embed\b/i,            // Embed tag injection
];

/**
 * Check if a string contains potentially dangerous patterns
 */
export function containsDangerousContent(value: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Zod refinement for safe strings
 */
export const safeString = (maxLength: number) =>
  z.string()
    .max(maxLength)
    .refine(
      val => !containsDangerousContent(val),
      "Input contains invalid characters"
    );

/**
 * Zod refinement for safe optional strings
 */
export const safeOptionalString = (maxLength: number) =>
  z.string()
    .max(maxLength)
    .optional()
    .refine(
      val => !val || !containsDangerousContent(val),
      "Input contains invalid characters"
    );
```

#### 1.2 Update Validation Schemas

Apply `safeString` to user-controlled text fields:

```typescript
// src/utils/validation.ts

import { safeString, safeOptionalString } from "./security";

export const updateUserProfileSchema = z.object({
  displayName: safeOptionalString(100),
  // ... other fields
});

export const createDiaryEntrySchema = z.object({
  notes: safeOptionalString(500),
  // ... other fields
});

// Apply to all notes, displayName, and free-text fields
```

**Files to Update:**

- `src/utils/validation.ts` - All schemas with text fields

---

### Phase 2: Content Security Policy (Priority: High)

#### 2.1 CSP Header Configuration

```typescript
// src/middleware/security.ts

export const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'"], // Required for theme script
  "style-src": ["'self'", "'unsafe-inline'"],  // Required for Tailwind
  "img-src": ["'self'", "data:", "https:"],    // Allow HTTPS images
  "font-src": ["'self'"],
  "connect-src": ["'self'"],                   // API calls
  "frame-ancestors": ["'none'"],               // Prevent clickjacking
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

export function buildCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}
```

#### 2.2 Apply CSP in Server Config

For TanStack Start / Vinxi:

```typescript
// app.config.ts or server entry

import { buildCSPHeader } from "./src/middleware/security";

// Add to response headers
const securityHeaders = {
  "Content-Security-Policy": buildCSPHeader(),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
```

---

### Phase 3: Rate Limiting (Priority: High)

#### 3.1 Rate Limiter Implementation

```typescript
// src/utils/rate-limiter.ts

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints - strict limits
  "auth:login": { windowMs: 15 * 60 * 1000, maxRequests: 5 },      // 5 per 15 min
  "auth:signup": { windowMs: 60 * 60 * 1000, maxRequests: 3 },     // 3 per hour
  "auth:forgot-password": { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  "auth:reset-password": { windowMs: 15 * 60 * 1000, maxRequests: 5 },

  // API endpoints - moderate limits
  "api:default": { windowMs: 60 * 1000, maxRequests: 60 },         // 60 per minute
  "api:search": { windowMs: 60 * 1000, maxRequests: 30 },          // 30 per minute

  // Write operations - stricter
  "api:create": { windowMs: 60 * 1000, maxRequests: 20 },          // 20 per minute
  "api:update": { windowMs: 60 * 1000, maxRequests: 30 },          // 30 per minute
};

// In-memory store (use Redis in production for multi-instance)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  identifier: string // IP or user ID
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = RATE_LIMITS[key] || RATE_LIMITS["api:default"];
  const cacheKey = `${key}:${identifier}`;
  const now = Date.now();

  const entry = requestCounts.get(cacheKey);

  if (!entry || now > entry.resetAt) {
    // New window
    requestCounts.set(cacheKey, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}
```

#### 3.2 Apply to Auth Routes

```typescript
// src/routes/auth/login.tsx

import { checkRateLimit } from "@/utils/rate-limiter";

// In form submission handler
const clientIP = request.headers.get("x-forwarded-for") || "unknown";
const rateLimit = checkRateLimit("auth:login", clientIP);

if (!rateLimit.allowed) {
  return {
    error: "Too many login attempts. Please try again later.",
    retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
  };
}
```

---

### Phase 4: Environment Validation (Priority: Medium)

#### 4.1 Required Environment Variables

```typescript
// src/utils/env.ts

import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url().optional(),

  // App
  APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables at startup
 * Throws if required variables are missing or invalid
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.format());
    throw new Error("Environment validation failed");
  }

  return result.data;
}

// Call at app startup
export const env = validateEnv();
```

#### 4.2 Startup Check

```typescript
// src/app.tsx or entry point

import { validateEnv } from "@/utils/env";

// Validate on startup - fails fast if misconfigured
validateEnv();
```

---

### Phase 5: Error Handling & Audit Logging (Priority: Medium)

#### 5.1 Safe Error Responses

```typescript
// src/utils/errors.ts

/**
 * Sanitize error messages for client responses
 * Strips stack traces and internal details in production
 */
export function sanitizeError(error: unknown): string {
  if (process.env.NODE_ENV === "development") {
    return error instanceof Error ? error.message : String(error);
  }

  // Production: generic messages only
  if (error instanceof Error) {
    // Known error types can have specific messages
    if (error.message.includes("validation")) {
      return "Invalid input provided";
    }
    if (error.message.includes("not found")) {
      return "Resource not found";
    }
    if (error.message.includes("unauthorized")) {
      return "Unauthorized access";
    }
  }

  return "An unexpected error occurred";
}
```

#### 5.2 Security Audit Logging

```typescript
// src/utils/audit-log.ts

type SecurityEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "RATE_LIMIT_EXCEEDED"
  | "SUSPICIOUS_INPUT_BLOCKED"
  | "SESSION_CREATED"
  | "SESSION_REVOKED";

interface AuditLogEntry {
  event: SecurityEvent;
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Log security-relevant events
 * In production, this should write to a secure, append-only log
 */
export function logSecurityEvent(entry: Omit<AuditLogEntry, "timestamp">): void {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // Development: console
  if (process.env.NODE_ENV === "development") {
    console.log("[SECURITY]", JSON.stringify(logEntry));
    return;
  }

  // Production: structured logging (integrate with Pino when available)
  // TODO: Replace with Pino logger from PRD_LOGGING.md
  console.log(JSON.stringify({ level: "info", type: "security", ...logEntry }));
}
```

---

## Implementation Plan

### Week 1: Input Sanitization + Environment Validation

| Task | Effort | Owner |
|------|--------|-------|
| Create `src/utils/security.ts` with safe string validators | 2h | - |
| Update all Zod schemas to use safe validators | 3h | - |
| Create `src/utils/env.ts` with validation | 1h | - |
| Add startup validation check | 0.5h | - |
| Test with malicious input patterns | 2h | - |

### Week 2: CSP + Security Headers

| Task | Effort | Owner |
|------|--------|-------|
| Create CSP configuration | 1h | - |
| Configure security headers in server | 2h | - |
| Test CSP doesn't break existing functionality | 2h | - |
| Document CSP policy decisions | 1h | - |

### Week 3: Rate Limiting

| Task | Effort | Owner |
|------|--------|-------|
| Implement in-memory rate limiter | 2h | - |
| Apply to auth routes | 2h | - |
| Apply to API routes | 2h | - |
| Add rate limit headers to responses | 1h | - |
| Test rate limiting behavior | 2h | - |

### Week 4: Error Handling + Audit Logging

| Task | Effort | Owner |
|------|--------|-------|
| Create error sanitization utility | 1h | - |
| Update server functions to use sanitized errors | 3h | - |
| Implement security audit logging | 2h | - |
| Add audit logging to auth flows | 2h | - |
| Integration testing | 2h | - |

---

## Testing Requirements

### Manual Testing

- [ ] Submit `<script>alert(1)</script>` in display name - should be rejected
- [ ] Submit `javascript:alert(1)` in any text field - should be rejected
- [ ] Attempt 6+ logins with wrong password - should be rate limited
- [ ] Remove `DATABASE_URL` env var - app should fail to start with clear error
- [ ] Verify no stack traces in production error responses

### Automated Testing

```typescript
// tests/security.test.ts

describe("Input Sanitization", () => {
  it("blocks script tags in display name", () => {
    const result = updateUserProfileSchema.safeParse({
      displayName: '<script>alert(1)</script>'
    });
    expect(result.success).toBe(false);
  });

  it("blocks javascript: URLs", () => {
    const result = updateUserProfileSchema.safeParse({
      displayName: 'javascript:alert(1)'
    });
    expect(result.success).toBe(false);
  });

  it("allows normal text", () => {
    const result = updateUserProfileSchema.safeParse({
      displayName: 'John Doe'
    });
    expect(result.success).toBe(true);
  });
});

describe("Rate Limiting", () => {
  it("allows requests under limit", () => {
    const result = checkRateLimit("auth:login", "test-ip");
    expect(result.allowed).toBe(true);
  });

  it("blocks requests over limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("auth:login", "test-ip-2");
    }
    const result = checkRateLimit("auth:login", "test-ip-2");
    expect(result.allowed).toBe(false);
  });
});
```

---

## Acceptance Criteria

### Phase 1: Input Sanitization

- [ ] All text input fields reject script injection patterns
- [ ] Validation errors are user-friendly (no technical details)
- [ ] Existing valid inputs still work

### Phase 2: CSP Headers

- [ ] CSP header present on all responses
- [ ] No CSP violations in browser console for normal usage
- [ ] Clickjacking protection verified (X-Frame-Options)

### Phase 3: Rate Limiting

- [ ] Login limited to 5 attempts per 15 minutes
- [ ] Signup limited to 3 attempts per hour
- [ ] Rate limit headers included in responses
- [ ] User-friendly error message when rate limited

### Phase 4: Environment Validation

- [ ] App fails to start with missing required env vars
- [ ] Clear error message indicates which var is missing
- [ ] Optional vars have sensible defaults

### Phase 5: Error Handling

- [ ] No stack traces in production responses
- [ ] Security events logged with structured format
- [ ] Failed login attempts logged with IP

---

## Future Considerations

### Not in Scope (Future PRDs)

1. **Redis-based Rate Limiting** - For multi-instance deployments
2. **Web Application Firewall (WAF)** - Infrastructure-level protection
3. **DDoS Protection** - CDN/infrastructure concern
4. **Penetration Testing** - Professional security audit
5. **HIPAA Compliance** - If handling PHI (Protected Health Information)
6. **Data Encryption at Rest** - Database-level encryption

---

## References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [Better Auth Security](https://www.better-auth.com/docs/concepts/security)
