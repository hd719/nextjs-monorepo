import { useLandingInteractions } from "./useLandingInteractions";
import {
  LandingBarbell,
  LandingCTA,
  LandingFeatures,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingHow,
  LandingIntegrations,
  LandingValues,
} from "./sections";

export function LandingPage() {
  useLandingInteractions();

  return (
    <div className="landing-container">
      <LandingHeader />

      <main className="landing-main">
        <LandingHero />
        <LandingIntegrations />
        <LandingFeatures />
        <LandingBarbell />
        <LandingHow />
        <LandingValues />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
