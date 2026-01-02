import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

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
    console.error("Failed to fetch user session:", error);
    return null;
  }
});

// Add more auth-related server functions here as needed
// Examples:
// - updateUserProfile
// - changePassword
// - deleteAccount
// - etc.
