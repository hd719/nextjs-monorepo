# Authentication Implementation

Technical documentation for the authentication system implemented in HealthMetrics.

---

## Overview

The system uses **Better-Auth** with **Prisma** (PostgreSQL) as the database adapter, integrated with **TanStack Start's SSR** environment.

---

## Architecture

```
┌─────────────────┐
│   Client Side   │
│  (React/Vite)   │
└────────┬────────┘
         │
         ├─── authClient.signUp.email()
         ├─── authClient.signIn.email()
         └─── authClient.signOut()
         │
         ▼
┌─────────────────────────┐
│   TanStack Start        │
│   (SSR Framework)       │
│                         │
│  ┌──────────────────┐   │
│  │ /api/auth/*      │   │ <--- Better-Auth API Routes
│  └──────────────────┘   │
│                         │
│  ┌──────────────────┐   │
│  │ Server Functions │   │ <--- fetchUser(), etc.
│  └──────────────────┘   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│     Better-Auth         │
│  (Auth Framework)       │
│                         │
│  + tanstackStartCookies │ <--- Cookie Management Plugin
│  + Prisma Adapter       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Prisma ORM            │
│   (Database Client)     │
│                         │
│  + PostgreSQL Driver    │
│  + Adapter (pg)         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  PostgreSQL Database    │
└─────────────────────────┘
```

### Key Components

1. **Client-Side Authentication**: Uses Better-Auth's React client (`authClient`)
2. **Server-Side Session Management**: Server functions use `getRequestHeaders()` to read cookies
3. **Cookie Management**: `tanstackStartCookies()` plugin bridges Better-Auth and TanStack Start
4. **Database Adapter**: Prisma adapter connects Better-Auth to PostgreSQL
5. **Protected Routes**: Route-level `beforeLoad` checks authenticate users

---

## Database Schema

### Better-Auth Tables

Better-Auth requires 4 tables:

#### User Table

```prisma
model BetterAuthUser {
  id            String    @id
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  betterauthsessions  BetterAuthSession[]
  betterauthaccounts  BetterAuthAccount[]
  userProfile   User?

  @@map("user")
}
```

#### Session Table

```prisma
model BetterAuthSession {
  id        String   @id
  userId    String
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user BetterAuthUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("session")
}
```

#### Account Table

```prisma
model BetterAuthAccount {
  id           String   @id
  userId       String
  accountId    String
  providerId   String
  accessToken  String?
  refreshToken String?
  idToken      String?
  expiresAt    DateTime?
  password     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user BetterAuthUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("account")
}
```

#### Verification Table

```prisma
model BetterAuthVerification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verification")
}
```

### Two User Tables Explained

The database has **two** user tables:

1. **`user` table** (BetterAuthUser) - Auth data managed by Better-Auth
2. **`users` table** (User) - App profile data managed by our code

**Benefits:**

- Separation of concerns
- Security (credentials separate from profile)
- Better-Auth compatibility
- Independent lifecycles

---

## Configuration Files

### Server Config (`src/lib/auth-config.ts`)

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3003",
  trustedOrigins: ["http://localhost:3003"],

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  user: { modelName: "betterAuthUser" },
  session: {
    modelName: "betterAuthSession",
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  account: { modelName: "betterAuthAccount" },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  plugins: [tanstackStartCookies()], // MUST be last
});
```

### Client Config (`src/lib/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL || "http://localhost:3003",
});

