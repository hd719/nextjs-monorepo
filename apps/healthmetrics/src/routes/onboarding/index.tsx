import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchUser } from "@/server/auth";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/onboarding/")({
  beforeLoad: async () => {
    // Check if user is authenticated
    const user = await fetchUser();

    if (!user) {
      // Not logged in, redirect to login
      throw redirect({ to: ROUTES.AUTH.LOGIN });
    }

    return { user };
  },
});
