import { createFileRoute } from "@tanstack/react-router";
import { requireAuthAndOnboarding } from "@/utils/route-guards";

export const Route = createFileRoute("/integrations/")({
  beforeLoad: async () => {
    const context = await requireAuthAndOnboarding();
    return context;
  },
});
