import { createFileRoute } from "@tanstack/react-router";
import { requireAuthAndOnboarding } from "@/utils/route-guards";

export const Route = createFileRoute("/diary/")({
  beforeLoad: async () => {
    // Require auth and onboarding
    const { user } = await requireAuthAndOnboarding();

    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    return { user, date: today };
  },
});
