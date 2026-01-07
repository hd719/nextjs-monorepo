/**
 * CalorieIntakeChart Component
 *
 * Bar chart showing daily calorie intake vs goal.
 * Features:
 * - Color-coded bars (green = on/under goal, amber = over)
 * - Goal line overlay
 * - Hover tooltips with breakdown
 * - Responsive design
 * - Animated bar growth
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CalorieEntry } from "@/types";

interface CalorieIntakeChartProps {
  data: CalorieEntry[];
}

/**
 * Custom tooltip for calorie chart
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: CalorieEntry }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const entry = payload[0].payload;
  const date = new Date(label || "").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const difference = entry.consumed - entry.goal;
  const isOver = difference > 0;

  return (
    <div className="progress-chart-tooltip progress-chart-tooltip-wide">
      <p className="progress-chart-tooltip-date-mb">{date}</p>
      <div className="progress-tooltip-rows">
        <div className="progress-chart-tooltip-row">
          <span className="progress-chart-tooltip-label">Consumed:</span>
          <span className="progress-chart-tooltip-value-sm">
            {entry.consumed} cal
          </span>
        </div>
        <div className="progress-chart-tooltip-row">
          <span className="progress-chart-tooltip-label">Goal:</span>
          <span className="progress-chart-tooltip-value-normal">
            {entry.goal} cal
          </span>
        </div>
        {entry.burned > 0 && (
          <div className="progress-chart-tooltip-row">
            <span className="progress-chart-tooltip-label">Burned:</span>
            <span className="progress-chart-tooltip-burned">
              -{entry.burned} cal
            </span>
          </div>
        )}
        <div className="progress-chart-tooltip-divider">
          <div className="progress-chart-tooltip-row">
            <span className="progress-chart-tooltip-label">Net:</span>
            <span
              className={`progress-chart-tooltip-value-sm ${isOver ? "progress-chart-tooltip-net-over" : "progress-chart-tooltip-net-under"}`}
            >
              {isOver ? "+" : ""}
              {difference} cal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalorieIntakeChart({ data }: CalorieIntakeChartProps) {
  // Format data for Recharts - show last 14 days max for readability
  const displayData = data.slice(-14);

  const chartData = displayData.map((entry) => ({
    ...entry,
    label: new Date(entry.date).toLocaleDateString("en-US", {
      weekday: "short",
    }),
  }));

  // Get goal from first entry (assuming consistent)
  const goal = data[0]?.goal || 2000;

  // Calculate max for Y-axis
  const maxCalories = Math.max(...data.map((d) => d.consumed));
  const yMax = Math.ceil(Math.max(maxCalories, goal) * 1.15);

  return (
    <Card variant="supporting">
      <CardContent className="progress-chart-card">
        <div className="progress-chart-header">
          <h3 className="progress-chart-title">
            <Flame className="progress-chart-title-icon" aria-hidden="true" />
            Calorie Intake
          </h3>
          <div className="progress-text-subtitle">Last 2 weeks</div>
        </div>

        <div
          className="progress-chart-container"
          role="img"
          aria-label={`Calorie intake chart for the last ${displayData.length} days. Daily goal: ${goal} calories.`}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={(value: number) => `${value}`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              />

              {/* Goal reference line */}
              <ReferenceLine
                y={goal}
                stroke="var(--muted-foreground)"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `Goal: ${goal}`,
                  position: "right",
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                }}
              />

              {/* Calorie bars with conditional coloring */}
              <Bar
                dataKey="consumed"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.consumed > entry.goal
                        ? "var(--warning)"
                        : "var(--success)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="progress-chart-legend">
          <div className="progress-chart-legend-item">
            <div className="progress-chart-legend-dot progress-legend-dot-success" />
            <span>On/Under Goal</span>
          </div>
          <div className="progress-chart-legend-item">
            <div className="progress-chart-legend-dot progress-legend-dot-warning" />
            <span>Over Goal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
