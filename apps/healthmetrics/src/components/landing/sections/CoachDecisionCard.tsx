import { useEffect, useRef, useState, type PointerEvent } from "react";

type CoachInput = {
  label: string;
  value: string;
  fill: string;
};

type CoachState = {
  id: "recover" | "maintain" | "push";
  title: string;
  summary: string;
  confidence: string;
  inputs: CoachInput[];
  focus: string[];
  action: string;
  trend: number[];
};

const COACH_STATES: CoachState[] = [
  {
    id: "recover",
    title: "Recover",
    summary: "Load is elevated. Pull intensity down and prioritize sleep quality.",
    confidence: "72%",
    inputs: [
      { label: "Load", value: "84", fill: "84%" },
      { label: "Recovery", value: "64%", fill: "64%" },
      { label: "Readiness", value: "Low", fill: "44%" },
      { label: "Heart rate", value: "132", fill: "68%" },
    ],
    focus: ["Sleep", "Hydration", "Zone 2"],
    action: "Take a lighter session and re-check readiness in 6h.",
    trend: [72, 64, 58, 61, 56, 53, 49],
  },
  {
    id: "maintain",
    title: "Maintain",
    summary: "Signals are balanced. Keep intensity and volume steady today.",
    confidence: "84%",
    inputs: [
      { label: "Load", value: "78", fill: "78%" },
      { label: "Recovery", value: "82%", fill: "82%" },
      { label: "Readiness", value: "High", fill: "88%" },
      { label: "Heart rate", value: "124", fill: "62%" },
    ],
    focus: ["Volume", "Tempo", "Consistency"],
    action: "Keep plan steady and progress with controlled volume.",
    trend: [71, 74, 78, 80, 79, 82, 84],
  },
  {
    id: "push",
    title: "Push",
    summary: "Readiness is strong. Add controlled volume and keep your form sharp.",
    confidence: "79%",
    inputs: [
      { label: "Load", value: "71", fill: "71%" },
      { label: "Recovery", value: "88%", fill: "88%" },
      { label: "Readiness", value: "High", fill: "92%" },
      { label: "Heart rate", value: "118", fill: "59%" },
    ],
    focus: ["Power", "Intensity", "Form"],
    action: "Push top set intensity while keeping rest periods strict.",
    trend: [64, 67, 72, 75, 81, 86, 90],
  },
];

export function CoachDecisionCard() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [activeFocus, setActiveFocus] = useState(0);
  const [activeTrend, setActiveTrend] = useState(0);
  const [isInView, setIsInView] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const pauseAutoUntilRef = useRef(0);

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsInView(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.35 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const shouldAnimate = isDocumentVisible && isInView;

  useEffect(() => {
    if (!shouldAnimate) return;

    const interval = window.setInterval(() => {
      if (Date.now() < pauseAutoUntilRef.current) return;
      setActiveIndex((prev) => (prev + 1) % COACH_STATES.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [shouldAnimate]);

  const activeState = COACH_STATES[activeIndex];

  useEffect(() => {
    setActiveFocus(0);
    setActiveTrend(0);
  }, [activeIndex]);

  useEffect(() => {
    if (!shouldAnimate) return;

    const interval = window.setInterval(() => {
      if (Date.now() < pauseAutoUntilRef.current) return;
      setActiveFocus((prev) => (prev + 1) % activeState.focus.length);
      setActiveTrend((prev) => (prev + 1) % activeState.trend.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [activeState.focus.length, activeState.trend.length, shouldAnimate]);

  const pauseAutoCycle = () => {
    pauseAutoUntilRef.current = Date.now() + 8000;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const node = cardRef.current;
    if (!node) return;

    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateY = px * 6;
    const rotateX = py * -6;

    node.style.setProperty("--coach-tilt-x", `${rotateX.toFixed(2)}deg`);
    node.style.setProperty("--coach-tilt-y", `${rotateY.toFixed(2)}deg`);
  };

  const handlePointerLeave = () => {
    const node = cardRef.current;
    if (!node) return;
    node.style.setProperty("--coach-tilt-x", "0deg");
    node.style.setProperty("--coach-tilt-y", "0deg");
  };

  return (
    <div
      className="coach-decision-card"
      data-tone={activeState.id}
      data-running={shouldAnimate ? "true" : "false"}
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="coach-decision-header">
        <span>Adaptive Coach</span>
        <span className="coach-decision-live">{activeState.confidence}</span>
      </div>

      <div className="coach-decision-stack">
        <div className="coach-decision-tabs" role="tablist" aria-label="Coach states">
          {COACH_STATES.map((state, index) => (
            <button
              key={state.id}
              className={`coach-tab${index === activeIndex ? " is-active" : ""}`}
              role="tab"
              aria-selected={index === activeIndex}
              type="button"
              onClick={() => {
                pauseAutoCycle();
                setActiveIndex(index);
              }}
            >
              {state.title}
            </button>
          ))}
        </div>
        <article className="coach-state-panel">
          <h4>{activeState.title}</h4>
          <p>{activeState.summary}</p>
          <span className="coach-confidence-bar">
            <span style={{ width: activeState.confidence }} />
          </span>
        </article>
      </div>

      <div className="coach-input-grid">
        {activeState.inputs.map((input) => (
          <div className="coach-input" key={input.label}>
            <div className="coach-input-row">
              <span>{input.label}</span>
              <strong>{input.value}</strong>
            </div>
            <span className="coach-input-track">
              <span className="coach-input-bar" style={{ width: input.fill }} />
            </span>
          </div>
        ))}
      </div>

      <div className="coach-footer">
        <div className="coach-footer-head">
          <span>Live Trend</span>
          <span>7 Day</span>
        </div>
        <div className="coach-trend" role="img" aria-label="7 day coach trend">
          {activeState.trend.map((point, index) => (
            <button
              key={`${activeState.id}-${index}`}
              type="button"
              className={`coach-trend-bar${index === activeTrend ? " is-active" : ""}`}
              style={{ height: `${point}%` }}
              onClick={() => {
                pauseAutoCycle();
                setActiveTrend(index);
                setActiveFocus(index % activeState.focus.length);
              }}
              aria-label={`Trend day ${index + 1}: ${point}%`}
            />
          ))}
        </div>
        <div className="coach-focus-chips">
          {activeState.focus.map((focus, index) => (
            <button
              key={focus}
              type="button"
              className={`coach-focus-chip${index === activeFocus ? " is-active" : ""}`}
              onClick={() => {
                pauseAutoCycle();
                setActiveFocus(index);
                setActiveTrend((index * 2) % activeState.trend.length);
              }}
            >
              {focus}
            </button>
          ))}
        </div>
        <p className="coach-footer-action">{activeState.action}</p>
      </div>
    </div>
  );
}