export const { signIn, signUp, useSession } = authClient;
```

### API Route (`src/routes/api/auth/$.ts`)

```typescript
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => auth.handler(request),
      POST: async ({ request }) => auth.handler(request),
    },
  },
});
```

---

## Authentication Flows

### Signup Flow

1. User fills signup form
2. Client validates with Zod
3. `authClient.signUp.email()` → `/api/auth/sign-up`
4. Better-Auth creates user, hashes password, generates verification token
5. Verification email logged to console (dev)
6. User redirected to verify page

### Login Flow

1. User enters credentials
2. `authClient.signIn.email()` → `/api/auth/sign-in`
3. Better-Auth validates credentials
4. Session created, cookies set
5. User redirected to `/onboarding` (new) or `/dashboard` (existing)

### Session Validation

1. Route `beforeLoad` calls `fetchUser()`
2. `getRequestHeaders()` reads cookies
3. `auth.api.getSession()` validates session
4. User data returned or redirect to login

---

## File Structure

```
src/
├── lib/
│   ├── auth-config.ts      # Server auth config
│   ├── auth-client.ts      # Client auth config
│   └── prisma.ts           # Prisma client
│
├── server/
│   └── auth.ts             # fetchUser() server function
│
├── routes/
│   ├── api/auth/$.ts       # Better-Auth API handler
│   └── auth/
│       ├── login.tsx
│       ├── signup.tsx
│       ├── verify-email.tsx
│       ├── forgot-password.tsx
│       └── reset-password.tsx
│
├── components/auth/
│   ├── AuthCard.tsx        # Auth form container
│   └── AuthLayout.tsx      # Auth page layout
│
├── utils/
│   ├── auth-helpers.ts     # Error message helpers
│   └── validation.ts       # Zod schemas
│
└── constants/
    └── errors.ts           # Error messages
