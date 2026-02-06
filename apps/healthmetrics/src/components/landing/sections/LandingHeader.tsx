import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ROUTES } from "@/constants/routes";

export function LandingHeader() {
  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <Link to={ROUTES.HOME} className="landing-logo-link">
          <span className="landing-logo-mark">
            <Activity className="landing-logo-icon" />
          </span>
          <span className="landing-logo-text">HealthMetrics</span>
        </Link>

        <nav className="landing-nav">
          <a href="#features" className="landing-nav-link">
            Features
          </a>
          <a href="#how" className="landing-nav-link">
            How it works
          </a>
          <a href="#integrations" className="landing-nav-link">
            Integrations
          </a>
          <a href="#security" className="landing-nav-link">
            Security
          </a>
        </nav>

        <div className="landing-header-actions">
          <ThemeToggle />
          <Link to={ROUTES.AUTH.LOGIN} className="landing-link">
            Log in
          </Link>
          <Link to={ROUTES.AUTH.SIGNUP} className="landing-cta-primary">
            Join Waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
