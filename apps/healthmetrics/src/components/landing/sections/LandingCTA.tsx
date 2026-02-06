import { Link } from "@tanstack/react-router";
import { ROUTES } from "@/constants/routes";

export function LandingCTA() {
  return (
    <section className="landing-cta" data-reveal>
      <div className="landing-cta-inner">
        <h2>Ready for calmer, clearer health tracking?</h2>
        <p>
          Join the waitlist and be the first to experience HealthMetrics when we open
          the doors.
        </p>
        <Link to={ROUTES.AUTH.SIGNUP} className="landing-cta-primary">
          Join Waitlist
        </Link>
      </div>
    </section>
  );
}
