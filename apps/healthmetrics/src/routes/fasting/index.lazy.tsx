import { createLazyFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout";
import { FastingPage } from "@/components/fasting";

export const Route = createLazyFileRoute("/fasting/")({
  component: FastingPageRoute,
});

function FastingPageRoute() {
  const { user } = Route.useRouteContext();

  // User is guaranteed by requireAuthAndOnboarding guard
  if (!user) return null;

  return (
    <AppLayout>
      <div className="animate-fade-slide-in">
        <FastingPage userId={user.id} />
      </div>
    </AppLayout>
  );
}
