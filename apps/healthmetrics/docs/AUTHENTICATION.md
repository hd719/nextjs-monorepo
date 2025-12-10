# Authentication Documentation

## Overview

This document provides a comprehensive guide to the authentication system implemented in the HealthMetrics application. The system uses **Better-Auth** with **Prisma** (PostgreSQL) as the database adapter, integrated with **TanStack Start's SSR** environment.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Database Setup](#database-setup)
3. [Better-Auth Configuration](#better-auth-configuration)
4. [Authentication Flows](#authentication-flows)
5. [File Structure](#file-structure)
6. [Challenges & Solutions](#challenges--solutions)
7. [Future Enhancements](#future-enhancements)

---

## Architecture

### High-Level Overview

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
│  Prisma Postgres        │
│  (Managed Database)     │
└─────────────────────────┘
```

### Key Components

1. **Client-Side Authentication**: Uses Better-Auth's React client (`authClient`) to call authentication APIs
2. **Server-Side Session Management**: Server functions use `getRequestHeaders()` to read session cookies
3. **Cookie Management**: `tanstackStartCookies()` plugin bridges Better-Auth and TanStack Start
4. **Database Adapter**: Prisma adapter connects Better-Auth to PostgreSQL
5. **Protected Routes**: Route-level `beforeLoad` checks authenticate users

---

## Database Setup

### 1. Prisma Configuration (Prisma 7)

Prisma 7 introduced breaking changes, requiring configuration outside of `schema.prisma`.

#### **`prisma/prisma.config.ts`**

```typescript
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"), // Read from environment
  },
});
```

**Key Changes in Prisma 7:**

- Cannot define `url` in `datasource` block in `schema.prisma`
- Must use `prisma.config.ts` for database URL configuration
- Database URL is read from environment variables via `env("DATABASE_URL")`

### 2. Prisma Schema

#### **Generator Configuration**

```prisma
generator client {
  provider   = "prisma-client-js"
  output     = "./generated"
  engineType = "binary"
}
```

**Important Settings:**

- `output = "./generated"`: Generates Prisma Client to `prisma/generated/` (required for monorepo)
- `engineType = "binary"`: Uses Rust query engine (default WASM engine requires adapter)

#### **Datasource Configuration**

```prisma
datasource db {
  provider = "postgresql"
  // Note: URL is NOT defined here in Prisma 7
  // It's configured in prisma.config.ts instead
}
```

### 3. Better-Auth Database Tables

Better-Auth requires 4 tables for authentication.

**Note on Setup:**
Initially, we attempted to use the Better-Auth CLI (`bun x @better-auth/cli@latest generate`) to auto-generate these tables, but it failed due to incompatibility with Prisma 7's new config system. We manually added the tables based on the documentation. However, after fixing the Prisma Client setup (adding the adapter and proper configuration), the CLI may have started working again. If you're setting up a new project, try the CLI first:

```bash
op run --env-file="./.env.development.local" -- bun x @better-auth/cli@latest generate
```

If the CLI works, it will automatically add these tables. If not, manually add them as shown below:

#### **User Table** (Better-Auth)

```prisma
model BetterAuthUser {
  id            String    @id
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations (lowercase pluralized - Better-Auth convention)
  betterauthsessions  BetterAuthSession[]
  betterauthaccounts  BetterAuthAccount[]

  // Link to application user profile
  userProfile   AppUser?

  @@map("user") // Maps to 'user' table in database
}
```

#### **Session Table**

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

#### **Account Table** (for email/password)

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
  password     String?  // Hashed password
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user BetterAuthUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("account")
}
```

#### **Verification Table** (for email verification)

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

### 4. Application User Table

The application has its own user table linked to Better-Auth:

```prisma
model AppUser {
  id               String           @id @default(uuid()) @db.Uuid
  displayName      String?
  avatarUrl        String?
  dateOfBirth      DateTime?
  gender           Gender?
  heightCm         Decimal?         @db.Decimal(5, 2)
  activityLevel    ActivityLevel?
  goalType         GoalType?
  targetWeightKg   Decimal?         @db.Decimal(5, 2)
  // ... other health-related fields ...

  // Link to Better-Auth user (one-to-one)
  authUserId       String?          @unique
  authUser         BetterAuthUser?  @relation(fields: [authUserId], references: [id])

  @@map("users")
}
```

**Why Two Separate User Tables?**

You'll notice in the database there are **two** user tables:

1. **`user` table** (from `BetterAuthUser` model)
   - Contains authentication data: email, password, verification status
   - Managed by Better-Auth
   - Links to sessions and accounts

2. **`users` table** (from `AppUser` model)
   - Contains application-specific health profile data
   - Your app manages this data
   - Optional link to auth user via `authUserId`

**Benefits of Separation:**

- ✅ **Separation of concerns**: Auth logic stays isolated from business logic
- ✅ **Security**: Credentials separated from profile data
- ✅ **Flexibility**: Auth user can exist without profile (and vice versa)
- ✅ **Better-Auth compatibility**: Don't pollute auth tables with app-specific fields
- ✅ **Different lifecycles**: Auth data and profile data can evolve independently

**The Relationship:**

```
BetterAuthUser (user table) <-> AppUser (users table)
      1                    :    0..1
   (required)              :  (optional)
```

When implementing user registration, you'll need to:

1. Create `BetterAuthUser` via Better-Auth (done automatically on signup)
2. Create corresponding `AppUser` record with health data
3. Link them: `appUser.authUserId = betterAuthUser.id`

**Naming Convention:**

- Better-Auth models: `BetterAuthUser`, `BetterAuthSession`, `BetterAuthAccount`
- Application model: `AppUser` (to avoid conflicts)
- Database tables: `user` (auth), `users` (app profile)
- Relation names: **lowercase pluralized** (e.g., `betterauthsessions`) - Better-Auth requirement

### 5. Prisma Client Setup

#### **`src/lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
  // Create PostgreSQL adapter with connection string
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });

  // Initialize Prisma Client with the adapter
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
```

**Key Points:**

- Uses `@prisma/adapter-pg` for PostgreSQL driver
- Singleton pattern prevents multiple instances in development
- Log configuration for debugging queries in dev

### 6. Running Migrations

```bash
# Use 1Password CLI to inject DATABASE_URL secret
op run --env-file="./.env.development.local" -- bun prisma migrate dev --name init

