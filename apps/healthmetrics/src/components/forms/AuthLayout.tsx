import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout-container">
      <header className="auth-layout-header">
        <div className="auth-layout-header-content">
          <div className="auth-layout-header-inner">
            <Link to="/" className="auth-layout-logo-link">
              <div className="auth-layout-logo-icon">
                <Activity className="auth-layout-icon-svg" />
              </div>
              <span className="auth-layout-logo-text">HealthMetrics</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="auth-layout-main">{children}</main>
    </div>
  );
}
