import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Activity,
  Apple,
  Dumbbell,
  HeartPulse,
  PlugZap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ROUTES } from "@/constants/routes";
import { HeroMockup } from "./HeroMockup";

export function LandingPage() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-container">
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

      <main className="landing-main">
        <section className="landing-hero" id="top" data-reveal>
          <div className="landing-hero-grid">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">Unified health OS</span>
              <h1 className="landing-hero-title">
                All your health data. One calm place.
              </h1>
              <p className="landing-hero-description">
                HealthMetrics brings nutrition, training, recovery, and biometrics
                into a single dashboard. No app hopping. No data headaches. Just
                a clear view of how you are doing.
              </p>
              <div className="landing-hero-actions">
                <Link to={ROUTES.AUTH.SIGNUP} className="landing-cta-primary">
                  Join Waitlist
                </Link>
                <a href="#how" className="landing-cta-ghost">
                  See how it works
                </a>
              </div>
              <div className="landing-hero-meta">
                <div className="landing-hero-meta-item">
                  <span className="landing-hero-meta-label">Live now</span>
                  <span className="landing-hero-meta-value">
                    Whoop + Tonal integrations
                  </span>
                </div>
                <div className="landing-hero-meta-item">
                  <span className="landing-hero-meta-label">Built for</span>
                  <span className="landing-hero-meta-value">
                    Athletes, clinicians, biohackers, and beginners
                  </span>
                </div>
              </div>
            </div>

            <div className="landing-hero-visual">
              <div className="landing-hero-visual-frame" aria-hidden="true">
                <span className="landing-hero-visual-orbit" />
                <span className="landing-hero-visual-wire" />
              </div>
              <div className="landing-hero-mockup">
                <HeroMockup />
              </div>
              <div className="landing-hero-panel">
                <div className="landing-hero-panel-header">
                  <span>Sample snapshot</span>
                  <span className="landing-hero-panel-pill">Today</span>
                </div>
                <div className="landing-hero-panel-grid">
                  <div className="landing-hero-panel-item">
                    <span className="landing-hero-panel-label">Recovery</span>
                    <span className="landing-hero-panel-value">82%</span>
                  </div>
                  <div className="landing-hero-panel-item">
                    <span className="landing-hero-panel-label">Move</span>
                    <span className="landing-hero-panel-value">45 min</span>
                  </div>
                  <div className="landing-hero-panel-item">
                    <span className="landing-hero-panel-label">Nutrition</span>
                    <span className="landing-hero-panel-value">1,620 cal</span>
                  </div>
                </div>
              </div>
              <div className="landing-hero-pill landing-hero-pill-left">
                Live recovery score
              </div>
              <div className="landing-hero-pill landing-hero-pill-right">
                Auto-synced workouts
              </div>
            </div>
          </div>
        </section>

        <section className="landing-integrations" id="integrations" data-reveal>
          <div className="landing-section-header">
            <h2>Connect the tools you already trust</h2>
            <p>
              Start with Whoop and Tonal. More integrations are on deck so you
              can keep everything in one place.
            </p>
          </div>
          <div className="integration-stream-layout">
            <div className="integration-stream">
              <div className="stream-header">
                <span>Live + Coming Next</span>
                <span className="stream-pill">Sync Stream</span>
              </div>
              <div className="stream-track" aria-hidden="true">
                <div className="stream-row">
                  <div className="stream-group">
                    <div className="stream-card is-live">
                      Whoop <span className="stream-status">Live</span>
                    </div>
                    <div className="stream-card is-live">
                      Tonal <span className="stream-status">Live</span>
                    </div>
                    <div className="stream-card">
                      Apple Health <span className="stream-status is-soon">Soon</span>
                    </div>
                    <div className="stream-card">
                      Strava <span className="stream-status is-soon">Soon</span>
                    </div>
                    <div className="stream-card">
                      Garmin <span className="stream-status is-soon">Soon</span>
                    </div>
                    <div className="stream-card">
                      Oura <span className="stream-status is-soon">Soon</span>
                    </div>
                    <div className="stream-card">
                      MyFitnessPal <span className="stream-status is-soon">Soon</span>
                    </div>
                  </div>
                  <div className="stream-group">
                    <div className="stream-card is-live">
                      Whoop <span className="stream-status">Live</span>
                    </div>
                    <div className="stream-card is-live">
                      Tonal <span className="stream-status">Live</span>
                    </div>
                    <div className="stream-card">
                      Apple Health <span className="stream-status is-soon">Soon</span>
                    </div>
                    <div className="stream-card">
                      Strava <span className="stream-status is-soon">Soon</span>
                    </div>
                    <div className="stream-card">
                      Garmin <span className="stream-status is-soon">Soon</span>
                    </div>
                    <div className="stream-card">
                      Oura <span className="stream-status is-soon">Soon</span>
                    </div>
                    <div className="stream-card">
                      MyFitnessPal <span className="stream-status is-soon">Soon</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="stream-footer">
                Unified into a single HealthMetrics timeline.
              </div>
            </div>
            <div className="integration-arrow" aria-hidden="true" />
            <div className="integration-merge">
              <div className="merge-card">
                <div className="merge-card-header">
                  <span className="merge-pill">Unified Hub</span>
                  <h3>HealthMetrics</h3>
                  <p>Everything merges into one clean timeline.</p>
                </div>
                <div className="merge-metrics">
                  <div>
                    <span>Recovery</span>
                    <strong>82%</strong>
                  </div>
                  <div>
                    <span>Training</span>
                    <strong>45 min</strong>
                  </div>
                  <div>
                    <span>Nutrition</span>
                    <strong>1,620 cal</strong>
                  </div>
                </div>
                <div className="merge-chart">
                  <span />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features" id="features" data-reveal>
          <div className="landing-section-header">
            <h2>Everything you track, finally together</h2>
            <p>
              HealthMetrics keeps the essentials front and center so you can
              move fast without losing the details.
            </p>
          </div>
          <div className="landing-feature-grid">
            <article className="landing-feature-card">
              <div className="landing-feature-icon">
                <Apple />
              </div>
              <h3>Nutrition with less friction</h3>
              <p>
                Log meals quickly, see macros at a glance, and stay aligned with
                your goals without drowning in numbers.
              </p>
              <ul className="landing-feature-list">
                <li>Calories and macros in one clean view</li>
                <li>Daily pacing that feels doable</li>
                <li>Patterns that surface habits</li>
              </ul>
            </article>
            <article className="landing-feature-card">
              <div className="landing-feature-icon">
                <Dumbbell />
              </div>
              <h3>Training built for momentum</h3>
              <p>
                Track workouts, volume, and progression without spreadsheets or
                manual data stitching.
              </p>
              <ul className="landing-feature-list">
                <li>Workout logs that stay lightweight</li>
                <li>Progress you can feel, not chase</li>
                <li>One timeline for every session</li>
              </ul>
            </article>
            <article className="landing-feature-card">
              <div className="landing-feature-icon">
                <HeartPulse />
              </div>
              <h3>Recovery that tells the truth</h3>
              <p>
                Sleep, readiness, and biomarkers sit next to your training so you
                know exactly when to push or pull back.
              </p>
              <ul className="landing-feature-list">
                <li>Sleep, HRV, and readiness in context</li>
                <li>Signals that balance intensity</li>
                <li>Gentle coaching that adapts</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="landing-barbell-band" data-reveal>
          <div className="landing-barbell-content">
            <div className="landing-barbell-heart" aria-hidden="true">
              <svg className="cardio-heart" viewBox="0 0 64 64">
                <path d="M32 56s-18-12-24-22C4 26 6 16 14 12c6-3 13-1 18 5 5-6 12-8 18-5 8 4 10 14 6 22-6 10-24 22-24 22z" />
              </svg>
              <div className="cardio-orbit" />
              <div className="cardio-dots">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="landing-barbell-copy">
              <h2>Adaptive training feedback</h2>
              <p>
                Your load should match your recovery. HealthMetrics balances
                intensity with readiness so you can progress without burnout.
              </p>
              <div className="landing-barbell-tags">
                <span>Auto-adjusted load</span>
                <span>Weekly trendlines</span>
                <span>Coach in your pocket</span>
              </div>
            </div>
            <div className="landing-barbell-visual">
              <div className="ekg" aria-hidden="true">
                <svg className="ekg-line" viewBox="0 0 320 80" role="presentation">
                  <path d="M0 55 H30 L40 28 L48 72 L60 12 L72 76 L86 38 L118 55 H150 L162 26 L170 74 L182 8 L196 78 L210 34 L240 55 H320" />
                </svg>
              </div>
              <div className="barbell-metrics">
                <div>
                  <span>Training load</span>
                  <strong>78</strong>
                </div>
                <div>
                  <span>Recovery</span>
                  <strong>82%</strong>
                </div>
                <div>
                  <span>Readiness</span>
                  <strong>High</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-how" id="how" data-reveal>
          <div className="landing-section-header">
            <h2>How HealthMetrics works</h2>
            <p>
              Set it up once. We keep everything synced so you can stay focused
              on the work.
            </p>
          </div>
          <div className="landing-how-body">
            <div className="landing-steps">
              <div className="landing-step">
                <span className="landing-step-number">01</span>
                <h3>Connect your tools</h3>
                <p>
                  Link your wearables and training platforms. We do the rest
                  behind the scenes.
                </p>
              </div>
              <div className="landing-step">
                <span className="landing-step-number">02</span>
                <h3>Choose your pace</h3>
                <p>
                  Set goals that feel human. We help you stay consistent without
                  the overwhelm.
                </p>
              </div>
              <div className="landing-step">
                <span className="landing-step-number">03</span>
                <h3>See the full story</h3>
                <p>
                  Meals, workouts, sleep, and recovery live in one timeline so you
                  can coach yourself in minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-values" id="security" data-reveal>
          <div className="landing-value-card">
            <div className="landing-value-icon">
              <PlugZap />
            </div>
            <div>
              <h3>Integration-first by design</h3>
              <p>
                HealthMetrics is built to unify your stack, not replace it. Plug
                in the apps you already rely on and see everything together.
              </p>
            </div>
          </div>
          <div className="landing-value-card">
            <div className="landing-value-icon">
              <ShieldCheck />
            </div>
            <div>
              <h3>Your data stays yours</h3>
              <p>
                Privacy is not an afterthought. Your health data is protected and
                never sold.
              </p>
            </div>
          </div>
          <div className="landing-value-card">
            <div className="landing-value-icon">
              <Sparkles />
            </div>
            <div>
              <h3>Coaching that feels supportive</h3>
              <p>
                Friendly nudges, not loud alarms. We keep you on track without
                the pressure.
              </p>
            </div>
          </div>
        </section>

        <section className="landing-cta" data-reveal>
          <div className="landing-cta-inner">
            <h2>Ready for calmer, clearer health tracking?</h2>
            <p>
              Join the waitlist and be the first to experience HealthMetrics when
              we open the doors.
            </p>
            <Link to={ROUTES.AUTH.SIGNUP} className="landing-cta-primary">
              Join Waitlist
            </Link>
          </div>
        </section>
      </main>

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
    </div>
  );
}
