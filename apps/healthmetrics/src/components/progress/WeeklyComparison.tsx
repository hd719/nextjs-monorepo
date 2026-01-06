import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";

interface ComparisonData {
  thisWeek: {
    avgCalories: number;
    totalCalories: number;
    avgProtein: number;
    proteinGoalPercent: number;
    workouts: number;
    exerciseDuration: number;
    exerciseCalories: number;
    weightChange: number;
  };
  lastWeek: {
    avgCalories: number;
    totalCalories: number;
    avgProtein: number;
    proteinGoalPercent: number;
    workouts: number;
    exerciseDuration: number;
    exerciseCalories: number;
    weightChange: number;
  };
}

interface WeeklyComparisonProps {
  data: ComparisonData;
}

/**
 * Calculate percentage change between two values
 */
function calcChange(
  current: number,
  previous: number
): { value: number; isUp: boolean; isNeutral: boolean } {
  if (previous === 0) return { value: 0, isUp: false, isNeutral: true };
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return {
    value: Math.abs(Math.round(change)),
    isUp: change > 0,
    isNeutral: Math.abs(change) < 1,
  };
}

/**
 * ChangeIndicator - Shows trend with icon and percentage
 */
function ChangeIndicator({
  change,
  positiveIsGood = true,
}: {
  change: { value: number; isUp: boolean; isNeutral: boolean };
  positiveIsGood?: boolean;
}) {
  if (change.isNeutral) {
    return (
      <div className="progress-comparison-change progress-comparison-change-neutral">
        <Minus className="progress-comparison-change-icon" />
        <span>—</span>
      </div>
    );
  }

  // Determine if this change is "good" or "bad"
  const isGood = positiveIsGood ? change.isUp : !change.isUp;

  return (
    <div
      className={cn(
        "progress-comparison-change",
        isGood
          ? "progress-comparison-change-positive"
          : "progress-comparison-change-negative"
      )}
    >
      {change.isUp ? (
        <TrendingUp className="progress-comparison-change-icon" />
      ) : (
        <TrendingDown className="progress-comparison-change-icon" />
      )}
      <span>
        {change.isUp ? "+" : "-"}
        {change.value}%
      </span>
    </div>
  );
}

/**
 * Comparison row data
 */
interface RowData {
  metric: string;
  thisWeek: string | number;
  lastWeek: string | number;
  change: { value: number; isUp: boolean; isNeutral: boolean };
  positiveIsGood: boolean;
}

