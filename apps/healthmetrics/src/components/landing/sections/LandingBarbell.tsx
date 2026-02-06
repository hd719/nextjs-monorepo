import { CoachDecisionCard } from "./CoachDecisionCard";

const METRICS = [
  { label: "Training load", value: "78" },
  { label: "Recovery", value: "82%" },
  { label: "Readiness", value: "High" },
  { label: "Heart rate", value: "124 bpm" },
];

const TAGS = ["Auto-adjusted load", "Weekly trendlines", "Coach in your pocket"];

export function LandingBarbell() {
  return (
    <section className="landing-barbell-band" data-reveal>
      <div className="landing-barbell-content">
        <CoachDecisionCard />
        <div className="landing-barbell-copy">
          <h2>Adaptive training feedback</h2>
          <p>
            Your load should match your recovery. HealthMetrics balances intensity
            with readiness so you can progress without burnout.
          </p>
          <div className="landing-barbell-tags">
            {TAGS.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="landing-barbell-visual">
          <div className="ekg" aria-hidden="true">
            <svg className="ekg-line" viewBox="0 0 320 80" role="presentation">
              <path d="M0 55 H30 L40 28 L48 72 L60 12 L72 76 L86 38 L118 55 H150 L162 26 L170 74 L182 8 L196 78 L210 34 L240 55 H320" />
            </svg>
          </div>
          <div className="barbell-metrics">
            {METRICS.map((metric) => (
              <div key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
