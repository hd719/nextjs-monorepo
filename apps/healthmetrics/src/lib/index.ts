/**
 * Lib Index - Client-Safe Exports Only
 *
 * IMPORTANT: This barrel file is imported by client-side code.
 * Only export client-safe modules here (no Node.js dependencies).
 *
 * For server-only imports (prisma, logger, auth config), import directly:
 *   import { prisma } from "@/lib/prisma";
 *   import { createLogger } from "@/lib/logger";
 *   import { auth } from "@/lib/auth-config";
 */

// Authentication client (Better Auth) - Client-safe
export { authClient, signIn, signUp, useSession } from "./auth-client";
