import { Flame, Trophy, Target, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "@/constants/routes";
import type { UserStreaks } from "@/types";

export interface StreaksCardProps {
  data: UserStreaks | null;
  isLoading?: boolean;
}

export function StreaksCard({ data, isLoading }: StreaksCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="dashboard-streaks-section">
        <Skeleton className="skeleton-xl" />
        <Card variant="supporting">
          <CardHeader>
            <Skeleton className="skeleton-lg" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-streaks-loading-grid">
              {["logging", "calorie", "exercise"].map((stat) => (
                <div key={stat} className="dashboard-streaks-loading-item">
                  <Skeleton className="skeleton-icon-lg" />
                  <Skeleton className="skeleton-value-sm" />
                  <Skeleton className="skeleton-label" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const hasAnyStreak =
    data &&
    (data.currentLogging > 0 ||
      data.currentCalorie > 0 ||
      data.currentExercise > 0);

  if (!data || !hasAnyStreak) {
    return (
      <section className="dashboard-streaks-section">
        <h2 className="dashboard-streaks-heading">Your Streaks</h2>
        <EmptyState
          icon={Flame}
          title="Start your streak"
          description="Log consistently to build your streaks and earn achievements"
          action={{
            label: "View Achievements",
            onClick: () => navigate({ to: ROUTES.ACHIEVEMENTS }),
          }}
          clickable
        />
      </section>
    );
  }

  return (
    <section className="dashboard-streaks-section">
      <h2 className="dashboard-streaks-heading">Your Streaks</h2>
      <Card variant="supporting" className="dashboard-card-stretch">
        <CardHeader>
          <CardTitle className="dashboard-streaks-title">
            Current Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="dashboard-streaks-grid">
            {/* Logging Streak */}
            <div className="dashboard-streaks-stat-item">
              <div className="dashboard-streaks-icon-container">
                <Flame className="dashboard-streaks-icon" />
              </div>
              <div className="dashboard-streaks-value">
                {data.currentLogging}
              </div>
              <div className="dashboard-streaks-label">
                day{data.currentLogging !== 1 ? "s" : ""} logging
              </div>
              {data.bestLogging > 0 && (
                <div className="dashboard-streaks-best">
                  <Trophy className="w-3 h-3" /> Best: {data.bestLogging}
                </div>
              )}
            </div>

            {/* Calorie Goal Streak */}
            <div className="dashboard-streaks-stat-item">
              <div className="dashboard-streaks-icon-container-success">
                <Target className="dashboard-streaks-icon-success" />
              </div>
              <div className="dashboard-streaks-value">
                {data.currentCalorie}
              </div>
              <div className="dashboard-streaks-label">
                day{data.currentCalorie !== 1 ? "s" : ""} on goal
              </div>
              {data.bestCalorie > 0 && (
                <div className="dashboard-streaks-best">
                  <Trophy className="w-3 h-3" /> Best: {data.bestCalorie}
                </div>
              )}
            </div>

            {/* Exercise Streak */}
            <div className="dashboard-streaks-stat-item">
              <div className="dashboard-streaks-icon-container-accent">
                <Dumbbell className="dashboard-streaks-icon-accent" />
              </div>
              <div className="dashboard-streaks-value">
                {data.currentExercise}
              </div>
              <div className="dashboard-streaks-label">
                day{data.currentExercise !== 1 ? "s" : ""} exercising
              </div>
              {data.bestExercise > 0 && (
                <div className="dashboard-streaks-best">
                  <Trophy className="w-3 h-3" /> Best: {data.bestExercise}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
