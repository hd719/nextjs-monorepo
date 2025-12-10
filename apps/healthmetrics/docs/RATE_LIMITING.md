# Rate Limiting Implementation

> ⚠️ **Status: NOT IMPLEMENTED**
>
> This document describes how to implement rate limiting in the future. The implementation has been removed for now but can be re-added later when needed.

## Overview

This guide shows how to implement comprehensive rate limiting for all authentication endpoints using Better-Auth's built-in rate limiter to protect against abuse, brute force attacks, and DoS attempts.

## Implementation Details

### Configuration

**Location:** `src/lib/auth.ts`

```typescript
rateLimit: {
  enabled: true, // Enabled in development (normally disabled by default in dev)
  window: 60,    // Default time window: 60 seconds
  max: 100,      // Default max requests: 100 per window

  customRules: {
    // Password reset request - Strictest limit
    "/forgot-password": {
      window: 60 * 15, // 15 minutes
      max: 3,          // Only 3 attempts per 15 minutes
    },

    // Password reset completion - Moderate limit
    "/reset-password": {
      window: 60, // 1 minute
      max: 5,     // 5 attempts per minute
    },

    // Sign-in - Prevent brute force
    "/sign-in/email": {
      window: 60, // 1 minute
      max: 5,     // 5 attempts per minute
    },

    // Sign-up - Prevent spam
    "/sign-up/email": {
      window: 60, // 1 minute
      max: 10,    // 10 attempts per minute
    },
  },

  storage: "memory", // Memory storage (dev) - upgrade to "database" for production
}
```

### Client-Side Error Handling

**Location:** `src/lib/auth-client.ts`

```typescript
export const authClient = createAuthClient({
  fetchOptions: {
    onError: async (context) => {
      const { response } = context;

      // Handle rate limit errors (429 Too Many Requests)
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

## Rate Limit Rules

| Endpoint | Window | Max | Reasoning |
|----------|--------|-----|-----------|
| `/forgot-password` | 15 min | 3 | Prevent email bombing, account enumeration |
| `/reset-password` | 1 min | 5 | Prevent brute force token guessing |
| `/sign-in/email` | 1 min | 5 | Prevent credential stuffing attacks |
| `/sign-up/email` | 1 min | 10 | Prevent spam account creation |
| Default (all other endpoints) | 1 min | 100 | General abuse prevention |

## How It Works

1. **IP Tracking:** Each request is tracked by client IP address (from `x-forwarded-for` header)
2. **Counter:** Each request increments a counter for that IP + endpoint combination
3. **Limit Check:** If counter exceeds `max` within the `window`, request is rejected
4. **Response:** Returns `429 Too Many Requests` with `X-Retry-After` header (seconds until retry)
5. **Client Handling:** Client shows user-friendly error message with retry time
6. **Auto-Reset:** Counter automatically resets after the time window expires

## Testing Rate Limits

### Prerequisites

Rate limiting is **enabled in development** for testing:

```typescript
rateLimit: {
  enabled: true, // ✅ Enabled
}
```

### Test 1: Forgot Password Rate Limit (3 per 15 min)

```bash
# Start dev server
op run --env-file="./.env.development.local" -- bun run dev

# In another terminal, make 4 requests quickly
for i in {1..4}; do
  echo "Request $i:"
  curl -X POST http://localhost:3003/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","redirectTo":"/auth/reset-password"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected Result:**

- Requests 1-3: `200 OK` (or appropriate success response)
- Request 4: `429 Too Many Requests` with `X-Retry-After: 900` header (15 minutes)

### Test 2: Sign-In Rate Limit (5 per minute)

```bash
# Make 6 sign-in attempts quickly
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:3003/api/auth/sign-in/email \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected Result:**

- Requests 1-5: `401 Unauthorized` (wrong password)
- Request 6: `429 Too Many Requests` with `X-Retry-After: 60` header (1 minute)

### Test 3: Reset Password Rate Limit (5 per minute)

```bash
# Make 6 reset password attempts quickly (with a fake token)
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:3003/api/auth/reset-password \
    -H "Content-Type: application/json" \
    -d '{"token":"fake-token","newPassword":"NewPassword123"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected Result:**

