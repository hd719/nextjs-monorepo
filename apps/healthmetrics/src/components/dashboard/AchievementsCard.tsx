import { Trophy, Star, Medal, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "@/constants/routes";
import type { AchievementSummary } from "@/types";

export interface AchievementsCardProps {
  data: AchievementSummary | null;
  isLoading?: boolean;
}

export function AchievementsCard({ data, isLoading }: AchievementsCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="dashboard-achievements-section">
        <Skeleton className="skeleton-xl" />
        <Card variant="supporting">
          <CardHeader>
            <Skeleton className="skeleton-lg" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-achievements-loading-grid">
              {["unlocked", "points", "recent"].map((stat) => (
                <div key={stat} className="dashboard-achievements-loading-item">
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

  if (!data || data.unlockedCount === 0) {
    return (
      <section className="dashboard-achievements-section">
        <h2 className="dashboard-achievements-heading">Achievements</h2>
        <EmptyState
          icon={Trophy}
          title="No achievements yet"
          description="Complete goals and maintain streaks to unlock achievements"
          action={{
            label: "View All Achievements",
            onClick: () => navigate({ to: ROUTES.ACHIEVEMENTS }),
          }}
          clickable
        />
      </section>
    );
  }

  const progressPercent = Math.round(
    (data.unlockedCount / data.totalCount) * 100
  );

  return (
    <section className="dashboard-achievements-section">
      <h2 className="dashboard-achievements-heading">Achievements</h2>
      <Card variant="supporting" className="dashboard-card-stretch">
        <CardHeader>
          <CardTitle className="dashboard-achievements-title">
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="dashboard-achievements-grid">
            {/* Unlocked Count */}
            <div className="dashboard-achievements-stat-item">
              <div className="dashboard-achievements-icon-container">
                <Trophy className="dashboard-achievements-icon" />
              </div>
              <div className="dashboard-achievements-value">
                {data.unlockedCount}/{data.totalCount}
              </div>
              <div className="dashboard-achievements-label">unlocked</div>
            </div>

            {/* Total Points */}
            <div className="dashboard-achievements-stat-item">
              <div className="dashboard-achievements-icon-container-warning">
                <Star className="dashboard-achievements-icon-warning" />
              </div>
              <div className="dashboard-achievements-value">
                {data.totalPoints}
              </div>
              <div className="dashboard-achievements-label">points</div>
            </div>

            {/* Progress */}
            <div className="dashboard-achievements-stat-item">
              <div className="dashboard-achievements-icon-container-accent">
                <Award className="dashboard-achievements-icon-accent" />
              </div>
              <div className="dashboard-achievements-value">
                {progressPercent}%
              </div>
              <div className="dashboard-achievements-label">complete</div>
            </div>
          </div>

          {/* Recent Achievement */}
          {data.recentUnlocks && data.recentUnlocks.length > 0 && (
            <div className="dashboard-achievements-recent">
              <Medal className="w-4 h-4 text-warning" />
              <span>Latest: {data.recentUnlocks[0].name}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
