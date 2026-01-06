import { Link } from "@tanstack/react-router";
import { Activity, Apple, Dumbbell, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ROUTES } from "@/constants/routes";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout-container">
      {/* Branding Panel - Left Side (Desktop Only) */}
      <div className="auth-branding-panel">
        {/* Floating shapes for visual interest */}
        <div className="auth-branding-shapes" aria-hidden="true">
          <div className="auth-branding-shape auth-branding-shape-1" />
          <div className="auth-branding-shape auth-branding-shape-2" />
          <div className="auth-branding-shape auth-branding-shape-3" />
        </div>

        <div className="auth-branding-content">
          {/* Logo */}
          <div className="auth-branding-logo">
            <div className="auth-branding-logo-icon">
              <Activity className="auth-branding-logo-svg" />
            </div>
            <span className="auth-branding-logo-text">HealthMetrics</span>
          </div>

          {/* Headline */}
          <h1 className="auth-branding-headline">
            Your health journey
            <br />
            starts here.
          </h1>

          <p className="auth-branding-description">
            Track nutrition, log workouts, and visualize your progress with
            powerful tools designed for your success.
          </p>

          {/* Feature list */}
          <div className="auth-branding-features">
            <div className="auth-branding-feature">
              <div className="auth-branding-feature-icon">
                <Apple className="auth-branding-feature-icon-svg" />
              </div>
              <span className="auth-branding-feature-text">
                Track meals with our extensive food database
              </span>
            </div>
            <div className="auth-branding-feature">
              <div className="auth-branding-feature-icon">
                <Dumbbell className="auth-branding-feature-icon-svg" />
              </div>
              <span className="auth-branding-feature-text">
                Log workouts and track calories burned
              </span>
            </div>
            <div className="auth-branding-feature">
              <div className="auth-branding-feature-icon">
                <TrendingUp className="auth-branding-feature-icon-svg" />
              </div>
              <span className="auth-branding-feature-text">
                Visualize progress with beautiful charts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel - Right Side */}
      <div className="auth-form-panel">
        {/* Mobile Header */}
        <header className="auth-layout-header">
          <div className="auth-layout-header-content">
            <div className="auth-layout-header-inner">
              <Link to={ROUTES.HOME} className="auth-layout-logo-link">
                <div className="auth-layout-logo-icon">
                  <Activity className="auth-layout-icon-svg" />
                </div>
                <span className="auth-layout-logo-text">HealthMetrics</span>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Desktop Theme Toggle */}
        <div className="auth-desktop-theme-toggle">
          <ThemeToggle />
        </div>

        {/* Main Content */}
        <main className="auth-layout-main">{children}</main>
      </div>
    </div>
  );
}
