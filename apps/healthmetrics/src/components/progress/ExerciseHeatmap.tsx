import { useMemo } from "react";
import { Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { ExerciseEntry } from "@/types";

interface ExerciseHeatmapProps {
  data: ExerciseEntry[];
  summary: {
    workoutsThisMonth: number;
    hoursThisMonth: number;
    caloriesBurnedThisWeek: number;
  };
}

// Day labels (short form for compact display)
const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

// Month labels for the top axis
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Generate heatmap grid data from exercise entries
 * Creates a 52-week x 7-day grid (full year)
 */
function generateHeatmapGrid(data: ExerciseEntry[]) {
  // Create a map of date -> intensity
  const intensityMap = new Map<string, number>();
  data.forEach((entry) => {
    // Take highest intensity for the day if multiple workouts
    const existing = intensityMap.get(entry.date) || 0;
    intensityMap.set(entry.date, Math.max(existing, entry.intensity));
  });

  // Generate 52 weeks of dates (full year)
  const weeks: { date: string; intensity: number; dayOfWeek: number }[][] = [];
  const today = new Date();

  // Find the most recent Saturday to end the grid
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  // Go back 52 weeks (364 days)
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 363); // 52 weeks = 364 days - 1

  // Build grid
  const currentDate = new Date(startDate);
  let currentWeek: { date: string; intensity: number; dayOfWeek: number }[] =
    [];

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayOfWeek = currentDate.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Sun=6

    currentWeek.push({
      date: dateStr,
      intensity: intensityMap.get(dateStr) || 0,
      dayOfWeek: adjustedDay,
    });

    // If Sunday, start new week
    if (dayOfWeek === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Add remaining days
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * HeatmapCell - Individual day cell with hover state
 */
function HeatmapCell({ date, intensity }: { date: string; intensity: number }) {
  const isFuture = new Date(date) > new Date();

  return (
    <div
      className={cn(
        "progress-heatmap-cell",
        `progress-heatmap-cell-${intensity}`,
        isFuture && "progress-heatmap-cell-future"
      )}
      title={`${new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })}: ${intensity === 0 ? "Rest day" : intensity === 1 ? "Light" : intensity === 2 ? "Moderate" : "Intense"}`}
      aria-label={`${date}: intensity level ${intensity}`}
    />
  );
}

export function ExerciseHeatmap({ data, summary }: ExerciseHeatmapProps) {
  // Generate heatmap grid
  const weeks = useMemo(() => generateHeatmapGrid(data), [data]);

  return (
    <Card variant="supporting">
      <CardContent className="progress-chart-card">
        <div className="progress-chart-header">
          <h3 className="progress-chart-title">
            <Dumbbell
              className="progress-chart-title-icon"
              aria-hidden="true"
            />
            Exercise Activity
          </h3>
          <div className="progress-text-subtitle">Last 12 months</div>
        </div>

        {/* Heatmap Grid */}
        <div
          className="progress-heatmap-container"
          role="img"
          aria-label={`Exercise activity heatmap for the last 12 months. ${summary.workoutsThisMonth} workouts this month, ${summary.hoursThisMonth} hours total.`}
        >
          {/* Month labels row */}
          <div className="progress-heatmap-months">
            <div className="progress-heatmap-day-label-spacer" />
            <div className="progress-heatmap-month-labels">
              {MONTH_LABELS.map((month) => (
                <span key={month} className="progress-heatmap-month-label">
                  {month}
                </span>
              ))}
            </div>
          </div>

          <div className="progress-heatmap-grid">
            {DAY_LABELS.map((day, dayIndex) => (
              <div key={dayIndex} className="progress-heatmap-row">
                <span className="progress-heatmap-day-label">{day}</span>
                <div className="progress-heatmap-cells">
                  {weeks.map((week, weekIndex) => {
                    const dayData = week.find((d) => d.dayOfWeek === dayIndex);
                    // Render empty placeholder for incomplete weeks at start/end
                    if (!dayData) {
                      return (
                        <div
                          key={`empty-${weekIndex}-${dayIndex}`}
                          className="progress-heatmap-cell progress-heatmap-cell-0"
                        />
                      );
                    }
                    return (
                      <HeatmapCell
                        key={`${weekIndex}-${dayIndex}`}
                        date={dayData.date}
                        intensity={dayData.intensity}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="progress-heatmap-legend">
            <span>Less</span>
            <div className="progress-heatmap-legend-cell progress-heatmap-cell-0" />
            <div className="progress-heatmap-legend-cell progress-heatmap-cell-1" />
            <div className="progress-heatmap-legend-cell progress-heatmap-cell-2" />
            <div className="progress-heatmap-legend-cell progress-heatmap-cell-3" />
            <span>More</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="progress-exercise-stats">
          <div className="progress-exercise-stat-item">
            <div className="progress-exercise-stat-value">
              {summary.workoutsThisMonth}
            </div>
            <div className="progress-exercise-stat-label">
              workouts this month
            </div>
          </div>
          <div className="progress-exercise-stat-item">
            <div className="progress-exercise-stat-value">
              {summary.hoursThisMonth}hrs
            </div>
            <div className="progress-exercise-stat-label">total time</div>
          </div>
          <div className="progress-exercise-stat-item">
            <div className="progress-exercise-stat-value">
              {summary.caloriesBurnedThisWeek.toLocaleString()}
            </div>
            <div className="progress-exercise-stat-label">cal burned/week</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
