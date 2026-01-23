import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireAuthAndOnboarding } from "@/utils/route-guards";
import { isWhoopIntegrationEnabled } from "@/utils/env";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/integrations/")({
  beforeLoad: async () => {
    const context = await requireAuthAndOnboarding();
    if (!isWhoopIntegrationEnabled()) {
      throw redirect({ to: ROUTES.DASHBOARD });
    }
    return context;
  },
});
