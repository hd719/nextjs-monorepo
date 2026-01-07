import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchUser } from "@/server/auth";
import { checkOnboardingRequired } from "@/server/onboarding";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/diary/")({
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

    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    return { user, date: today };
  },
});
