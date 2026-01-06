/**
 * SleepCard Component
 *
 * Displays weekly sleep data with bar chart and quality indicator.
 * Features:
 * - Weekly sleep hours bar chart
 * - Goal line indicator
 * - Sleep quality progress bar
 * - Average hours display
 */

import { Moon, Bed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SleepData {
  avgHours: number;
  goalHours: number;
  quality: number;
  weeklyData: { day: string; hours: number }[];
}

interface SleepCardProps {
  data: SleepData;
}

export function SleepCard({ data }: SleepCardProps) {
  const { avgHours, goalHours, quality, weeklyData } = data;

  // Calculate best and worst days
  const bestDay = weeklyData.reduce((a, b) => (a.hours > b.hours ? a : b));
  const avgVsGoal = ((avgHours / goalHours) * 100).toFixed(0);

  return (
    <Card variant="supporting">
      <CardContent className="progress-chart-card">
        <div className="progress-chart-header">
          <h3 className="progress-chart-title">
            <Moon
              className="progress-chart-title-icon progress-icon-sleep"
              aria-hidden="true"
            />
            Sleep
          </h3>
          <div className="progress-text-subtitle">This Week</div>
        </div>

        {/* Stats row */}
        <div className="progress-sleep-stats">
          <div className="progress-sleep-stat-item">
            <span className="progress-sleep-stat-value">{avgHours}h</span>
            <span className="progress-sleep-stat-label">Avg/Night</span>
          </div>
          <div className="progress-sleep-stat-item">
            <span className="progress-sleep-stat-value">{goalHours}h</span>
            <span className="progress-sleep-stat-label">Goal</span>
          </div>
          <div className="progress-sleep-stat-item">
            <span className="progress-sleep-stat-value">{avgVsGoal}%</span>
            <span className="progress-sleep-stat-label">Of Goal</span>
          </div>
        </div>

        {/* Weekly sleep bars */}
        <div
          className="progress-sleep-chart"
          role="img"
          aria-label={`Weekly sleep chart: averaging ${avgHours} hours per night. Best day: ${bestDay.day} with ${bestDay.hours} hours.`}
        >
          {weeklyData.map((day) => {
            const heightPercent = (day.hours / 10) * 100;
            const isUnderGoal = day.hours < goalHours;
            return (
              <div key={day.day} className="progress-sleep-bar-col">
                <div className="progress-sleep-bar-container">
                  <div
                    className={`progress-sleep-bar ${isUnderGoal ? "progress-sleep-bar-under" : "progress-sleep-bar-good"}`}
                    style={
                      {
                        "--bar-height": `${heightPercent}%`,
                      } as React.CSSProperties
                    }
                  />
                </div>
                <span className="progress-sleep-day-label">{day.day}</span>
              </div>
            );
          })}
          {/* Goal line */}
          <div
            className="progress-sleep-goal-line"
            style={
              {
                "--goal-position": `${(goalHours / 10) * 100}%`,
              } as React.CSSProperties
            }
          />
        </div>

        {/* Sleep quality indicator */}
        <div className="progress-sleep-quality">
          <span className="progress-sleep-quality-label">Sleep Quality</span>
          <div
            className="progress-sleep-quality-bar-track"
            role="progressbar"
            aria-valuenow={quality}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Sleep quality: ${quality}%`}
          >
            <div
              className="progress-sleep-quality-bar-fill"
              style={
                { "--quality-width": `${quality}%` } as React.CSSProperties
              }
              aria-hidden="true"
            />
          </div>
          <span className="progress-sleep-quality-value" aria-hidden="true">
            {quality}%
          </span>
        </div>

        {/* Best night callout */}
        <div className="progress-sleep-best">
          <Bed className="progress-sleep-best-icon" aria-hidden="true" />
          <span>
            Best: {bestDay.day} ({bestDay.hours}h)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
