# PRD: Rate Limiting Implementation

> **Status:** Not Started
> **Priority:** High
> **Effort:** Medium (2-3 days)
> **Dependencies:** Better-Auth configuration

---

## Problem Statement

The application currently has no rate limiting on authentication endpoints, leaving it vulnerable to:

- **Brute force attacks** on login (credential guessing)
- **Email bombing** via password reset requests
- **Account enumeration** through signup/login responses
- **DoS attacks** exhausting server resources
- **Credential stuffing** using leaked password databases
- **Spam account creation** overwhelming the system

Without rate limiting, a malicious actor could make unlimited requests to sensitive endpoints, compromising user security and service availability.

---

## Goals

### Must Have

- [ ] Implement rate limiting on all authentication endpoints
- [ ] Provide user-friendly error messages when rate limited
- [ ] Configure appropriate limits per endpoint based on sensitivity
- [ ] Support memory storage for development

### Should Have

- [ ] Database storage for production (multi-instance support)
- [ ] Configurable IP address headers for different platforms
- [ ] Logging of rate limit events for monitoring

### Nice to Have

- [ ] Redis storage for high-traffic scenarios
- [ ] IP whitelisting for trusted sources
- [ ] CAPTCHA fallback instead of hard blocking

### Non-Goals

- User-based rate limiting (requires authentication first)
- Geographic-based rate limiting
- Machine learning-based anomaly detection

---

## User Stories

### As a user

- I want protection against unauthorized access attempts on my account
- I want clear feedback when I've made too many requests
- I want my legitimate requests to succeed without friction

### As a developer

- I want rate limiting configured in one place
- I want easy-to-adjust limits per endpoint
- I want visibility into rate limit events

### As an operator

- I want protection against abuse without blocking legitimate traffic
- I want monitoring capabilities for rate limit events
- I want flexibility in storage backends for different environments

---

## Technical Requirements

### Rate Limit Rules

| Endpoint | Window | Max Requests | Reasoning |
|----------|--------|--------------|-----------|
| `/forgot-password` | 15 min | 3 | Prevent email bombing, strictest limit |
| `/reset-password` | 1 min | 5 | Prevent brute force token guessing |
| `/sign-in/email` | 1 min | 5 | Prevent credential stuffing attacks |
| `/sign-up/email` | 1 min | 10 | Prevent spam account creation |
| Default (all other) | 1 min | 100 | General abuse prevention |

### How It Works

1. **IP Tracking** - Each request tracked by client IP (`x-forwarded-for` header)
2. **Counter** - Increments counter for IP + endpoint combination
3. **Limit Check** - If counter exceeds `max` within `window`, reject request
4. **Response** - Returns `429 Too Many Requests` with `X-Retry-After` header
5. **Client Handling** - Shows user-friendly error with retry time
6. **Auto-Reset** - Counter resets after time window expires

### Storage Options

| Storage | Use Case | Pros | Cons |
|---------|----------|------|------|
| Memory | Development | Fast, no setup | Single instance only |
| Database | Production | Multi-instance, persistent | Adds DB load |
| Redis | High-traffic | Fastest, scales horizontally | Extra infrastructure |

---

## Implementation Plan

### Phase 1: Core Implementation (Day 1)

#### 1.1 Server Configuration

**File:** `src/lib/auth-config.ts`

```typescript
rateLimit: {
  enabled: true,
  window: 60,    // Default: 60 seconds
  max: 100,      // Default: 100 requests per window

  customRules: {
    "/forgot-password": {
      window: 60 * 15, // 15 minutes
      max: 3,
    },
    "/reset-password": {
      window: 60,
      max: 5,
    },
    "/sign-in/email": {
      window: 60,
      max: 5,
    },
    "/sign-up/email": {
      window: 60,
      max: 10,
    },
  },

  storage: "memory", // Upgrade to "database" for production
}
```

#### 1.2 Client Error Handling

**File:** `src/lib/auth-client.ts`

```typescript
export const authClient = createAuthClient({
  fetchOptions: {
    onError: async (context) => {
      const { response } = context;

      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        const seconds = retryAfter ? parseInt(retryAfter) : 60;
        const minutes = Math.ceil(seconds / 60);

        throw new Error(
          `Too many requests. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`
        );
      }
    },
  },
});
```

#### 1.3 Error Constants

**File:** `src/constants/errors.ts`

```typescript
RATE_LIMITED: "Too many requests. Please try again later.",
```

### Phase 2: Production Configuration (Day 2)

#### 2.1 Database Storage

**Migration command:**

```bash
op run --env-file="./.env.production" -- bunx @better-auth/cli migrate
```

**Prisma Schema:**

```prisma
model RateLimit {
  id          String   @id
  key         String   @unique
  count       Int
  lastRequest BigInt
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("rate_limit")
}
```

**Configuration:**

```typescript
rateLimit: {
  storage: "database",
  modelName: "rateLimit",
}
```

#### 2.2 IP Address Headers

**File:** `src/lib/auth-config.ts`