# Generate Prisma Client after schema changes
op run --env-file="./.env.development.local" -- bun prisma generate
```

**Environment Variables Required:**

- `DATABASE_URL`: PostgreSQL connection string (stored in 1Password)

---

## Better-Auth Configuration

### 1. Server Configuration

#### **`src/lib/auth.ts`**

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  // Base URL for auth endpoints
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3003",

  // CORS configuration
  trustedOrigins: ["http://localhost:3003"],

  // Database connection via Prisma adapter
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Map to custom Better-Auth model names
  user: {
    modelName: "betterAuthUser",
  },
  session: {
    modelName: "betterAuthSession",
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },
  account: {
    modelName: "betterAuthAccount",
  },

  // Enable email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // Email verification (console logging for dev)
  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      const url = `${process.env.APP_URL || "http://localhost:3003"}/auth/verify-email?token=${token}`;
      console.log("=".repeat(80));
      console.log("📧 VERIFICATION EMAIL");
      console.log("To:", user.email);
      console.log("Link:", url);
      console.log("=".repeat(80));
    },
  },

  // Performance optimization
  experimental: {
    joins: true, // Enable SQL joins for better performance
  },

  // TanStack Start integration - MUST be last in plugins array
  plugins: [tanstackStartCookies()],
});

export type Session = typeof auth.$Infer.Session;
```

**Critical Configuration Points:**

1. **`tanstackStartCookies()` Plugin**:
   - **Must be the last plugin** in the array
   - Handles cookie management in TanStack Start's SSR context
   - Without it, sessions won't persist correctly

2. **Model Name Mapping**:
   - Maps Better-Auth's expected model names to our custom Prisma models
   - Prevents conflicts with application's `User` model

3. **Email Verification**:
   - Currently logs to console (development only)
   - In production, replace with actual email service (e.g., Resend, SendGrid)

### 2. API Route Handler

Better-Auth requires a catch-all API route to handle authentication requests.

#### **`src/routes/api/auth/$.ts`**

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return await auth.handler(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return await auth.handler(request);
      },
    },
  },
});
```

**This route handles:**

- `/api/auth/sign-in` - Login
- `/api/auth/sign-up` - Registration
- `/api/auth/sign-out` - Logout
- `/api/auth/verify-email` - Email verification
- `/api/auth/session` - Session management
- And all other Better-Auth endpoints

### 3. Client Configuration

#### **`src/lib/auth-client.ts`**

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3003", // Points to /api/auth/* endpoints
});

// Export commonly used functions
export const { signIn, signUp, useSession } = authClient;
```

**Client Usage:**

- `authClient.signUp.email()` - Register new user
- `authClient.signIn.email()` - Log in existing user
- `authClient.signOut()` - Log out user
- `useSession()` - React hook to get current session

