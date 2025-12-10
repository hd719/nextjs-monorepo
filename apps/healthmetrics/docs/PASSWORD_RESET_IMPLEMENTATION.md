# Password Reset Implementation

## Overview

This document details the implementation of password reset functionality using Better-Auth in our TanStack Start application, including all challenges encountered and their solutions.

## Table of Contents

1. [Implementation Summary](#implementation-summary)
2. [Files Created/Modified](#files-createdmodified)
3. [Challenges & Solutions](#challenges--solutions)
4. [Configuration Details](#configuration-details)
5. [Testing Guide](#testing-guide)
6. [Future Improvements](#future-improvements)

---

## Implementation Summary

We implemented a complete password reset flow using Better-Auth's built-in password reset functionality:

1. **Forgot Password Page** (`/auth/forgot-password`): User enters email
2. **Email Delivery**: Reset link sent to user (console logged in dev)
3. **Reset Password Page** (`/auth/reset-password`): User enters new password
4. **Password Update**: Password updated in database
5. **Confirmation**: User redirected to login

### Technologies Used

- **Better-Auth**: Authentication framework with built-in password reset
- **Prisma**: Database ORM with PostgreSQL
- **TanStack Router**: File-based routing
- **Zod**: Schema validation
- **React**: UI components

---

## Files Created/Modified

### New Files

#### 1. `/src/routes/auth/forgot-password.tsx`
Request password reset page.

**Key Features:**
- Email input with validation
- Calls `authClient.requestPasswordReset()`
- Security-conscious success message (doesn't reveal if email exists)
- Links to login and signup

**Code Highlights:**
```typescript
await authClient.requestPasswordReset({
  email: formData.email,
  redirectTo: "/auth/reset-password",
});
```

#### 2. `/src/routes/auth/reset-password.tsx`
Reset password with token page.

**Key Features:**
- Reads token from URL query params
- New password + confirmation fields
- Password strength requirements displayed
- Calls `authClient.resetPassword()`
- Handles invalid/expired tokens gracefully

**Code Highlights:**
```typescript
await authClient.resetPassword({
  token: search.token,
  newPassword: formData.password,
});
```

### Modified Files

#### 1. `/src/lib/auth.ts`
Added password reset configuration.

**Before:**
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
}
```

**After:**
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  // Password reset function (direct property, not nested)
  sendResetPassword: async ({ user, url, token }) => {
    console.log("PASSWORD RESET EMAIL");
    console.log("To:", user.email);
    console.log("Link:", url);
  },
  // Callback after successful password reset
  onPasswordReset: async ({ user }) => {
    console.log(`✅ Password for user ${user.email} has been reset.`);
  },
}
```

#### 2. `/src/lib/validation.ts`
Added password reset validation schemas.

**New Schemas:**
```typescript
export const forgotPasswordSchema = z.object({
  email: z.string().email(AUTH_ERRORS.INVALID_EMAIL),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, AUTH_ERRORS.PASSWORD_TOO_SHORT),
    confirmPassword: z.string().min(8, AUTH_ERRORS.PASSWORD_TOO_SHORT),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_ERRORS.PASSWORDS_DONT_MATCH,
    path: ["confirmPassword"],
  });
```

#### 3. `/src/constants/errors.ts`
Added password reset error messages.

**New Constants:**
```typescript
RESET_TOKEN_INVALID: "This password reset link is invalid or has expired.",
RESET_EMAIL_SENT: "If an account exists with this email, you will receive a password reset link shortly.",
```

#### 4. `/src/routes/login/index.tsx`
Added "Forgot password?" link.

**Addition:**
```tsx
<div className="text-center text-sm">
  <Link to="/auth/forgot-password" className="text-accent hover:underline">
    Forgot password?
  </Link>
</div>
```

#### 5. `/prisma/schema.prisma`
Ensured `Verification` model exists (required for password reset tokens).

**Model:**
```prisma
model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("verification")
}
```

---

## Challenges & Solutions

### Challenge 1: Incorrect Better-Auth Configuration Structure

**Problem:**
Initially tried to nest password reset config incorrectly:

```typescript
# Incorrect
emailAndPassword: {
  resetPassword: {
    enabled: true,
    sendResetPasswordEmail: async () => { ... }
  }
}
```

**Error:**
```
ERROR [Better Auth]: Reset password isn't enabled. Please pass an emailAndPassword.sendResetPassword function!
```

**Root Cause:**
Better-Auth expects `sendResetPassword` as a **direct property** of `emailAndPassword`, not nested inside a `resetPassword` object.

**Solution:**
Moved `sendResetPassword` to be a direct child:

```typescript
# Correct
emailAndPassword: {
  enabled: true,
  sendResetPassword: async ({ user, url, token }) => { ... }
}
```

**Reference:** [Better-Auth Email & Password Docs](https://www.better-auth.com/docs/authentication/email-password#request-password-reset)

---

### Challenge 2: Incorrect Client Method Name

**Problem:**
Used `authClient.forgetPassword()` (incorrect spelling).

**Error:**
```
Property 'forgetPassword' does not exist. Did you mean 'resetPassword'?
```

**Solution:**
Changed to the correct method name: `authClient.requestPasswordReset()`.

**Correct Usage:**
```typescript
await authClient.requestPasswordReset({
  email: formData.email,
  redirectTo: "/auth/reset-password",
});
```

---

### Challenge 3: TypeScript Type Mismatch in sendResetPassword

**Problem:**
Explicitly typed the function parameters, causing type conflicts:

```typescript
sendResetPassword: async (
  { user, url, token }: { user: BetterAuthUser; url: string; token: string },
  request?: Request
) => { ... }
```

**Error:**
```
Type '{ user: BetterAuthUser; ... }' is not assignable to type '{ user: { ... }; ... }'.
The types of 'user.image' are incompatible.
Type 'string | null | undefined' is not assignable to type 'string | null'.
```

**Root Cause:**
Better-Auth has its own internal user type where `image` is `string | null`, but `BetterAuthUser` from Prisma has `string | null | undefined`.

**Solution:**
Removed explicit type annotations and let TypeScript infer the correct types from Better-Auth:

```typescript
sendResetPassword: async ({ user, url, token }) => {
  // TypeScript infers the correct Better-Auth types
}
```

---

### Challenge 4: Missing Verification Table

**Problem:**
After implementing the feature, got this error:

```
ERROR [Better Auth]: Model verification does not exist in the database.
```

**Root Cause:**
Password reset (and email verification) requires a `verification` table to store tokens, but it didn't exist in our database.

**Solution Steps:**

1. **Added Verification model to Prisma schema:**
```prisma
model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("verification")
}
```

2. **Created migration:**
```bash
op run --env-file="./.env.development.local" -- bun prisma migrate dev --name add_verification_table
```

3. **Regenerated Prisma Client:**
```bash
op run --env-file="./.env.development.local" -- bun prisma generate
```

**Note:** The table already existed in the database, but Prisma Client didn't know about it until we regenerated it.

---

### Challenge 5: Prisma Schema Relation Issues

**Problem:**
Multiple relation issues in the Prisma schema caused various errors.

#### Issue 5a: Incorrect Model Name

**Problem:**
Had `BetterAuthVerification` but Better-Auth expects `Verification`.

**Solution:**
Renamed model from `BetterAuthVerification` to `Verification`.

#### Issue 5b: Incorrect Relation Names

**Problem:**
Relation names didn't match Better-Auth's lowercase pluralization convention:

```prisma
betterauthsessions BetterAuthSession[] @relation("BetterAuthUserSessions")
```

**Error:**
```
Unknown field `betterauthaccounts` for select statement on model `BetterAuthUser`.
```

**Root Cause:**
Better-Auth expects lowercase pluralized relation names: `"betterauthsessions"`, not `"BetterAuthUserSessions"`.

**Solution:**
Updated all relation names to lowercase:

```prisma
model BetterAuthUser {
  betterauthsessions BetterAuthSession[] @relation("betterauthsessions")
  betterauthaccounts BetterAuthAccount[] @relation("betterauthaccounts")
}

model BetterAuthSession {
  user BetterAuthUser @relation("betterauthsessions", fields: [userId], references: [id])
}

model BetterAuthAccount {
  user BetterAuthUser @relation("betterauthaccounts", fields: [userId], references: [id])
}
```

#### Issue 5c: Duplicate Relation Fields

**Problem:**
IDE's Prisma extension kept auto-adding duplicate relation fields:

```prisma
model BetterAuthAccount {
  user             BetterAuthUser  @relation(...)
  betterAuthUser   BetterAuthUser? @relation(...)  // DUPLICATE
  betterAuthUserId String?                          // NON-EXISTENT COLUMN
}
```

**Error:**
```
The column `(not available)` does not exist in the current database.
```

**Root Cause:**
Prisma extension's auto-complete was suggesting fields that referenced non-existent database columns.

**Solution:**
1. Disabled Prisma extension temporarily while editing
2. Removed all duplicate relation fields
3. Kept only ONE relation field per model:
   - `BetterAuthAccount.user` → `BetterAuthUser`
   - `BetterAuthSession.user` → `BetterAuthUser`

**Prevention:**
- Don't accept auto-complete suggestions for relations
- Don't click lightbulb quick fixes for "missing" relations
- Verify schema against database structure

---

### Challenge 6: TanStack Router Type Errors

**Problem:**
New routes not recognized by TanStack Router's type system:

```typescript
to="/auth/forgot-password"  // Type error: not assignable
```

**Root Cause:**
Route types need to be regenerated after adding new routes.

**Solution:**
Run the build command to regenerate route types:

```bash
bun run build
```

**Temporary Workaround:**
Used `as any` type assertion until route types could be regenerated:

```typescript
to="/auth/forgot-password" as any
```

---

## Configuration Details

### Better-Auth Server Configuration

**Location:** `src/lib/auth.ts`

```typescript
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    // Password reset configuration
    sendResetPassword: async ({ user, url, token }) => {
      // In development: log to console
      console.log("=".repeat(80));
      console.log("🔐 PASSWORD RESET EMAIL");
      console.log("To:", user.email);
      console.log("Link:", url);
      console.log("Token:", token);
      console.log("Token expires in: 1 hour (default)");
      console.log("=".repeat(80));

      // In production: send actual email
      // await resend.emails.send({ ... });
    },

    // Optional callback after successful reset
    onPasswordReset: async ({ user }) => {
      console.log(`✅ Password for user ${user.email} has been reset.`);
      // Could trigger: analytics, audit logs, confirmation email, etc.
    },
  },
});
```

**Key Configuration Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `sendResetPassword` | `function` | Sends password reset email to user | Required |
| `onPasswordReset` | `function` | Callback after successful password reset | Optional |
| `resetPasswordTokenExpiresIn` | `number` | Token expiration time in seconds | `3600` (1 hour) |

---

1. **Start Development Server:**
```bash
op run --env-file="./.env.development.local" -- bun run dev
```

2. **Test Forgot Password Flow:**
   - Navigate to `http://localhost:3003/login`
   - Click "Forgot password?"
   - Enter your email address
   - Submit the form
   - Check terminal console for reset link

3. **Check Console Output:**
```
================================================================================
🔐 PASSWORD RESET EMAIL
To: user@example.com
Link: http://localhost:3003/auth/reset-password?token=eyJhbGci...
Token: eyJhbGci...
Token expires in: 1 hour (default)
================================================================================
```

4. **Test Reset Password Flow:**
   - Copy the link from console
   - Open link in browser
   - Enter new password (must meet requirements)
   - Confirm password
   - Submit form
   - Should redirect to `/login`

5. **Verify Password Reset:**
   - Check console for success message:
   ```
   ✅ Password for user user@example.com has been reset successfully.
   ```
   - Try logging in with new password
   - Should successfully authenticate

## Testing

### Edge Cases to Test

#### 1. Invalid Email
- Enter non-existent email
- Should still show success message (security)

#### 2. Expired Token
- Wait 1 hour after requesting reset
- Try to use the link
- Should show "invalid or expired" error

#### 3. Already Used Token
- Reset password successfully
- Try to use same link again
- Should show "invalid" error

#### 4. Invalid Token
- Manually modify token in URL
- Should show "invalid" error

#### 5. Password Validation
- Try password < 8 characters
- Try without uppercase letter
- Try without lowercase letter
- Try without number
- Try mismatched confirmation
- All should show appropriate validation errors

---

## Database Schema

### Verification Table

**Purpose:** Stores password reset tokens and email verification tokens.

**Schema:**
```sql
CREATE TABLE "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,      -- user email
  "value" TEXT NOT NULL,            -- hashed token
  "expires_at" TIMESTAMP NOT NULL,  -- expiration time
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);
```

**Token Lifecycle:**
1. User requests password reset
2. Token created in `verification` table
3. Token sent via email (or logged in dev)
4. User clicks link with token
5. Token validated and consumed (deleted)
6. Password updated in `account` table

**Security Features:**
- Tokens are hashed before storage
- Tokens expire after 1 hour
- Tokens are single-use (deleted after use)
- Token validation checks expiration

---

## Security Considerations

### 1. Email Enumeration Prevention

**Implementation:**
Always return the same success message regardless of whether the email exists:

```typescript
setSuccessMessage(AUTH_ERRORS.RESET_EMAIL_SENT);
// "If an account exists with this email, you will receive a password reset link shortly."
```

**Why:**
Prevents attackers from determining which emails are registered.

### 2. Token Security

- ✅ Tokens are cryptographically secure random strings
- ✅ Tokens are hashed before storage in database
- ✅ Tokens expire after 1 hour
- ✅ Tokens are single-use only
- ✅ Token validation prevents timing attacks

### 3. Rate Limiting

**❌ Not Implemented:** Rate limiting is available but not currently configured. See [RATE_LIMITING.md](./RATE_LIMITING.md) for implementation guide.

```typescript
// src/lib/auth.ts
rateLimit: {
  enabled: true,
  window: 60, // Default: 60 seconds
  max: 100,   // Default: 100 requests per window
  customRules: {
    "/forgot-password": {
      window: 60 * 15, // 15 minutes
      max: 3,          // 3 requests per 15 minutes
    },
    "/reset-password": {
      window: 60, // 1 minute
      max: 5,     // 5 attempts per minute
    },
    "/sign-in/email": {
      window: 60, // 1 minute
      max: 5,     // 5 attempts per minute
    },
    "/sign-up/email": {
      window: 60, // 1 minute
      max: 10,    // 10 attempts per minute
    },
  },
  storage: "memory", // Upgrade to "database" for production/serverless
}
```

For implementation details, see [RATE_LIMITING.md](./RATE_LIMITING.md).

### 4. Password Requirements

**Current Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Enforced By:**
- Client-side: Zod schema validation
- Server-side: Better-Auth's `minPasswordLength` (default: 8)


**Production Requirement:**
Always use HTTPS to prevent token interception:

```typescript
// In production
baseURL: "https://yourdomain.com",
trustedOrigins: ["https://yourdomain.com"],
```

---

## Future Improvements

### 1. Email Service Integration

**Current State:** Console logging (development only)

**Production Implementation:**
Replace console logging with actual email service:

```typescript
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

sendResetPassword: async ({ user, url }) => {
  await resend.emails.send({
    from: "noreply@healthmetrics.app",
    to: user.email,
    subject: "Reset Your Password",
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
},
```

**Recommended Services:**
- [Resend](https://resend.com/) - Modern email API
- [SendGrid](https://sendgrid.com/) - Enterprise email service
- [Postmark](https://postmarkapp.com/) - Transactional email
- [AWS SES](https://aws.amazon.com/ses/) - Cost-effective option

### 2. Email Template System

Create branded email templates:

```typescript
// Example: src/lib/email-templates.ts
export const passwordResetTemplate = ({ name, resetUrl }: {
  name: string;
  resetUrl: string;
}) => `
  <!DOCTYPE html>
  <html>
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h1>Hi ${name},</h1>
        <p>We received a request to reset your password.</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px;
                  background: #007bff; color: white;
                  text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
      </div>
    </body>
  </html>
`;
```

### 3. Database Storage for Rate Limiting

**Current State:** Using memory storage (not suitable for serverless/multi-instance)

**Production Upgrade:**
For production environments with multiple server instances or serverless deployments, upgrade to database storage:

```bash
# Add rate limit table to database
op run --env-file="./.env.development.local" -- bun x @better-auth/cli migrate
```

```typescript
// src/lib/auth.ts
rateLimit: {
  storage: "database",
  modelName: "rateLimit", // optional, default is "rateLimit"
}
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

**Benefits:**
- ✅ Works with serverless functions
- ✅ Consistent rate limiting across multiple instances
- ✅ Persistent tracking (survives server restarts)

### 4. Password Strength Meter

Add visual feedback for password strength:

```tsx
import { calculatePasswordStrength } from "@/lib/password-strength";

<PasswordStrengthMeter password={formData.password} />
```

### 5. Success Confirmation Email

Send confirmation after successful password reset:

```typescript
onPasswordReset: async ({ user }) => {
  await resend.emails.send({
    to: user.email,
    subject: "Password Reset Successful",
    html: `
      <p>Your password has been successfully reset.</p>
      <p>If you didn't make this change, contact support immediately.</p>
    `,
  });
},
```

### 6. Admin Audit Log

Log all password reset attempts for security monitoring:

```typescript
onPasswordReset: async ({ user }, request) => {
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_RESET",
      ipAddress: request?.headers.get("x-forwarded-for"),
      userAgent: request?.headers.get("user-agent"),
      timestamp: new Date(),
    },
  });
},
```

### 7. Multi-Factor Verification

For high-security applications, require additional verification:

```typescript
// Before sending reset email, require:
// - Security question answer
// - SMS verification code
// - Backup email confirmation
```