- Requests 1-5: `400 Bad Request` or similar (invalid token)
- Request 6: `429 Too Many Requests` with `X-Retry-After: 60` header

### Test 4: UI Error Handling

1. Go to `http://localhost:3003/auth/forgot-password`
2. Submit the form 4 times quickly
3. On the 4th attempt, you should see:

   ```note
   Too many requests. Please try again in 15 minutes.
   ```

## Production Configuration

### 1. Storage Options

**Current:** Memory storage (single instance only)

**Production Recommendations:**

#### Option A: Database Storage

Best for: Traditional server deployments, multiple instances

```typescript
// src/lib/auth.ts
rateLimit: {
  storage: "database",
  modelName: "rateLimit",
}
```

**Setup:**

```bash
# Run migration to create rate_limit table
op run --env-file="./.env.production" -- bun x @better-auth/cli migrate
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

**Pros:**

- Works with multiple server instances
- Survives server restarts
- No additional infrastructure

**Cons:**

- Adds load to database
- Slightly slower than memory/Redis

#### Option B: Redis (Secondary Storage)

Best for: High-traffic applications, serverless deployments

```typescript
// src/lib/auth.ts
import { RedisAdapter } from "better-auth/adapters/redis";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export const auth = betterAuth({
  // ... other config
  secondaryStorage: RedisAdapter(redis),
  rateLimit: {
    storage: "secondary-storage",
  },
});
```

**Pros:**

- Fastest performance
- Perfect for ephemeral data
- Scales horizontally
- Ideal for serverless

**Cons:**

- Requires Redis setup
- Additional infrastructure cost

### 2. IP Address Headers

Configure correct IP headers for your platform:

```typescript
// src/lib/auth.ts
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

**Platform-Specific Headers:**

| Platform | Header |
|----------|--------|
| Cloudflare | `cf-connecting-ip` |
| Vercel | `x-forwarded-for` |
| AWS CloudFront | `cloudfront-viewer-address` |
| Nginx | `x-real-ip` |
| Heroku | `x-forwarded-for` |

### 3. Adjusting Limits

Monitor and adjust based on real-world usage:

```typescript
rateLimit: {
  customRules: {
    // Example: Relaxing sign-in limit after monitoring
    "/sign-in/email": {
      window: 60,
      max: 10, // Increased from 5 based on false positives
    },

    // Example: Stricter limit for sensitive operations
    "/admin/*": {
      window: 60,
      max: 20,
    },
  },
}
```

**Monitoring Checklist:**

- [ ] Track rate limit hit rate (should be < 1% of legitimate users)
- [ ] Monitor user complaints about "too many requests"
- [ ] Set up alerts for unusual patterns
- [ ] Review logs weekly for attack attempts
- [ ] Adjust limits based on legitimate usage patterns

### 4. Whitelisting

For CI/CD, health checks, or trusted IPs:

```typescript
rateLimit: {
  customRules: {
    // Disable rate limiting for health checks
    "/health": false,

    // Custom function for conditional rate limiting
    "/api/*": async (request) => {
      const ip = request.headers.get("x-forwarded-for");

      // Whitelist internal IPs
      if (ip?.startsWith("10.") || ip?.startsWith("192.168.")) {
        return false; // No rate limit
      }

      return {
        window: 60,
        max: 100,
      };
    },
  },
}
```

## Security Benefits

### Attack Types Prevented

| Attack | How Rate Limiting Helps |
|--------|------------------------|
| **Brute Force (Login)** | Limits login attempts to 5 per minute per IP |
| **Brute Force (Tokens)** | Limits password reset attempts to 5 per minute |
| **Email Bombing** | Limits forgot password to 3 per 15 minutes |
| **Account Enumeration** | Combined with generic error messages, prevents user discovery |
| **Spam Registration** | Limits sign-ups to 10 per minute per IP |
| **DoS/DDoS** | Overall 100 req/min default prevents service exhaustion |
| **Credential Stuffing** | Login limits prevent automated credential testing |

### Additional Security Layers

Rate limiting works best when combined with:

