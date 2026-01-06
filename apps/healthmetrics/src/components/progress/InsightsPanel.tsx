import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { Insight } from "@/types/progress";

interface InsightsPanelProps {
  insights: Insight[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  zap: Zap,
  lightbulb: Lightbulb,
};

function InsightItem({ insight }: { insight: Insight }) {
  const Icon = ICON_MAP[insight.icon] || Lightbulb;

  return (
    <div
      className={cn(
        "progress-insight-item",
        `progress-insight-${insight.type}`
      )}
    >
      <div className="progress-insight-header">
        <Icon
          className={cn(
            "progress-insight-icon",
            `progress-insight-icon-${insight.type}`
          )}
          aria-hidden="true"
        />
        <span className="progress-insight-title">{insight.title}</span>
      </div>
      <p className="progress-insight-message">{insight.message}</p>
    </div>
  );
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const sortedInsights = [...insights].sort((a, b) => {
    const order = { positive: 0, opportunity: 1, warning: 2 };
    return order[a.type] - order[b.type];
  });

  return (
    <Card variant="supporting" className="progress-insights-full-height">
      <CardContent className="progress-chart-card progress-insights-full-height">
        <div className="progress-insights-section">
          <div className="progress-chart-header">
            <h3 className="progress-chart-title">
              <Lightbulb
                className="progress-chart-title-icon progress-icon-purple"
                aria-hidden="true"
              />
              Insights & Recommendations
            </h3>
          </div>

          <div className="progress-insights-list">
            {sortedInsights.map((insight, index) => (
              <InsightItem key={index} insight={insight} />
            ))}
          </div>

          {/* Push the button to the bottom */}
          <div className="progress-insights-spacer" />

          {/* Future: "View More" button */}
          <button type="button" className="progress-view-more-btn">
            <span>View all insights</span>
            <ChevronRight className="progress-view-more-icon" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
