import { Lightbulb, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSleepAverage, useSleepHistory } from "@/hooks";

interface SleepInsightsProps {
  userId: string;
}

interface Insight {
  type: "success" | "warning" | "info" | "tip";
  title: string;
  description: string;
}

export function SleepInsights({ userId }: SleepInsightsProps) {
  const { data: weeklyAvg } = useSleepAverage(userId, 7);
  const { data: history } = useSleepHistory(userId, 7);

  // Generate insights based on data
  const insights: Insight[] = [];

  const avgHours = weeklyAvg?.averageHours ?? 0;
  const avgQuality = weeklyAvg?.averageQuality ?? 0;

  // Sleep duration insights
  if (avgHours > 0) {
    if (avgHours >= 7 && avgHours <= 9) {
      insights.push({
        type: "success",
        title: "Great Sleep Duration",
        description: `You're averaging ${avgHours.toFixed(1)} hours per night, which is within the recommended 7-9 hours for adults.`,
      });
    } else if (avgHours < 7) {
      insights.push({
        type: "warning",
        title: "Consider More Sleep",
        description: `You're averaging ${avgHours.toFixed(1)} hours. Adults typically need 7-9 hours for optimal health and performance.`,
      });
    } else {
      insights.push({
        type: "info",
        title: "Extended Sleep",
        description: `You're averaging ${avgHours.toFixed(1)} hours. While more sleep can be beneficial during recovery, consistently sleeping over 9 hours may indicate underlying issues.`,
      });
    }
  }

  // Quality insights
  if (avgQuality > 0) {
    if (avgQuality >= 4) {
      insights.push({
        type: "success",
        title: "Excellent Sleep Quality",
        description:
          "Your sleep quality is excellent! Keep up the good habits that contribute to restful sleep.",
      });
    } else if (avgQuality < 3) {
      insights.push({
        type: "warning",
        title: "Room for Improvement",
        description:
          "Your sleep quality could be better. Consider limiting screen time before bed, keeping a consistent schedule, and optimizing your sleep environment.",
      });
    }
  }

  // Consistency insights
  const daysLogged = history?.length ?? 0;
  if (daysLogged < 4) {
    insights.push({
      type: "tip",
      title: "Track More Consistently",
      description:
        "Log your sleep daily for better insights. Consistent tracking helps identify patterns and areas for improvement.",
    });
  }

  // Bedtime consistency check
  if (history && history.length >= 3) {
    insights.push({
      type: "tip",
      title: "Maintain Regular Schedule",
      description:
        "Going to bed and waking up at the same time every day—even on weekends—helps regulate your body's internal clock.",
    });
  }

  // Default insight if no data
  if (insights.length === 0) {
    insights.push({
      type: "info",
      title: "Start Tracking",
      description:
        "Log your sleep to receive personalized insights about your sleep patterns and recommendations for better rest.",
    });
  }

  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case "tip":
        return <Lightbulb className="w-5 h-5 text-indigo-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <Card variant="supporting" className="sleep-insights-card">
      <CardContent className="sleep-insights-content">
        <h3 className="sleep-insights-title">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          Sleep Insights
        </h3>
        <div className="sleep-insights-list">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`sleep-insight-item sleep-insight-${insight.type}`}
            >
              <div className="sleep-insight-icon">{getIcon(insight.type)}</div>
              <div className="sleep-insight-content">
                <h4 className="sleep-insight-title">{insight.title}</h4>
                <p className="sleep-insight-description">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
