import { Moon, TrendingUp, Star, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSleepAverage, useSleepHistory } from "@/hooks";

interface SleepAnalyticsProps {
  userId: string;
}

export function SleepAnalytics({ userId }: SleepAnalyticsProps) {
  const { data: weeklyAvg } = useSleepAverage(userId, 7);
  const { data: monthlyAvg } = useSleepAverage(userId, 30);
  const { data: history } = useSleepHistory(userId, 7);

  const thisWeekAvg = weeklyAvg?.averageHours ?? 0;
  const lastWeekAvg = monthlyAvg?.averageHours ?? 0;
  const trend = thisWeekAvg - lastWeekAvg;
  const trendPercent =
    lastWeekAvg > 0 ? ((trend / lastWeekAvg) * 100).toFixed(0) : 0;

  // Calculate consistency (% of days logged this week)
  const daysLogged = history?.length ?? 0;
  const consistencyPercent = Math.round((daysLogged / 7) * 100);

  // Get quality rating text
  const getQualityText = (quality: number | null) => {
    if (!quality) return "No data";
    if (quality >= 4.5) return "Excellent";
    if (quality >= 3.5) return "Very Good";
    if (quality >= 2.5) return "Good";
    if (quality >= 1.5) return "Fair";
    return "Poor";
  };

  return (
    <div className="sleep-analytics-grid">
      {/* Weekly Average Hours */}
      <Card variant="supporting" className="sleep-stat-card">
        <CardContent className="sleep-stat-content">
          <div className="sleep-stat-icon-wrapper sleep-stat-icon-hours">
            <Moon className="sleep-stat-icon" />
          </div>
          <div className="sleep-stat-info">
            <span className="sleep-stat-label">Weekly Average</span>
            <span className="sleep-stat-value">
              {thisWeekAvg > 0 ? `${thisWeekAvg.toFixed(1)}h` : "--"}
            </span>
            <span className="sleep-stat-sublabel">per night</span>
          </div>
        </CardContent>
      </Card>

      {/* Quality Score */}
      <Card variant="supporting" className="sleep-stat-card">
        <CardContent className="sleep-stat-content">
          <div className="sleep-stat-icon-wrapper sleep-stat-icon-quality">
            <Star className="sleep-stat-icon" />
          </div>
          <div className="sleep-stat-info">
            <span className="sleep-stat-label">Avg Quality</span>
            <span className="sleep-stat-value">
              {weeklyAvg?.averageQuality?.toFixed(1) ?? "--"}
            </span>
            <span className="sleep-stat-sublabel">
              {getQualityText(weeklyAvg?.averageQuality ?? null)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Trend */}
      <Card variant="supporting" className="sleep-stat-card">
        <CardContent className="sleep-stat-content">
          <div
            className={`sleep-stat-icon-wrapper ${trend >= 0 ? "sleep-stat-icon-trend-up" : "sleep-stat-icon-trend-down"}`}
          >
            <TrendingUp className="sleep-stat-icon" />
          </div>
          <div className="sleep-stat-info">
            <span className="sleep-stat-label">Weekly Trend</span>
            <span
              className={`sleep-stat-value ${trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {trend >= 0 ? "+" : ""}
              {trend.toFixed(1)}h
            </span>
            <span className="sleep-stat-sublabel">
              {trend >= 0
                ? `${trendPercent}% improvement`
                : `${Math.abs(Number(trendPercent))}% decrease`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Consistency */}
      <Card variant="supporting" className="sleep-stat-card">
        <CardContent className="sleep-stat-content">
          <div className="sleep-stat-icon-wrapper sleep-stat-icon-consistency">
            <Clock className="sleep-stat-icon" />
          </div>
          <div className="sleep-stat-info">
            <span className="sleep-stat-label">Consistency</span>
            <span className="sleep-stat-value">{consistencyPercent}%</span>
            <span className="sleep-stat-sublabel">
              {daysLogged}/7 days logged
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