export function WeeklyComparison({ data }: WeeklyComparisonProps) {
  const { thisWeek, lastWeek } = data;

  // Build comparison rows
  const calorieRows: RowData[] = [
    {
      metric: "Average",
      thisWeek: `${thisWeek.avgCalories.toLocaleString()} cal`,
      lastWeek: `${lastWeek.avgCalories.toLocaleString()} cal`,
      change: calcChange(thisWeek.avgCalories, lastWeek.avgCalories),
      positiveIsGood: false, // Lower calories often better
    },
    {
      metric: "Total",
      thisWeek: `${thisWeek.totalCalories.toLocaleString()} cal`,
      lastWeek: `${lastWeek.totalCalories.toLocaleString()} cal`,
      change: calcChange(thisWeek.totalCalories, lastWeek.totalCalories),
      positiveIsGood: false,
    },
  ];

  const proteinRows: RowData[] = [
    {
      metric: "Average",
      thisWeek: `${thisWeek.avgProtein}g`,
      lastWeek: `${lastWeek.avgProtein}g`,
      change: calcChange(thisWeek.avgProtein, lastWeek.avgProtein),
      positiveIsGood: true, // More protein usually better
    },
    {
      metric: "% of Goal",
      thisWeek: `${thisWeek.proteinGoalPercent}%`,
      lastWeek: `${lastWeek.proteinGoalPercent}%`,
      change: calcChange(
        thisWeek.proteinGoalPercent,
        lastWeek.proteinGoalPercent
      ),
      positiveIsGood: true,
    },
  ];

  const exerciseRows: RowData[] = [
    {
      metric: "Workouts",
      thisWeek: thisWeek.workouts,
      lastWeek: lastWeek.workouts,
      change: calcChange(thisWeek.workouts, lastWeek.workouts),
      positiveIsGood: true,
    },
    {
      metric: "Duration",
      thisWeek: `${thisWeek.exerciseDuration} hrs`,
      lastWeek: `${lastWeek.exerciseDuration} hrs`,
      change: calcChange(thisWeek.exerciseDuration, lastWeek.exerciseDuration),
      positiveIsGood: true,
    },
    {
      metric: "Calories Burned",
      thisWeek: thisWeek.exerciseCalories.toLocaleString(),
      lastWeek: lastWeek.exerciseCalories.toLocaleString(),
      change: calcChange(thisWeek.exerciseCalories, lastWeek.exerciseCalories),
      positiveIsGood: true,
    },
  ];

  const weightRows: RowData[] = [
    {
      metric: "Change",
      thisWeek: `${thisWeek.weightChange > 0 ? "+" : ""}${thisWeek.weightChange} lbs`,
      lastWeek: `${lastWeek.weightChange > 0 ? "+" : ""}${lastWeek.weightChange} lbs`,
      // For weight loss goals, more negative is better
      change: calcChange(
        Math.abs(thisWeek.weightChange),
        Math.abs(lastWeek.weightChange)
      ),
      positiveIsGood: thisWeek.weightChange < 0, // If losing weight, more loss is good
    },
  ];

  return (
    <Card variant="supporting">
      <CardContent className="progress-chart-card">
        <div className="progress-chart-header">
          <h3 className="progress-chart-title">
            <BarChart3
              className="progress-chart-title-icon"
              aria-hidden="true"
            />
            This Week vs Last Week
          </h3>
        </div>

        <div className="progress-comparison-section overflow-x-auto">
          <table className="progress-comparison-table">
            <thead className="progress-comparison-thead">
              <tr>
                <th className="progress-comparison-th progress-comparison-th-metric">
                  Metric
                </th>
                <th className="progress-comparison-th progress-comparison-th-week">
                  This Week
                </th>
                <th className="progress-comparison-th progress-comparison-th-week">
                  Last Week
                </th>
                <th className="progress-comparison-th progress-comparison-th-change">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Calories Section */}
              <tr>
                <td colSpan={4} className="progress-comparison-category-header">
                  Calories
                </td>
              </tr>
              {calorieRows.map((row) => (
                <tr key={row.metric} className="progress-comparison-row">
                  <td className="progress-comparison-td progress-comparison-metric">
                    {row.metric}
                  </td>
                  <td className="progress-comparison-td progress-comparison-value">
                    {row.thisWeek}
                  </td>
                  <td className="progress-comparison-td progress-comparison-value">
                    {row.lastWeek}
                  </td>
                  <td className="progress-comparison-td">
                    <ChangeIndicator
                      change={row.change}
                      positiveIsGood={row.positiveIsGood}
                    />
                  </td>
                </tr>
              ))}

              {/* Protein Section */}
              <tr>
                <td colSpan={4} className="progress-comparison-category-header">
                  Protein
                </td>
              </tr>
              {proteinRows.map((row) => (
                <tr key={row.metric} className="progress-comparison-row">
                  <td className="progress-comparison-td progress-comparison-metric">
                    {row.metric}
                  </td>
                  <td className="progress-comparison-td progress-comparison-value">
                    {row.thisWeek}
                  </td>
                  <td className="progress-comparison-td progress-comparison-value">
                    {row.lastWeek}
                  </td>
                  <td className="progress-comparison-td">
                    <ChangeIndicator
                      change={row.change}
                      positiveIsGood={row.positiveIsGood}
                    />
                  </td>
                </tr>
              ))}

              {/* Exercise Section */}
              <tr>
                <td colSpan={4} className="progress-comparison-category-header">
                  Exercise
                </td>
              </tr>
              {exerciseRows.map((row) => (
                <tr key={row.metric} className="progress-comparison-row">
                  <td className="progress-comparison-td progress-comparison-metric">
                    {row.metric}
                  </td>
                  <td className="progress-comparison-td progress-comparison-value">
                    {row.thisWeek}
                  </td>
                  <td className="progress-comparison-td progress-comparison-value">
                    {row.lastWeek}
                  </td>
                  <td className="progress-comparison-td">
                    <ChangeIndicator
                      change={row.change}
                      positiveIsGood={row.positiveIsGood}
                    />
                  </td>
                </tr>
              ))}

              {/* Weight Section */}
              <tr>
                <td colSpan={4} className="progress-comparison-category-header">
                  Weight
                </td>
              </tr>
              {weightRows.map((row) => (
                <tr key={row.metric} className="progress-comparison-row">
                  <td className="progress-comparison-td progress-comparison-metric">
                    {row.metric}
                  </td>
                  <td className="progress-comparison-td progress-comparison-value">
                    {row.thisWeek}
                  </td>
                  <td className="progress-comparison-td progress-comparison-value">
                    {row.lastWeek}
                  </td>
                  <td className="progress-comparison-td">
                    <ChangeIndicator
                      change={row.change}
                      positiveIsGood={row.positiveIsGood}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
