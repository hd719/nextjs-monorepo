import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Target, Trophy, Clock } from "lucide-react";
import { useFastingStats } from "@/hooks";

interface FastingStatsCardProps {
  userId: string;
}

/**
 * Stats card showing fasting streaks and weekly progress
 */
export function FastingStatsCard({ userId }: FastingStatsCardProps) {
  const { data: stats, isLoading } = useFastingStats(userId);

  if (isLoading) {
    return <FastingStatsCardSkeleton />;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="fasting-stats-grid">
      {/* Current Streak */}
      <Card>
        <div className="fasting-stat-card-content">
          <div className="fasting-stat-icon-wrapper fasting-stat-icon-wrapper-primary">
            <Flame className="fasting-stat-icon" />
          </div>
          <div className="fasting-stat-body">
            <div className="fasting-stat-value">{stats.currentStreak}</div>
            <div className="fasting-stat-label">Day Streak</div>
          </div>
        </div>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <div className="fasting-stat-card-content">
          <div className="fasting-stat-icon-wrapper fasting-stat-icon-wrapper-success">
            <Target className="fasting-stat-icon" />
          </div>
          <div className="fasting-stat-body">
            <div className="fasting-stat-value">
              {stats.fastsThisWeek}
              {stats.weeklyGoal && (
                <span className="text-base font-normal text-muted-foreground">
                  /{stats.weeklyGoal}
                </span>
              )}
            </div>
            <div className="fasting-stat-label">This Week</div>
          </div>
        </div>
      </Card>

      {/* Best Streak */}
      <Card>
        <div className="fasting-stat-card-content">
          <div className="fasting-stat-icon-wrapper fasting-stat-icon-wrapper-primary">
            <Trophy className="fasting-stat-icon" />
          </div>
          <div className="fasting-stat-body">
            <div className="fasting-stat-value">{stats.longestStreak}</div>
            <div className="fasting-stat-label">Best Streak</div>
          </div>
        </div>
      </Card>

      {/* Average Duration */}
      <Card>
        <div className="fasting-stat-card-content">
          <div className="fasting-stat-icon-wrapper fasting-stat-icon-wrapper-success">
            <Clock className="fasting-stat-icon" />
          </div>
          <div className="fasting-stat-body">
            <div className="fasting-stat-value">
              {Math.round(stats.averageFastDuration / 60)}h
            </div>
            <div className="fasting-stat-label">Avg Duration</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function FastingStatsCardSkeleton() {
  return (
    <div className="fasting-stats-grid">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <div className="fasting-stat-card-content">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
