import { redirect } from "@tanstack/react-router";
import { fetchUser } from "@/server/auth";
import { checkOnboardingRequired } from "@/server/onboarding";
import { ROUTES } from "@/constants/routes";

// Redirects authenticated users to dashboard (for landing, login, signup pages)
export async function redirectIfAuthenticated() {
  const user = await fetchUser();

  if (user) {
    const { required: needsOnboarding } = await checkOnboardingRequired({
      data: { userId: user.id },
    });

    if (needsOnboarding) {
      throw redirect({ to: ROUTES.ONBOARDING });
    }

    throw redirect({ to: ROUTES.DASHBOARD });
  }

  return { user: null };
}

// Requires authentication and completed onboarding (for protected pages)
export async function requireAuthAndOnboarding() {
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
}

/**
 * Route guard that only requires authentication (no onboarding check).
 * Use for routes like onboarding itself.
 */
export async function requireAuth() {
  const user = await fetchUser();

  if (!user) {
    throw redirect({ to: ROUTES.AUTH.LOGIN });
  }

  return { user };
}
