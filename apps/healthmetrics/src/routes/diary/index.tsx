import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchUser } from "@/server/auth";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/diary/")({
  beforeLoad: async () => {
    const user = await fetchUser();

    if (!user) {
      throw redirect({ to: ROUTES.HOME });
    }

    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    return { user, date: today };
  },
});
