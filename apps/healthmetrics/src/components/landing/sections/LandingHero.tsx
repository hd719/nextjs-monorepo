import { Link } from "@tanstack/react-router";
import { ROUTES } from "@/constants/routes";
import { HeroMockup } from "../HeroMockup";

export function LandingHero() {
  return (
    <section className="landing-hero" id="top" data-reveal>
      <div className="landing-hero-grid">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">Unified health OS</span>
          <h1 className="landing-hero-title">
            All your health data. One calm place.
          </h1>
          <p className="landing-hero-description">
            HealthMetrics brings nutrition, training, recovery, and biometrics into a
            single dashboard. No app hopping. No data headaches. Just a clear view of
            how you are doing.
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
  );
}