```

---

## Challenges & Solutions

### 1. Prisma 7 Breaking Changes

**Problem:** `url` no longer allowed in `schema.prisma`
**Solution:** Use `prisma.config.ts` for database URL

### 2. Model Name Conflicts

**Problem:** Better-Auth queried wrong `User` model
**Solution:** Custom model names (`betterAuthUser`, etc.)

### 3. Relation Name Mismatch

**Problem:** Better-Auth expects lowercase pluralized relations
**Solution:** Use `betterauthsessions`, `betterauthaccounts`

### 4. Session Cookies Not Read

**Problem:** Server functions couldn't read cookies
**Solution:** Use `getRequestHeaders()` from TanStack Start

### 5. Cookie Setting Failed

**Problem:** Server functions interfered with `Set-Cookie`
**Solution:** Use `authClient` directly for auth operations

### 6. CORS/Origin Errors

**Problem:** "Invalid origin" error
**Solution:** Configure `baseURL` and `trustedOrigins`

---

## Important Notes

1. **`tanstackStartCookies()` must be last** in plugins array
2. **Use client-side auth** for login/signup (cookie setting)
3. **Use server functions** only for reading session data
4. **Relation names must be lowercase** for Better-Auth compatibility

---

## Challenges & Solutions

### Challenge 1: Prisma 7 Breaking Changes

**Problem:**

```note
Error: The datasource property `url` is no longer supported in schema files.
```

**Root Cause:**
Prisma 7 removed the ability to define `url` in the `datasource` block of `schema.prisma`.

**Solution:**

1. Created `prisma/prisma.config.ts`:

   ```typescript
   export default defineConfig({
     datasource: {
       url: env("DATABASE_URL"),
     },
   });
   ```

2. Removed `url` from `schema.prisma`
3. Used 1Password CLI for secrets: `op run --env-file="./.env.development.local" -- bun prisma migrate dev`

---

### Challenge 2: Better-Auth CLI Initial Failure

**Problem:**

```note
[#better-auth]: Couldn't read your auth config.
TypeError: First argument must be an Error object
```

**Root Cause:**
Better-Auth CLI (`@better-auth/cli generate`) initially failed. This was likely related to the Prisma Client setup issues we were experiencing at the time (missing adapter, incorrect configuration).

**Solution:**

1. Manually added Better-Auth tables to `schema.prisma` based on official documentation
2. After fixing Prisma Client setup (adding `@prisma/adapter-pg`, proper config), the CLI started working again

**Note for Future Setup:**
Try running the CLI first after ensuring Prisma Client is properly configured:

```bash
op run --env-file="./.env.development.local" -- bun x @better-auth/cli@latest generate
```

If it works, it will automatically add the necessary tables. If not, you can manually add them as documented above.

---

### Challenge 3: Prisma Client Not Found

**Problem:**

```note
Module '"@prisma/client"' has no exported member 'PrismaClient'.
```

**Root Cause:**
Missing `output` path in `generator client` block (required for Prisma 7 in monorepos).

**Solution:**
Added to `schema.prisma`:

```prisma
generator client {
  provider   = "prisma-client-js"
  output     = "./generated"
  engineType = "binary"
}
```

Then ran: `bun prisma generate`

---

### Challenge 4: Prisma Client Constructor Validation Error

**Problem:**

```note
PrismaClientConstructorValidationError: `PrismaClient` needs to be constructed with options
```

**Root Cause:**
Prisma 7 requires non-empty constructor options when using PostgreSQL.

**Solution:**
Used driver adapter pattern in `src/lib/prisma.ts`:

```typescript
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

return new PrismaClient({
  adapter,
  log: ["error"],
});
```

---

### Challenge 5: Engine Type Mismatch

**Problem:**

```note
error: Using engine type "client" requires either "adapter" or "accelerateUrl"
```

**Root Cause:**
Prisma Client was being generated with `engineType = "client"` (WASM) by default.

**Solution:**
Explicitly set in `schema.prisma`:

```prisma
generator client {
  engineType = "binary"  # Use Rust query engine
}
```

---

### Challenge 6: Model Name Conflicts

**Problem:**

```note
Invalid `prisma.user.findFirst()` invocation:
Unknown argument `email`.
```

**Root Cause:**
Better-Auth was querying the application's `User` model (which doesn't have `email`) instead of the Better-Auth user model.

**Solution:**

1. Renamed models in Prisma schema:
   - Better-Auth: `BetterAuthUser`, `BetterAuthSession`, `BetterAuthAccount`
   - Application: `AppUser`

2. Configured Better-Auth to use custom names:

   ```typescript
   user: { modelName: "betterAuthUser" },
   session: { modelName: "betterAuthSession" },
   account: { modelName: "betterAuthAccount" },
   ```

---

### Challenge 7: Relation Name Mismatch

**Problem:**

```note
Unknown field `betterauthaccounts` for select statement on model `BetterAuthUser`.
```

**Root Cause:**
Better-Auth expects lowercase pluralized relation names (e.g., `betterauthaccounts`), but Prisma schema had camelCase (`betterAuthAccounts`).

**Solution:**
Updated relation names in `schema.prisma`:

```prisma
model BetterAuthUser {
  // Changed from betterAuthSessions to betterauthsessions
  betterauthsessions  BetterAuthSession[]
  betterauthaccounts  BetterAuthAccount[]
}
```

---

### Challenge 8: CORS / Invalid Origin Error

**Problem:**

```note
ERROR [Better Auth]: Invalid origin: http://localhost:3003
```

**Root Cause:**
Better-Auth requires explicit configuration of `baseURL` and `trustedOrigins` for security.

**Solution:**
Added to `src/lib/auth.ts`:

```typescript
baseURL: process.env.APP_URL || "http://localhost:3003",
trustedOrigins: ["http://localhost:3003"],
```

---

### Challenge 9: Session Cookies Not Being Read

**Problem:**
User logs in successfully, cookies are set, but gets redirected to landing page instead of dashboard.

**Root Cause:**
Server function `fetchUser()` was using empty headers (`new Headers()`), so it couldn't read session cookies.

**Solution:**

1. Used TanStack Start's `getRequestHeaders()`:

   ```typescript
   import { getRequestHeaders } from "@tanstack/react-start/server";

   const headers = getRequestHeaders();
   const session = await auth.api.getSession({ headers });
   ```

2. Added `tanstackStartCookies()` plugin to Better-Auth config:

   ```typescript
   plugins: [tanstackStartCookies()], // Must be LAST
   ```

**Why This Works:**

- `getRequestHeaders()` retrieves actual request headers (including cookies) from TanStack Start's SSR context
- `tanstackStartCookies()` plugin bridges Better-Auth's cookie handling with TanStack Start
- Together, they ensure cookies are properly read and written in SSR environment

---

### Challenge 10: Server Functions Interfering with Cookies

**Problem:**
Initially attempted to handle login/signup via server functions, but cookies weren't being set properly.

**Root Cause:**
Server functions can interfere with `Set-Cookie` headers in Better-Auth responses.

**Solution:**
Use Better-Auth's client API directly for authentication operations:

- ✅ `authClient.signUp.email()` - Client-side
- ✅ `authClient.signIn.email()` - Client-side
- ✅ `authClient.signOut()` - Client-side

Server functions are only used for:

- ✅ `fetchUser()` - Reading session data
- ✅ Protected route checks

This ensures Better-Auth has full control over cookie management.
