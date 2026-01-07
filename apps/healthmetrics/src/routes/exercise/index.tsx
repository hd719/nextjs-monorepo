import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchUser } from "@/server/auth";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/exercise/")({
  beforeLoad: async () => {
    const user = await fetchUser();

    if (!user) {
      throw redirect({ to: ROUTES.HOME });
    }

    return { user };
  },
  // Lazy load the component for better bundle splitting
  component: () =>
    import("./index.lazy").then((d) => d.Route.options.component),
});
