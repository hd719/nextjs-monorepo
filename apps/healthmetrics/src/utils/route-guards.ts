import { redirect } from "@tanstack/react-router";
import { fetchUser } from "@/server/auth";
import { checkOnboardingRequired } from "@/server/onboarding";
import { ROUTES } from "@/constants/routes";

/**
 * Route guard that requires authentication and completed onboarding.
 * Use in route `beforeLoad` for protected pages.
 */
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
