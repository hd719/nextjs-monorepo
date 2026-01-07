import { createAuthClient } from "better-auth/react";
import { DEFAULT_DEV_URL } from "@/constants";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL || DEFAULT_DEV_URL,
});

export const { signIn, signUp, useSession } = authClient;
