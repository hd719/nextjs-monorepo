import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchUser } from "@/server/auth";
import { checkOnboardingRequired } from "@/server/onboarding";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/exercise/")({
  beforeLoad: async () => {
    const user = await fetchUser();

    if (!user) {
      throw redirect({ to: ROUTES.HOME });
    }

    // Check if user needs onboarding
    const { required: needsOnboarding } = await checkOnboardingRequired({
      data: { userId: user.id },
    });

    if (needsOnboarding) {
      throw redirect({ to: ROUTES.ONBOARDING });
    }

    return { user };
  },
});
