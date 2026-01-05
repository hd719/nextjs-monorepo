import { Link } from "@tanstack/react-router";
import {
  Activity,
  Apple,
  Dumbbell,
  TrendingUp,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HeroMockup } from "./HeroMockup";
import { ROUTES } from "@/constants/routes";

export function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-header-inner">
            <Link to={ROUTES.HOME} className="landing-logo-link">
              <div className="landing-logo-icon">
                <Activity className="landing-logo-icon-svg" />
              </div>
              <span className="landing-logo-text">HealthMetrics</span>
            </Link>

            <div className="landing-header-actions">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link to={ROUTES.AUTH.LOGIN}>Log In</Link>
              </Button>
              <Button asChild>
                <Link to={ROUTES.AUTH.SIGNUP}>Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="landing-main">
        {/* ============================================
            HERO SECTION

            The main attention-grabbing area of the page.
            Includes:
            - Headline and description (left on desktop)
            - Animated dashboard mockup (right on desktop)
            - Floating orbs for visual interest
            ============================================ */}
        <div className="landing-hero-wrapper">
          <div className="landing-hero-orb" aria-hidden="true" />
          <section className="landing-hero-section">
            <div className="landing-hero-split">
              {/* Left side: Text content */}
              <div className="landing-hero-content">
                <h1 className="landing-hero-title">
                  Track Your Health.
                  <br />
                  <span className="landing-hero-accent">Reach Your Goals.</span>
                </h1>
                <p className="landing-hero-description">
                  Monitor your nutrition, log workouts, and track progress with
                  simple, powerful tools designed to help you succeed.
                </p>
                <div className="landing-hero-actions">
                  <Link to={ROUTES.AUTH.SIGNUP} className="landing-cta-primary">
                    Get Started Free
                  </Link>
                  <Link to={ROUTES.DASHBOARD} className="landing-cta-secondary">
                    View Demo
                  </Link>
                </div>
              </div>

              {/* Right side: Animated mockup */}
              <div className="landing-hero-mockup">
                <HeroMockup />
              </div>
            </div>
          </section>
        </div>

        {/* Stats Banner */}
        <section className="landing-stats-section">
          <div className="landing-stats-content">
            <div className="landing-stats-grid">
              <div className="landing-stat-item">
                <div className="landing-stat-value">10K+</div>
                <div className="landing-stat-label">Active Users</div>
              </div>
              <div className="landing-stat-item">
                <div className="landing-stat-value">1M+</div>
                <div className="landing-stat-label">Meals Tracked</div>
              </div>
              <div className="landing-stat-item">
                <div className="landing-stat-value">500K+</div>
                <div className="landing-stat-label">Workouts Logged</div>
              </div>
              <div className="landing-stat-item">
                <div className="landing-stat-value">4.9★</div>
                <div className="landing-stat-label">User Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="landing-features-section">
          <div className="landing-features-content">
            <div className="landing-features-inner">
              <div className="landing-features-header">
                <h2 className="landing-features-title">
                  Everything you need in one place
                </h2>
                <p className="landing-features-subtitle">
                  Powerful features designed to make health tracking effortless
                  and enjoyable
                </p>
              </div>
              <div className="landing-features-grid">
                <div className="landing-feature-card">
                  <div className="landing-feature-card-header">
                    <div className="landing-feature-icon">
                      <Apple className="landing-feature-icon-svg" />
                    </div>
                    <div>
                      <h3 className="landing-feature-title">Nutrition</h3>
                      <p className="landing-feature-description">
                        Track meals and monitor your daily calorie and macro
                        intake with our extensive food database
                      </p>
                    </div>
                  </div>
                </div>

                <div className="landing-feature-card">
                  <div className="landing-feature-card-header">
                    <div className="landing-feature-icon">
                      <Dumbbell className="landing-feature-icon-svg" />
                    </div>
                    <div>
                      <h3 className="landing-feature-title">Exercise</h3>
                      <p className="landing-feature-description">
                        Log workouts, track calories burned, and monitor your
                        activity levels over time
                      </p>
                    </div>
                  </div>
                </div>

                <div className="landing-feature-card">
                  <div className="landing-feature-card-header">
                    <div className="landing-feature-icon">
                      <TrendingUp className="landing-feature-icon-svg" />
                    </div>
                    <div>
                      <h3 className="landing-feature-title">Progress</h3>
                      <p className="landing-feature-description">
                        Visualize your journey with beautiful charts, insights,
                        and milestone tracking
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="landing-preview-section">
          <div className="landing-preview-content">
            <div className="landing-features-header">
              <h2 className="landing-features-title">
                Why choose HealthMetrics?
              </h2>
              <p className="landing-features-subtitle">
                Built with your success in mind
              </p>
            </div>
            <div
              className="landing-features-grid"
              style={{ maxWidth: "64rem", margin: "0 auto" }}
            >
              <div className="landing-feature-card">
                <div className="landing-feature-card-header">
                  <div className="landing-feature-icon">
                    <Zap className="landing-feature-icon-svg" />
                  </div>
                  <div>
                    <h3 className="landing-feature-title">Lightning Fast</h3>
                    <p className="landing-feature-description">
                      Log meals in seconds with smart search and quick-add
                      features
                    </p>
                  </div>
                </div>
              </div>

              <div className="landing-feature-card">
                <div className="landing-feature-card-header">
                  <div className="landing-feature-icon">
                    <Shield className="landing-feature-icon-svg" />
                  </div>
                  <div>
                    <h3 className="landing-feature-title">Privacy First</h3>
                    <p className="landing-feature-description">
                      Your health data is encrypted and never shared with third
                      parties
                    </p>
                  </div>
                </div>
              </div>

              <div className="landing-feature-card">
                <div className="landing-feature-card-header">
                  <div className="landing-feature-icon">
                    <Sparkles className="landing-feature-icon-svg" />
                  </div>
                  <div>
                    <h3 className="landing-feature-title">Smart Insights</h3>
                    <p className="landing-feature-description">
                      Get personalized recommendations based on your goals and
                      habits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="landing-cta-section">
          <div className="landing-cta-content">
            <div className="landing-cta-inner">
              <h2 className="landing-cta-title">
                Ready to transform your health?
              </h2>
              <p className="landing-cta-description">
                Join thousands of users who have already started their journey
                to a healthier lifestyle.
              </p>
              <Link to={ROUTES.AUTH.SIGNUP} className="landing-cta-primary">
                Start Your Free Trial
              </Link>
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
