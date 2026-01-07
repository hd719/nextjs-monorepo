import { createFileRoute } from "@tanstack/react-router";
import { requireAuthAndOnboarding } from "@/utils/route-guards";

export const Route = createFileRoute("/exercise/")({
  beforeLoad: requireAuthAndOnboarding,
});
