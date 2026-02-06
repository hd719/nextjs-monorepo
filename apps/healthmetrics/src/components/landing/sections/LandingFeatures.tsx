import { Apple, Dumbbell, HeartPulse } from "lucide-react";

const FEATURES = [
  {
    title: "Nutrition with less friction",
    description:
      "Log meals quickly, see macros at a glance, and stay aligned with your goals without drowning in numbers.",
    icon: Apple,
    bullets: [
      "Calories and macros in one clean view",
      "Daily pacing that feels doable",
      "Patterns that surface habits",
    ],
  },
  {
    title: "Training built for momentum",
    description:
      "Track workouts, volume, and progression without spreadsheets or manual data stitching.",
    icon: Dumbbell,
    bullets: [
      "Workout logs that stay lightweight",
      "Progress you can feel, not chase",
      "One timeline for every session",
    ],
  },
  {
    title: "Recovery that tells the truth",
    description:
      "Sleep, readiness, and biomarkers sit next to your training so you know exactly when to push or pull back.",
    icon: HeartPulse,
    bullets: [
      "Sleep, HRV, and readiness in context",
      "Signals that balance intensity",
      "Gentle coaching that adapts",
    ],
  },
];

export function LandingFeatures() {
  return (
    <section className="landing-features" id="features" data-reveal>
      <div className="landing-section-header">
        <h2>Everything you track, finally together</h2>
        <p>
          HealthMetrics keeps the essentials front and center so you can move fast
          without losing the details.
        </p>
      </div>
      <div className="landing-feature-grid">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <article className="landing-feature-card" key={feature.title}>
              <div className="landing-feature-icon">
                <Icon />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <ul className="landing-feature-list">
                {feature.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
