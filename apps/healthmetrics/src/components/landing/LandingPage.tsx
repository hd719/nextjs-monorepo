import { Link } from "@tanstack/react-router";
import { Activity, Apple, Dumbbell, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-header-inner">
            <Link to="/" className="landing-logo-link">
              <div className="landing-logo-icon">
                <Activity className="landing-logo-icon-svg" />
              </div>
              <span className="landing-logo-text">HealthMetrics</span>
            </Link>

            <div className="landing-header-actions">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero-section">
          <div className="landing-hero-content">
            <h1 className="landing-hero-title">
              Track Your Health.
              <br />
              <span className="landing-hero-accent">Reach Your Goals.</span>
            </h1>
            <p className="landing-hero-description">
              Monitor your nutrition, log workouts, and track progress with
              simple, powerful tools.
            </p>
            <div className="landing-hero-actions">
              <Button size="lg" asChild>
                <Link to="/auth/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">View Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="landing-features-section">
          <div className="landing-features-content">
            <div className="landing-features-inner">
              <h2 className="landing-features-title">
                Everything you need in one place
              </h2>
              <div className="landing-features-grid">
                <Card>
                  <CardHeader className="landing-feature-card-header">
                    <div className="landing-feature-icon">
                      <Apple className="landing-feature-icon-svg" />
                    </div>
                    <div>
                      <CardTitle>Nutrition</CardTitle>
                      <CardDescription className="landing-feature-description">
                        Track meals and monitor your daily calorie and macro
                        intake
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="landing-feature-card-header">
                    <div className="landing-feature-icon">
                      <Dumbbell className="landing-feature-icon-svg" />
                    </div>
                    <div>
                      <CardTitle>Exercise</CardTitle>
                      <CardDescription className="landing-feature-description">
                        Log workouts and track your activity levels over time
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="landing-feature-card-header">
                    <div className="landing-feature-icon">
                      <TrendingUp className="landing-feature-icon-svg" />
                    </div>
                    <div>
                      <CardTitle>Progress</CardTitle>
                      <CardDescription className="landing-feature-description">
                        Visualize your journey with charts and insights
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-cta-section">
          <div className="landing-cta-content">
            <div className="landing-cta-inner">
              <h2 className="landing-cta-title">Ready to get started?</h2>
              <p className="landing-cta-description">
                Join thousands of users tracking their health journey.
              </p>
              <Button size="lg" asChild>
                <Link to="/auth/signup">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-inner">
            <div className="landing-footer-branding">
              <Activity className="landing-footer-icon" />
              <span>© 2025 HealthMetrics</span>
            </div>
            <div className="landing-footer-links">
              <a href="#" className="landing-footer-link">
                About
              </a>
              <a href="#" className="landing-footer-link">
                Privacy
              </a>
              <a href="#" className="landing-footer-link">
                Terms
              </a>
              <a href="#" className="landing-footer-link">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