---

## TanStack Start Integration

### 1. Server Functions

Server functions in TanStack Start need special handling to access session cookies.

#### **`src/server/auth.ts`**

```typescript
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
    // Get request headers (including cookies) from TanStack Start context
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  } catch (error) {
    console.error("Failed to fetch user session:", error);
    return null;
  }
});
```

**Critical Function:**

- `getRequestHeaders()`: TanStack Start function that retrieves actual request headers in SSR context
- **Why it's needed**: Server functions don't receive `request` object directly; must use this helper
- **Without it**: Cannot read session cookies, authentication fails

### 2. Root Route Authentication

#### **`src/routes/__root.tsx`**

```typescript
import { fetchUser } from "@/server/auth";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await fetchUser();
    return { user };
  },
  // ... component ...
});
```

**How it works:**

1. Before any route loads, `fetchUser()` runs on the server
2. Reads session cookies via `getRequestHeaders()`
3. Fetches user data from Better-Auth
4. Makes user data available to all child routes via `context`

### 3. Protected Routes

#### **`src/routes/dashboard/index.tsx`**

```typescript
import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchUser } from "@/server/auth";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async () => {
    const user = await fetchUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
    return { user };
  },
  component: DashboardComponent,
});
```

**Protection Flow:**

1. User navigates to `/dashboard`
2. `beforeLoad` runs on server
3. `fetchUser()` checks for valid session
4. If no session → redirect to `/login`
5. If session exists → allow access + provide user data

---

## Authentication Flows

### 1. User Registration (Sign Up)

#### **Client-Side: `src/routes/signup/index.tsx`**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setServerError(null);
  setSuccessMessage(null);

  // Validate form data
  const result = signupSchema.safeParse(formData);
  if (!result.success) {
    // Show validation errors
    return;
  }

  try {
    // Call Better-Auth API directly
    const response = await authClient.signUp.email({
      email: formData.email,
      password: formData.password,
      name: formData.name,
    });

    if (response.error) {
      setServerError(getErrorMessage(response.error));
      return;
    }

    // Show success message
    setSuccessMessage(
      "Account created successfully! Please check your email to verify your account."
    );
  } catch (error) {
    setServerError(getErrorMessage(error));
  }
};
```

**Flow:**

1. User fills out signup form
2. Client validates with Zod schema
3. Calls `authClient.signUp.email()` → hits `/api/auth/sign-up`
4. Better-Auth:
   - Hashes password
   - Creates user record in `BetterAuthUser` table
   - Creates account record in `BetterAuthAccount` table
   - Generates verification token
   - Logs verification email to console (dev)
5. User receives success message

### 2. Email Verification

#### **`src/routes/auth/verify-email.tsx`**

```typescript
export const Route = createFileRoute("/auth/verify-email")({
  component: VerifyEmailComponent,
});

function VerifyEmailComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch() as { token?: string };

  useEffect(() => {
    const verifyEmail = async () => {
      if (!search.token) {
        setError("No verification token provided");
        return;
      }

      try {
        // Call Better-Auth verification endpoint
        const response = await authClient.verifyEmail({
          token: search.token,
        });

        if (response.error) {
          setError(getErrorMessage(response.error));
          return;
        }

        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 2000);
      } catch (error) {
        setError(getErrorMessage(error));
      }
    };

    verifyEmail();
  }, [search.token]);
}
```

**Flow:**

1. User clicks verification link in email
2. Link contains token: `/auth/verify-email?token=xxx`
3. Page calls `authClient.verifyEmail()` → hits `/api/auth/verify-email`
4. Better-Auth validates token and sets `emailVerified = true`
5. User redirected to login page

### 3. User Login

#### **Client-Side: `src/routes/login/index.tsx`**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setServerError(null);

  // Validate form
  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    // Show validation errors
    return;
  }

  try {
    // Call Better-Auth API directly
    const response = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
    });

    if (response.error) {
      setServerError(getErrorMessage(response.error));
      return;
    }

    // Navigate to dashboard on success
    navigate({ to: "/dashboard" });
  } catch (error) {
    setServerError(getErrorMessage(error));
  }
};
```

**Flow:**

1. User enters email and password
2. Client validates with Zod schema
3. Calls `authClient.signIn.email()` → hits `/api/auth/sign-in`
4. Better-Auth:
   - Looks up user by email
   - Verifies password hash
   - Checks if email is verified
   - Creates session record
   - Sets session cookie (`better-auth.session_data`, `better-auth.session_token`)
