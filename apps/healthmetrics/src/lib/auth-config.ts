/**
 * Better Auth Server Configuration
 *
 * This file configures the server-side authentication using Better Auth.
 * It sets up:
 * - Database adapter (Prisma with PostgreSQL)
 * - Session management with cookie caching
 * - Email/password authentication with email verification
 * - Password reset functionality
 * - User profile creation hooks
 *
 * For client-side auth, see auth-client.ts
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { prisma } from "@/lib/prisma";
import { DEFAULT_DEV_URL } from "@/constants";
import { validateEnv } from "@/utils/env";

// Validate environment variables at startup
// This fails fast if required vars (DATABASE_URL, BETTER_AUTH_SECRET) are missing
validateEnv();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || DEFAULT_DEV_URL,
  trustedOrigins: [DEFAULT_DEV_URL],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "betterAuthUser",
  },
  session: {
    modelName: "betterAuthSession",
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  account: {
    modelName: "betterAuthAccount",
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            // Create User profile linked to BetterAuthUser
            await prisma.user.create({
              data: {
                id: user.id, // Same id as BetterAuthUser for 1:1 relationship
                timezone: "UTC",
                unitsPreference: "metric",
              },
            });
            console.log(`Created User profile for user ID: ${user.id}`);
          } catch (error) {
            console.error(
              `Failed to create User profile for user ID ${user.id}:`,
              error
            );
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // Password reset function (direct property, not nested)
    sendResetPassword: async ({ user, url, token }) => {
      const resetPasswordUrl =
        `${process.env.APP_URL || DEFAULT_DEV_URL}/auth/reset-password?token=${token}` ||
        url;
      console.log("=".repeat(80));
      console.log("PASSWORD RESET EMAIL");
      console.log("To:", user.email);
      console.log("Link:", resetPasswordUrl);
      console.log("Token:", token);
      console.log("Token expires in: 1 hour (default)");
      console.log("=".repeat(80));
    },
    // Callback after successful password reset
    onPasswordReset: async ({ user }) => {
      console.log(
        `Password for user ${user.email} has been reset successfully.`
      );
    },
  },
  // Email verification (console logging for dev)
  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      const url = `${process.env.APP_URL || DEFAULT_DEV_URL}/auth/verify-email?token=${token}`;
      console.log("=".repeat(80));
      console.log("VERIFICATION EMAIL");
      console.log("To:", user.email);
      console.log("Link:", url);
      console.log("=".repeat(80));
    },
  },
  // Enable experimental joins for performance (as per docs)
  experimental: {
    joins: true,
  },
  // TanStack Start integration - MUST be last in plugins array
  plugins: [tanstackStartCookies()],
});

export type Session = typeof auth.$Infer.Session;
