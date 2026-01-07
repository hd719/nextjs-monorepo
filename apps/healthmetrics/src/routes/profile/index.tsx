import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchUser } from "@/server/auth";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/profile/")({
  beforeLoad: async () => {
    const user = await fetchUser();

    if (!user) {
      throw redirect({ to: ROUTES.HOME });
    }

    return { user };
  },
});