5. User redirected to dashboard
6. Root route `beforeLoad` reads cookies and fetches user data

**Why Client-Side?**

- Better-Auth's cookie-setting happens in API response headers
- Server functions can interfere with `Set-Cookie` headers
- Using `authClient` directly ensures cookies are set correctly

### 4. Session Management

#### **How Sessions Work:**

1. **Login** → Better-Auth creates:
   - Session record in database
   - Two cookies:
     - `better-auth.session_data`: Encrypted session data
     - `better-auth.session_token`: Session token

2. **Subsequent Requests** → TanStack Start:
   - Reads cookies via `getRequestHeaders()`
   - Passes to `auth.api.getSession()`
   - Better-Auth validates and returns user data

3. **Cookie Cache**:

   ```typescript
   session: {
     cookieCache: {
       enabled: true,
       maxAge: 5 * 60, // 5 minutes
     },
   }
   ```

   - Caches session data in cookies for 5 minutes
   - Reduces database queries for frequently accessed session data

### 5. User Logout

#### **Client-Side: `src/components/layout/ProfileMenu.tsx`**

```typescript
const handleLogout = async () => {
  try {
    await authClient.signOut();
    navigate({ to: "/" }); // Redirect to landing page
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
```

**Flow:**

1. User clicks logout button
2. Calls `authClient.signOut()` → hits `/api/auth/sign-out`
3. Better-Auth:
   - Deletes session record from database
   - Clears session cookies
4. User redirected to landing page
5. Next route navigation → `beforeLoad` finds no session → guest mode

---

## File Structure

```note
apps/healthmetrics/
├── prisma/
│   ├── schema.prisma              # Database schema (with Better-Auth tables)
│   ├── prisma.config.ts           # Prisma 7 configuration
│   ├── migrations/                # Database migrations
│   └── generated/                 # Generated Prisma Client
│
├── src/
│   ├── lib/
│   │   ├── auth.ts               # Better-Auth server config
│   │   ├── auth-client.ts        # Better-Auth client config
│   │   ├── prisma.ts             # Prisma Client singleton
│   │   └── validation.ts         # Zod schemas for forms
│   │
│   ├── server/
│   │   └── auth.ts               # Server functions (fetchUser)
│   │
│   ├── utils/
│   │   └── auth-helpers.ts       # Error message helpers
│   │
│   ├── routes/
│   │   ├── __root.tsx            # Root route (global auth check)
│   │   ├── index.tsx             # Landing page
│   │   ├── login/
│   │   │   └── index.tsx         # Login page
│   │   ├── signup/
│   │   │   └── index.tsx         # Signup page
│   │   ├── auth/
│   │   │   └── verify-email.tsx  # Email verification
│   │   ├── dashboard/
│   │   │   └── index.tsx         # Protected dashboard
│   │   └── api/
│   │       └── auth/
│   │           └── $.ts          # Better-Auth API handler
│   │
│   ├── components/
│   │   ├── forms/
│   │   │   ├── AuthLayout.tsx    # Auth page layout
│   │   │   ├── AuthCard.tsx      # Auth card container
│   │   │   └── AuthFormField.tsx # Reusable form field
│   │   └── layout/
│   │       └── ProfileMenu.tsx   # User menu (with logout)
│   │
│   ├── types/
│   │   └── auth.ts               # TypeScript types
│   │
│   └── constants/
│       └── errors.ts             # Error messages
│
└── docs/
    └── AUTHENTICATION.md         # This file
```

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

## Future Enhancements

### 1. Email Service Integration

Replace console logging with actual email service:

```typescript
// Example with Resend
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

emailVerification: {
  sendVerificationEmail: async ({ user, token }) => {
    const url = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    await resend.emails.send({
      from: "noreply@healthmetrics.app",
      to: user.email,
      subject: "Verify your email",
      html: `<a href="${url}">Click here to verify</a>`,
    });
  },
}
```

### 2. Password Reset

Add password reset flow:

```typescript
// Better-Auth supports this out of the box
resetPassword: {
  enabled: true,
  sendResetPasswordEmail: async ({ user, token }) => {
    // Send reset email
  },
}
```

### 3. Social Authentication

Add OAuth providers:

```typescript
socialProviders: {
  google: {
    enabled: true,
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  github: {
    enabled: true,
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
}
```

### 4. Two-Factor Authentication

```typescript
twoFactor: {
  enabled: true,
  issuer: "HealthMetrics",
}
```

### 5. Session Management UI

Build a page showing:

- Active sessions
- Device information
- Last active time
- Ability to revoke sessions
