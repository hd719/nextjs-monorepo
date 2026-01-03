import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";

export interface MetricCardProps {
  label: string;
  consumed: number;
  goal: number;
  unit: string;
  isLoading?: boolean;
}

export function MetricCard({
  label,
  consumed,
  goal,
  unit,
  isLoading,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="dashboard-metric-card-content">
          <div className="dashboard-metric-loading-container">
            <Skeleton className="h-4 w-20" />
            <div className="dashboard-metric-loading-values">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="dashboard-metric-card-content">
        <div className="dashboard-metric-content">
          {/* Label */}
          <h3 className="dashboard-metric-label">{label}</h3>

          {/* Values */}
          <div className="dashboard-metric-values">
            <div className="dashboard-metric-consumed">
              {consumed.toLocaleString()}
              <span className="dashboard-metric-goal">
                {" "}
                / {goal.toLocaleString()}
              </span>
            </div>
            <p className="dashboard-metric-unit">{unit}</p>
          </div>

          {/* Progress bar */}
          <ProgressBar value={consumed} max={goal} />
        </div>
      </CardContent>
    </Card>
  );
}
