import { CarouselIndicators } from "./CarouselIndicators";

const STEPS = [
  {
    number: "01",
    title: "Connect your tools",
    description:
      "Link your wearables and training platforms. We do the rest behind the scenes.",
  },
  {
    number: "02",
    title: "Choose your pace",
    description:
      "Set goals that feel human. We help you stay consistent without the overwhelm.",
  },
  {
    number: "03",
    title: "See the full story",
    description:
      "Meals, workouts, sleep, and recovery live in one timeline so you can coach yourself in minutes.",
  },
];

export function LandingHow() {
  return (
    <section className="landing-how" id="how" data-reveal>
      <div className="landing-section-header">
        <h2>How HealthMetrics works</h2>
        <p>
          Set it up once. We keep everything synced so you can stay focused on the
          work.
        </p>
      </div>
      <div className="landing-how-body">
        <div className="landing-steps" data-carousel-track>
          {STEPS.map((step) => (
            <div className="landing-step" key={step.number}>
              <span className="landing-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
        <CarouselIndicators
          ariaLabel="How it works carousel"
          labels={["Step 1", "Step 2", "Step 3"]}
        />
      </div>
    </section>
  );
}
