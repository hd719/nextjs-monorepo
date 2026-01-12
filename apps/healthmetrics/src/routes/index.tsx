import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing";
import { redirectIfAuthenticated } from "@/utils/route-guards";

export const Route = createFileRoute("/")({
  beforeLoad: redirectIfAuthenticated,
  component: LandingPage,
});
