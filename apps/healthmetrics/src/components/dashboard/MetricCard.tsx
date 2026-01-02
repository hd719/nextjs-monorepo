import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./MetricCard.module.css";

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
        <CardContent className={styles.cardContent}>
          <div className={styles.loadingContainer}>
            <Skeleton className="h-4 w-20" />
            <div className={styles.loadingValues}>
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
      <CardContent className={styles.cardContent}>
        <div className={styles.content}>
          {/* Label */}
          <h3 className={styles.label}>{label}</h3>

          {/* Values */}
          <div className={styles.values}>
            <div className={styles.consumed}>
              {consumed.toLocaleString()}
              <span className={styles.goal}> / {goal.toLocaleString()}</span>
            </div>
            <p className={styles.unit}>{unit}</p>
          </div>

          {/* Progress bar */}
          <ProgressBar value={consumed} max={goal} />
        </div>
      </CardContent>
    </Card>
  );
}
