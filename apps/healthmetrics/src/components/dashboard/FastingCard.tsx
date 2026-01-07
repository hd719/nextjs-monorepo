import { Clock, Play, Timer, Flame, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "@/constants/routes";
import { useActiveFast, useFastingStats } from "@/hooks";
import { formatDuration } from "@/utils";
import { useMemo } from "react";

export interface FastingCardProps {
  userId: string;
}

// Calculate percentage progress
function calculateProgress(elapsedMin: number, targetMin: number): number {
  if (targetMin <= 0) return 0;
  return Math.min(100, Math.round((elapsedMin / targetMin) * 100));
}

export function FastingCard({ userId }: FastingCardProps) {
  const navigate = useNavigate();
  const { data: activeFast, isLoading: isFastLoading } = useActiveFast(userId);
  const { data: stats, isLoading: isStatsLoading } = useFastingStats(userId);

  const isLoading = isFastLoading || isStatsLoading;

  // Calculate elapsed time for active fast
  const timerData = useMemo(() => {
    if (!activeFast?.session) return null;

    const now = new Date();
    const startTime = new Date(activeFast.session.startTime);
    let elapsedMs = now.getTime() - startTime.getTime();

    // Subtract paused time
    if (activeFast.isPaused && activeFast.session.pausedAt) {
      const pausedAt = new Date(activeFast.session.pausedAt);
      elapsedMs -= now.getTime() - pausedAt.getTime();
    }
    elapsedMs -= (activeFast.session.totalPausedMin || 0) * 60 * 1000;

    const elapsedMin = Math.floor(elapsedMs / (1000 * 60));
    const targetMin = activeFast.session.targetDurationMin;
    const remainingMin = Math.max(0, targetMin - elapsedMin);
    const progress = calculateProgress(elapsedMin, targetMin);

    return {
      elapsedMin,
      remainingMin,
      targetMin,
      progress,
      isPaused: activeFast.isPaused,
      protocolName: activeFast.protocol?.name || "Custom",
    };
  }, [activeFast]);

  if (isLoading) {
    return (
      <section className="dashboard-fasting-section">
        <Skeleton className="skeleton-xl" />
        <Card variant="supporting">
          <CardHeader>
            <Skeleton className="skeleton-lg" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-fasting-loading-grid">
              <Skeleton className="skeleton-icon-xl" />
              <Skeleton className="skeleton-value-lg" />
              <Skeleton className="skeleton-label" />
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Active fast state
  if (activeFast && timerData) {
    return (
      <section className="dashboard-fasting-section">
        <h2 className="dashboard-fasting-heading">Fasting</h2>
        <Card
          variant="supporting"
          className="dashboard-card-stretch dashboard-fasting-card-active"
          onClick={() => navigate({ to: ROUTES.FASTING })}
        >
          <CardHeader className="dashboard-fasting-header">
            <CardTitle className="dashboard-fasting-title">
              <Timer className="dashboard-fasting-title-icon" />
              {timerData.isPaused ? "Fast Paused" : "Currently Fasting"}
            </CardTitle>
            <span className="dashboard-fasting-protocol">
              {timerData.protocolName}
            </span>
          </CardHeader>
          <CardContent>
            <div className="dashboard-fasting-active-content">
              {/* Progress Ring */}
              <div className="dashboard-fasting-progress-wrapper">
                <svg
                  className="dashboard-fasting-progress-ring"
                  viewBox="0 0 100 100"
                >
                  <circle
                    className="dashboard-fasting-progress-bg"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                  />
                  <circle
                    className="dashboard-fasting-progress-fill"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${timerData.progress * 2.83} 283`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="dashboard-fasting-progress-text">
                  <span className="dashboard-fasting-progress-percent">
                    {timerData.progress}%
                  </span>
                </div>
              </div>

              {/* Time Stats */}
              <div className="dashboard-fasting-time-stats">
                <div className="dashboard-fasting-time-item">
                  <span className="dashboard-fasting-time-value">
                    {formatDuration(timerData.elapsedMin)}
                  </span>
                  <span className="dashboard-fasting-time-label">elapsed</span>
                </div>
                <div className="dashboard-fasting-time-divider" />
                <div className="dashboard-fasting-time-item">
                  <span className="dashboard-fasting-time-value">
                    {formatDuration(timerData.remainingMin)}
                  </span>
                  <span className="dashboard-fasting-time-label">
                    remaining
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Idle state with stats
  if (stats && stats.totalFasts > 0) {
    return (
      <section className="dashboard-fasting-section">
        <h2 className="dashboard-fasting-heading">Fasting</h2>
        <Card
          variant="supporting"
          className="dashboard-card-stretch"
          onClick={() => navigate({ to: ROUTES.FASTING })}
        >
          <CardHeader>
            <CardTitle className="dashboard-fasting-title">
              <Clock className="dashboard-fasting-title-icon" />
              Ready to Fast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard-fasting-stats-grid">
              {/* Current Streak */}
              <div className="dashboard-fasting-stat-item">
                <div className="dashboard-fasting-icon-container">
                  <Flame className="dashboard-fasting-icon" />
                </div>
                <div className="dashboard-fasting-stat-value">
                  {stats.currentStreak}
                </div>
                <div className="dashboard-fasting-stat-label">
                  day{stats.currentStreak !== 1 ? "s" : ""} streak
                </div>
              </div>

              {/* This Week */}
              <div className="dashboard-fasting-stat-item">
                <div className="dashboard-fasting-icon-container-success">
                  <CheckCircle className="dashboard-fasting-icon-success" />
                </div>
                <div className="dashboard-fasting-stat-value">
                  {stats.fastsThisWeek}
                </div>
                <div className="dashboard-fasting-stat-label">this week</div>
              </div>

              {/* Total Fasts */}
              <div className="dashboard-fasting-stat-item">
                <div className="dashboard-fasting-icon-container-accent">
                  <Timer className="dashboard-fasting-icon-accent" />
                </div>
                <div className="dashboard-fasting-stat-value">
                  {stats.totalFasts}
                </div>
                <div className="dashboard-fasting-stat-label">total fasts</div>
              </div>
            </div>

            <Button
              className="dashboard-fasting-start-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate({ to: ROUTES.FASTING });
              }}
            >
              <Play className="w-4 h-4" />
              Start Fast
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Empty state - no fasting history
  return (
    <section className="dashboard-fasting-section">
      <h2 className="dashboard-fasting-heading">Fasting</h2>
      <EmptyState
        icon={Timer}
        title="Try intermittent fasting"
        description="Track your fasts to improve metabolism and energy"
        action={{
          label: "Start Your First Fast",
          onClick: () => navigate({ to: ROUTES.FASTING }),
        }}
        clickable
      />
    </section>
  );
}
