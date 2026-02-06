import { Activity } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand">
          <Activity className="landing-footer-icon" />
          <span>© 2026 HealthMetrics</span>
        </div>
        <div className="landing-footer-links">
          <a href="#features">Features</a>
          <a href="#integrations">Integrations</a>
          <a href="#security">Security</a>
          <a href="#top">Back to top</a>
        </div>
      </div>
    </footer>
  );
}