```typescript
advanced: {
  ipAddress: {
    ipAddressHeaders: [
      "cf-connecting-ip",     // Cloudflare
      "x-real-ip",            // Nginx
      "x-forwarded-for",      // Standard reverse proxy
      "x-client-ip",          // Other proxies
    ],
  },
}
```

| Platform | Primary Header |
|----------|----------------|
| Cloudflare | `cf-connecting-ip` |
| Vercel | `x-forwarded-for` |
| AWS CloudFront | `cloudfront-viewer-address` |
| Nginx | `x-real-ip` |

### Phase 3: Testing & Monitoring (Day 3)

#### 3.1 Manual Testing

**Test forgot-password (3 per 15 min):**

```bash
for i in {1..4}; do
  echo "Request $i:"
  curl -X POST http://localhost:3003/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","redirectTo":"/auth/reset-password"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

Expected: Requests 1-3 succeed, request 4 returns `429`

**Test sign-in (5 per minute):**

```bash
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:3003/api/auth/sign-in/email \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

Expected: Requests 1-5 return `401`, request 6 returns `429`

#### 3.2 UI Testing

1. Navigate to `/auth/forgot-password`
2. Submit form 4 times quickly
3. Verify error message: "Too many requests. Please try again in 15 minutes."

---

## File Changes Summary

| File | Change |
|------|--------|
| `src/lib/auth-config.ts` | Add `rateLimit` configuration |
| `src/lib/auth-client.ts` | Add 429 error handling in `fetchOptions.onError` |
| `src/constants/errors.ts` | Add `RATE_LIMITED` constant |
| `prisma/schema.prisma` | Add `RateLimit` model (production) |

---

## Security Benefits

| Attack Type | Protection |
|-------------|------------|
| Brute Force (Login) | 5 attempts/min per IP |
| Brute Force (Tokens) | 5 attempts/min per IP |
| Email Bombing | 3 requests/15 min per IP |
| Account Enumeration | Combined with generic errors |
| Spam Registration | 10 signups/min per IP |
| DoS/DDoS | 100 req/min default limit |
| Credential Stuffing | Login limits block automation |

---

## Acceptance Criteria

### Functional

- [ ] Rate limiting active on all auth endpoints
- [ ] Custom limits applied per endpoint
- [ ] 429 response returned when limit exceeded
- [ ] `X-Retry-After` header included in 429 responses
- [ ] Client displays user-friendly error message
- [ ] Limits reset after window expires

### Non-Functional

- [ ] < 5ms overhead per request for rate limit check
- [ ] Memory storage works for single-instance dev
- [ ] Database storage works for multi-instance production
- [ ] No false positives for legitimate single-user traffic

### Testing

- [ ] Manual tests pass for all protected endpoints
- [ ] UI error handling verified
- [ ] Production storage tested before deployment

---

## Rollout Plan

### Stage 1: Development

1. Implement with memory storage
2. Test all endpoints manually
3. Verify UI error handling

### Stage 2: Staging

1. Enable database storage
2. Run load tests
3. Monitor for false positives

### Stage 3: Production

1. Deploy with conservative limits
2. Monitor rate limit hit rate (target: < 1%)
3. Adjust limits based on real traffic
4. Set up alerts for anomalies

---

## Future Enhancements

### Redis Storage

For high-traffic or serverless deployments:

```typescript
import { RedisAdapter } from "better-auth/adapters/redis";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export const auth = betterAuth({
  secondaryStorage: RedisAdapter(redis),
  rateLimit: {
    storage: "secondary-storage",
  },
});
```

### IP Whitelisting

For CI/CD, health checks, or trusted IPs:

```typescript
customRules: {
  "/health": false, // Disable for health checks

  "/api/*": async (request) => {
    const ip = request.headers.get("x-forwarded-for");

    // Whitelist internal IPs
    if (ip?.startsWith("10.") || ip?.startsWith("192.168.")) {
      return false;
    }

    return { window: 60, max: 100 };
  },
}
```

### CAPTCHA Fallback

Instead of hard blocking, challenge with CAPTCHA after limit reached.

### Rate Limit Monitoring

Add logging for security monitoring:

```typescript
customRules: {
  "/sign-in/email": async (request) => {
    const ip = request.headers.get("x-forwarded-for");

    logger.info("Rate limit check", {
      endpoint: "/sign-in/email",
      ip,
      timestamp: new Date().toISOString(),
    });

    return { window: 60, max: 5 };
  },
}
```

---

## Troubleshooting

### Legitimate users getting rate limited

- Increase limits for affected endpoints
- Consider user-based limiting post-authentication
- Whitelist known corporate IP ranges

### Rate limits not working

- Verify `enabled: true` in config
- Check endpoint paths match exactly
- Verify IP headers configured correctly

### Different instances have separate counters

- Upgrade from memory to database storage

### Counters not resetting

- Restart server (immediate fix)
- Upgrade to database storage (permanent fix)

---

## References

- [Better-Auth Rate Limiting Docs](https://www.better-auth.com/docs/concepts/rate-limit)
- [PRD: Authentication Enhancements](./PRD_AUTH_ENHANCEMENTS.md)
