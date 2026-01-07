import { Flame, Utensils, Target, Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useStreaks } from "@/hooks";

interface StreaksDashboardProps {
  userId: string;
}

interface StreakCardProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  best: number;
  color: string;
}

function StreakCard({ icon, label, current, best, color }: StreakCardProps) {
  const isActive = current > 0;

  return (
    <div className={`streak-card ${isActive ? "streak-card-active" : ""}`}>
      <div className={`streak-card-icon ${color}`}>
        {icon}
        {isActive && (
          <div className="streak-flame-indicator">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          </div>
        )}
      </div>
      <div className="streak-card-content">
        <span className="streak-card-label">{label}</span>
        <div className="streak-card-values">
          <span className="streak-card-current">{current} days</span>
          <span className="streak-card-best">Best: {best}</span>
        </div>
      </div>
    </div>
  );
}

// Mock data toggle - uses environment variable for consistency with dashboard
const useMockAchievements =
  import.meta.env.VITE_USE_MOCK_ACHIEVEMENTS === "true";
const MOCK_STREAKS = {
  currentLogging: 12,
  bestLogging: 21,
  currentCalorie: 5,
  bestCalorie: 14,
  currentExercise: 3,
  bestExercise: 7,
};

export function StreaksDashboard({ userId }: StreaksDashboardProps) {
  const { data: streaks, isLoading } = useStreaks(userId);

  const displayStreaks = useMockAchievements ? MOCK_STREAKS : streaks;

  if (isLoading && !useMockAchievements) {
    return (
      <Card variant="supporting" className="streaks-dashboard-card">
        <CardContent className="streaks-dashboard-loading">
          <div className="loading-spinner" />
          <span>Loading streaks...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="supporting" className="streaks-dashboard-card">
      <CardContent className="streaks-dashboard-content">
        <h3 className="streaks-dashboard-title">
          <Flame className="w-5 h-5 text-orange-400" />
          Your Streaks
        </h3>

        <div className="streaks-grid">
          <StreakCard
            icon={<Utensils className="w-6 h-6" />}
            label="Logging"
            current={displayStreaks?.currentLogging ?? 0}
            best={displayStreaks?.bestLogging ?? 0}
            color="streak-icon-logging"
          />
          <StreakCard
            icon={<Target className="w-6 h-6" />}
            label="Calorie Goal"
            current={displayStreaks?.currentCalorie ?? 0}
            best={displayStreaks?.bestCalorie ?? 0}
            color="streak-icon-calorie"
          />
          <StreakCard
            icon={<Dumbbell className="w-6 h-6" />}
            label="Exercise"
            current={displayStreaks?.currentExercise ?? 0}
            best={displayStreaks?.bestExercise ?? 0}
            color="streak-icon-exercise"
          />
        </div>

        {/* Motivational message */}
        <div className="streaks-motivation">
          {(displayStreaks?.currentLogging ?? 0) === 0 ? (
            <p>Start logging today to build your streak!</p>
          ) : (displayStreaks?.currentLogging ?? 0) >= 7 ? (
            <p>Amazing! You&apos;ve been consistent for a week! Keep it up!</p>
          ) : (
            <p>
              Keep going! {7 - (displayStreaks?.currentLogging ?? 0)} more days
              to reach a week!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
