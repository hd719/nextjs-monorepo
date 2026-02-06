const STREAM_ITEMS = [
  { label: "Whoop", status: "Live", live: true },
  { label: "Tonal", status: "Live", live: true },
  { label: "Apple Health", status: "Soon" },
  { label: "Strava", status: "Soon" },
  { label: "Garmin", status: "Soon" },
  { label: "Oura", status: "Soon" },
  { label: "MyFitnessPal", status: "Soon" },
];

export function LandingIntegrations() {
  return (
    <section className="landing-integrations" id="integrations" data-reveal>
      <div className="landing-section-header">
        <h2>Connect the tools you already trust</h2>
        <p>
          Start with Whoop and Tonal. More integrations are on deck so you can keep
          everything in one place.
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
              {Array.from({ length: 2 }).map((_, groupIndex) => (
                <div className="stream-group" key={`group-${groupIndex}`}>
                  {STREAM_ITEMS.map((item) => (
                    <div
                      key={`${groupIndex}-${item.label}`}
                      className={`stream-card${item.live ? " is-live" : ""}`}
                    >
                      {item.label}{" "}
                      <span
                        className={`stream-status${
                          item.live ? "" : " is-soon"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
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
  );
}
