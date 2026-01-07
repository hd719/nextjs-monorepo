import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/utils/route-guards";

export const Route = createFileRoute("/onboarding/")({
  beforeLoad: requireAuth,
});
