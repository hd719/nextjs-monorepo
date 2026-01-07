import { Timer, Flame, TrendingUp, Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFastingStats } from "@/hooks";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "@/constants/routes";
import { formatDuration } from "@/utils";

export interface FastingProgressCardProps {
  userId: string;
}

export function FastingProgressCard({ userId }: FastingProgressCardProps) {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useFastingStats(userId);

  if (isLoading) {
    return (
      <Card variant="supporting" className="fasting-progress-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="fasting-progress-loading">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalFasts === 0) {
    return (
      <Card
        variant="supporting"
        className="fasting-progress-card fasting-progress-card-clickable"
        onClick={() => navigate({ to: ROUTES.FASTING })}
      >
        <CardHeader>
          <CardTitle className="fasting-progress-title">
            <Timer className="fasting-progress-title-icon" />
            Fasting Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="fasting-progress-empty">
            <p className="fasting-progress-empty-text">
              Start fasting to see your progress here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate completion percentage
  const completionPercent = Math.round(stats.completionRate);

  return (
    <Card
      variant="supporting"
      className="fasting-progress-card fasting-progress-card-clickable"
      onClick={() => navigate({ to: ROUTES.FASTING })}
    >
      <CardHeader>
        <CardTitle className="fasting-progress-title">
          <Timer className="fasting-progress-title-icon" />
          Fasting Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="fasting-progress-stats-grid">
          {/* Streak */}
          <div className="fasting-progress-stat">
            <div className="fasting-progress-stat-icon fasting-progress-stat-icon-flame">
              <Flame className="w-5 h-5" />
            </div>
            <div className="fasting-progress-stat-content">
              <span className="fasting-progress-stat-value">
                {stats.currentStreak}
              </span>
              <span className="fasting-progress-stat-label">day streak</span>
            </div>
          </div>

          {/* This Week */}
          <div className="fasting-progress-stat">
            <div className="fasting-progress-stat-icon fasting-progress-stat-icon-target">
              <Target className="w-5 h-5" />
            </div>
            <div className="fasting-progress-stat-content">
              <span className="fasting-progress-stat-value">
                {stats.fastsThisWeek}
                {stats.weeklyGoal && (
                  <span className="fasting-progress-stat-goal">
                    /{stats.weeklyGoal}
                  </span>
                )}
              </span>
              <span className="fasting-progress-stat-label">this week</span>
            </div>
          </div>

          {/* Average Duration */}
          <div className="fasting-progress-stat">
            <div className="fasting-progress-stat-icon fasting-progress-stat-icon-trend">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="fasting-progress-stat-content">
              <span className="fasting-progress-stat-value">
                {formatDuration(stats.averageFastDuration)}
              </span>
              <span className="fasting-progress-stat-label">avg duration</span>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="fasting-progress-stat">
            <div className="fasting-progress-stat-icon fasting-progress-stat-icon-award">
              <Award className="w-5 h-5" />
            </div>
            <div className="fasting-progress-stat-content">
              <span className="fasting-progress-stat-value">
                {completionPercent}%
              </span>
              <span className="fasting-progress-stat-label">complete rate</span>
            </div>
          </div>
        </div>

        {/* Total summary */}
        <div className="fasting-progress-summary">
          <span className="fasting-progress-summary-total">
            {stats.totalFasts} total fasts
          </span>
          <span className="fasting-progress-summary-divider">•</span>
          <span className="fasting-progress-summary-time">
            {Math.round(stats.totalFastingMinutes / 60)}h total fasted
          </span>
        </div>

        {/* Best streak */}
        {stats.longestStreak > 0 && (
          <div className="fasting-progress-best">
            🏆 Longest streak: {stats.longestStreak} days
          </div>
        )}
      </CardContent>
    </Card>
  );
}
