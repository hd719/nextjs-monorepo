import { PlugZap, ShieldCheck, Sparkles } from "lucide-react";
import { CarouselIndicators } from "./CarouselIndicators";

const VALUES = [
  {
    title: "Integration-first by design",
    description:
      "HealthMetrics is built to unify your stack, not replace it. Plug in the apps you already rely on and see everything together.",
    icon: PlugZap,
  },
  {
    title: "Your data stays yours",
    description:
      "Privacy is not an afterthought. Your health data is protected and never sold.",
    icon: ShieldCheck,
  },
  {
    title: "Coaching that feels supportive",
    description:
      "Friendly nudges, not loud alarms. We keep you on track without the pressure.",
    icon: Sparkles,
  },
];

export function LandingValues() {
  return (
    <section className="landing-values" id="security" data-reveal>
      <div className="landing-values-grid" data-carousel-track>
        {VALUES.map((value) => {
          const Icon = value.icon;
          return (
            <div className="landing-value-card" key={value.title}>
              <div className="landing-value-icon">
                <Icon />
              </div>
              <div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <CarouselIndicators
        ariaLabel="Value highlights carousel"
        labels={["Value 1", "Value 2", "Value 3"]}
      />
    </section>
  );
}
