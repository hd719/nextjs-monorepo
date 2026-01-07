import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ProgressWeightEntry } from "@/types";

interface WeightTrendChartProps {
  data: ProgressWeightEntry[];
  goalWeight: number;
  currentWeight?: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const weight = payload[0].value;
  const date = new Date(label || "").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="progress-chart-tooltip">
      <p className="progress-chart-tooltip-date">{date}</p>
      <p className="progress-chart-tooltip-value">{weight} lbs</p>
    </div>
  );
}

export function WeightTrendChart({
  data,
  goalWeight,
  currentWeight,
}: WeightTrendChartProps) {
  const chartData = data.map((entry) => ({
    date: entry.date,
    weight: entry.weight,
    label: new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Calculate Y-axis domain with padding
  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights, goalWeight);
  const maxWeight = Math.max(...weights);
  const padding = (maxWeight - minWeight) * 0.1;
  const yMin = Math.floor(minWeight - padding);
  const yMax = Math.ceil(maxWeight + padding);

  return (
    <Card variant="supporting">
      <CardContent className="progress-chart-card">
        <div className="progress-chart-header">
          <h3 className="progress-chart-title">
            <Scale className="progress-chart-title-icon" aria-hidden="true" />
            Weight Trend
          </h3>
          {currentWeight && (
            <div className="progress-weight-current">
              Current:{" "}
              <span className="progress-weight-current-value">
                {currentWeight} lbs
              </span>
            </div>
          )}
        </div>

        <div
          className="progress-chart-container"
          role="img"
          aria-label={`Weight trend chart showing ${data.length} data points. Current weight: ${currentWeight || data[data.length - 1]?.weight} lbs. Goal: ${goalWeight} lbs.`}
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={(value: number) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Goal weight reference line */}
              <ReferenceLine
                y={goalWeight}
                stroke="var(--success)"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Goal: ${goalWeight}`,
                  position: "right",
                  fill: "var(--success)",
                  fontSize: 11,
                }}
              />

              {/* Weight line */}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{ fill: "var(--accent)", strokeWidth: 0, r: 3 }}
                activeDot={{
                  fill: "var(--accent)",
                  stroke: "var(--background)",
                  strokeWidth: 2,
                  r: 6,
                }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="progress-chart-legend">
          <div className="progress-chart-legend-item">
            <div className="progress-chart-legend-dot progress-legend-dot-accent" />
            <span>Weight</span>
          </div>
          <div className="progress-chart-legend-item">
            <div className="progress-chart-legend-dot progress-legend-dot-goal" />
            <span>Goal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
