import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth-config";
import { createLogger } from "@/lib/logger";

const log = createLogger("server:auth");

export const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
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
    log.error({ err: error }, "Failed to fetch user session");
    return null;
  }
});

// Add more auth-related server functions here as needed
// Examples:
// - updateUserProfile
// - changePassword
// - deleteAccount
// - etc.