1. **Strong Password Policies** (already implemented)
2. **Email Verification** (already implemented)
3. **CAPTCHA** (future enhancement for high-risk endpoints)
4. **IP Reputation** (future enhancement)
5. **Device Fingerprinting** (future enhancement)
6. **Anomaly Detection** (future enhancement with AI/ML)

## Troubleshooting

### Issue: Rate limit triggering for legitimate users

**Symptoms:**
Users behind corporate NAT/VPN hitting rate limits

**Solutions:**

1. Increase limits for affected endpoints
2. Implement user-based rate limiting (after authentication)
3. Add CAPTCHA challenge instead of hard block
4. Whitelist known corporate IP ranges

### Issue: Rate limits not working

**Symptoms:**
Can make unlimited requests without 429 errors

**Debugging:**

1. Check `enabled: true` in config
2. Verify correct endpoint path (must match exactly)
3. Check IP address headers are configured correctly
4. Review terminal logs for Better-Auth rate limit messages

### Issue: Different instances have separate counters

**Symptoms:**
Rate limiting not effective across load-balanced instances

**Solution:**
Upgrade from memory storage to database or Redis:

```typescript
rateLimit: {
  storage: "database", // or "secondary-storage"
}
```

### Issue: Rate limit counters not resetting

**Symptoms:**
Once rate limited, users stay rate limited indefinitely

**Cause:**
Using memory storage with server that never restarts + high memory usage

**Solution:**

1. Restart server (immediate fix)
2. Upgrade to database storage (permanent fix)
3. Configure Redis with TTL (automatic cleanup)

## Monitoring & Alerts

### Metrics to Track

1. **Rate Limit Hit Rate:**

   ```
   (429 responses / total requests) * 100
   ```

   Target: < 1% for legitimate traffic

2. **Unique IPs Rate Limited:**
   Track how many distinct IPs are getting rate limited daily

3. **Endpoint-Specific Rates:**
   Monitor each endpoint separately to identify issues

4. **False Positive Rate:**
   User complaints about rate limiting / total rate limits

### Logging

Add custom logging to track rate limit events:

```typescript
// src/lib/auth.ts (future enhancement)
import { logger } from "@/lib/logger";

// In your rate limit custom rules:
customRules: {
  "/sign-in/email": async (request) => {
    const ip = request.headers.get("x-forwarded-for");

    // Log rate limit events
    logger.info("Rate limit check", {
      endpoint: "/sign-in/email",
      ip,
      timestamp: new Date().toISOString(),
    });

    return { window: 60, max: 5 };
  },
}
```

### Alerting

Set up alerts for:

- Sudden spike in 429 responses (> 5% of requests)
- Single IP making excessive requests
- Pattern of sequential IPs (distributed attack)
- Rate limit hit rate above threshold for extended period

## Related Documentation

- [Better-Auth Rate Limiting](https://www.better-auth.com/docs/concepts/rate-limit)
- [Password Reset Implementation](./PASSWORD_RESET_IMPLEMENTATION.md)
- [Main Authentication Documentation](./AUTHENTICATION.md)

## Summary

❌ **Status: NOT IMPLEMENTED**

This document serves as a reference for future implementation. When you're ready to add rate limiting:

📋 **Implementation Checklist:**

- [ ] Add rate limiting config to `src/lib/auth.ts` (copy from this doc)
- [ ] Add client-side error handling to `src/lib/auth-client.ts`
- [ ] Add rate limit error constant to `src/constants/errors.ts`
- [ ] Test with the provided test commands
- [ ] Monitor and adjust limits based on real traffic

🔄 **Production Considerations:**

- [ ] Choose storage: memory (dev), database, or Redis (production)
- [ ] Configure correct IP address headers for your platform
- [ ] Set up monitoring and alerts
- [ ] Test with production traffic patterns
- [ ] Adjust limits based on metrics
- [ ] Document any custom rules
- [ ] Train support team on rate limit errors

🛡️ **Security Benefits (when implemented):**

- Protection against brute force attacks
- Email bombing prevention
- DoS mitigation
- Account enumeration protection
- Credential stuffing defense
