/**
 * StreaksProgressCard Component
 *
 * Displays streak comparison on the Progress page
 * (distinct from dashboard StreaksCard).
 */

import { Flame, Droplets, Dumbbell, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { Streak } from "@/types";

interface StreaksProgressCardProps {
  data: {
    logging: Streak;
    water: Streak;
    exercise: Streak;
  };
}

function StreakItem({
  icon: Icon,
  iconClassName,
  label,
  current,
  best,
}: {
  icon: React.ElementType;
  iconClassName: string;
  label: string;
  current: number;
  best: number;
}) {
  const isAtBest = current >= best;
  const isNearBest = current >= best * 0.8 && current < best;

  return (
    <div
      className="progress-streak-item"
      role="group"
      aria-label={`${label}: ${current} days${isAtBest ? ", personal best!" : `, best: ${best} days`}`}
    >
      <Icon
        className={cn("progress-streak-icon", iconClassName)}
        aria-hidden="true"
      />
      <div className="progress-streak-value" aria-hidden="true">
        {current}
      </div>
      <div className="progress-streak-label" aria-hidden="true">
        {label}
      </div>
      <div className="progress-streak-best" aria-hidden="true">
        {isAtBest ? (
          <span className="progress-streak-best-wrapper">
            <Award className="progress-streak-best-icon" /> Personal Best!
          </span>
        ) : isNearBest ? (
          <span className="progress-text-warning">
            {best - current} away from best!
          </span>
        ) : (
          <span>Best: {best}</span>
        )}
      </div>
    </div>
  );
}

export function StreaksProgressCard({ data }: StreaksProgressCardProps) {
  const { logging, water, exercise } = data;

  return (
    <Card variant="supporting">
      <CardContent className="progress-chart-card">
        <div className="progress-streaks-section">
          <h3 className="progress-chart-title">
            <Flame
              className="progress-chart-title-icon progress-icon-fire"
              aria-hidden="true"
            />
            Current Streaks
          </h3>

          <div className="progress-streaks-grid">
            <StreakItem
              icon={Flame}
              iconClassName="progress-streak-icon-fire"
              label="Logging Streak"
              current={logging.current}
              best={logging.best}
            />
            <StreakItem
              icon={Droplets}
              iconClassName="progress-streak-icon-water"
              label="Water Streak"
              current={water.current}
              best={water.best}
            />
            <StreakItem
              icon={Dumbbell}
              iconClassName="progress-streak-icon-exercise"
              label="Exercise Streak"
              current={exercise.current}
              best={exercise.best}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
