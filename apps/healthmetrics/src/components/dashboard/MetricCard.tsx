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
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-20" />
            <div className="space-y-2">
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
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Label */}
          <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>

          {/* Values */}
          <div className="space-y-1">
            <div className="text-3xl font-bold">
              {consumed.toLocaleString()}
              <span className="text-lg text-muted-foreground font-normal">
                {" "}
                / {goal.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{unit}</p>
          </div>

          {/* Progress bar */}
          <ProgressBar value={consumed} max={goal} />
        </div>
      </CardContent>
    </Card>
  );
}
