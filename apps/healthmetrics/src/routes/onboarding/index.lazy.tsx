import { createLazyFileRoute } from "@tanstack/react-router";
import { OnboardingWizard } from "@/components/onboarding";

export const Route = createLazyFileRoute("/onboarding/")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user } = Route.useRouteContext();

  return (
    <OnboardingWizard userId={user!.id} userName={user!.name || undefined} />
  );
}
