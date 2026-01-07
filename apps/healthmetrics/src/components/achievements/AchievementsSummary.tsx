import { Trophy, Star, Medal, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAchievementSummary, useStreaks } from "@/hooks";

interface AchievementsSummaryProps {
  userId: string;
}

// Mock data toggle - uses environment variable for consistency with dashboard
const useMockAchievements =
  import.meta.env.VITE_USE_MOCK_ACHIEVEMENTS === "true";
const MOCK_SUMMARY = {
  totalPoints: 1250,
  unlockedCount: 8,
  totalCount: 24,
};
const MOCK_STREAKS = {
  currentLogging: 12,
  bestLogging: 21,
};

export function AchievementsSummary({ userId }: AchievementsSummaryProps) {
  const { data: summary } = useAchievementSummary(userId);
  const { data: streaks } = useStreaks(userId);

  const totalPoints = useMockAchievements
    ? MOCK_SUMMARY.totalPoints
    : (summary?.totalPoints ?? 0);
  const unlockedCount = useMockAchievements
    ? MOCK_SUMMARY.unlockedCount
    : (summary?.unlockedCount ?? 0);
  const totalCount = useMockAchievements
    ? MOCK_SUMMARY.totalCount
    : (summary?.totalCount ?? 0);
  const currentStreak = useMockAchievements
    ? MOCK_STREAKS.currentLogging
    : (streaks?.currentLogging ?? 0);

  return (
    <div className="achievements-summary-grid">
      {/* Total Points */}
      <Card
        variant="supporting"
        className="achievements-summary-card achievements-card-points"
      >
        <CardContent className="achievements-summary-content">
          <div className="achievements-summary-icon achievements-icon-points">
            <Star className="w-6 h-6" />
          </div>
          <div className="achievements-summary-info">
            <span className="achievements-summary-value">{totalPoints}</span>
            <span className="achievements-summary-label">Total Points</span>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Unlocked */}
      <Card
        variant="supporting"
        className="achievements-summary-card achievements-card-unlocked"
      >
        <CardContent className="achievements-summary-content">
          <div className="achievements-summary-icon achievements-icon-unlocked">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="achievements-summary-info">
            <span className="achievements-summary-value">
              {unlockedCount}/{totalCount}
            </span>
            <span className="achievements-summary-label">Achievements</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card
        variant="supporting"
        className="achievements-summary-card achievements-card-streak"
      >
        <CardContent className="achievements-summary-content">
          <div className="achievements-summary-icon achievements-icon-streak">
            <Flame className="w-6 h-6" />
          </div>
          <div className="achievements-summary-info">
            <span className="achievements-summary-value">{currentStreak}</span>
            <span className="achievements-summary-label">Day Streak</span>
          </div>
        </CardContent>
      </Card>

      {/* Best Streak */}
      <Card
        variant="supporting"
        className="achievements-summary-card achievements-card-best"
      >
        <CardContent className="achievements-summary-content">
          <div className="achievements-summary-icon achievements-icon-best">
            <Medal className="w-6 h-6" />
          </div>
          <div className="achievements-summary-info">
            <span className="achievements-summary-value">
              {useMockAchievements
                ? MOCK_STREAKS.bestLogging
                : (streaks?.bestLogging ?? 0)}
            </span>
            <span className="achievements-summary-label">Best Streak</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
