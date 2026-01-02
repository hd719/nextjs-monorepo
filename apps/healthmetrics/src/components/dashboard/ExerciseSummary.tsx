import { Dumbbell, Clock, Flame, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExerciseSummary as ExerciseSummaryType } from "@/types/nutrition";
import styles from "./ExerciseSummary.module.css";

export interface ExerciseSummaryProps {
  data: ExerciseSummaryType | null;
  isLoading?: boolean;
}

export function ExerciseSummary({ data, isLoading }: ExerciseSummaryProps) {
  if (isLoading) {
    return (
      <section className={styles.section}>
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className={styles.loadingGrid}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.loadingItem}>
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!data || data.exercisesCompleted === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.heading}>Today's Exercise</h2>
        <Card>
          <CardContent className={styles.emptyCardContent}>
            <EmptyState
              icon={Dumbbell}
              title="No exercises logged today"
              description="Start your fitness journey by logging your first workout"
              action={{
                label: "Log Exercise",
                onClick: () => console.log("Log exercise clicked"),
              }}
            />
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Today's Exercise</h2>
      <Card>
        <CardHeader>
          <CardTitle className={styles.title}>Workout Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.grid}>
            {/* Total Time */}
            <div className={styles.statItem}>
              <div className={styles.iconContainer}>
                <Clock className={styles.icon} />
              </div>
              <div className={styles.value}>{data.totalMinutes}</div>
              <div className={styles.label}>minutes</div>
            </div>

            {/* Calories Burned */}
            <div className={styles.statItem}>
              <div className={styles.iconContainerDestructive}>
                <Flame className={styles.iconDestructive} />
              </div>
              <div className={styles.value}>{data.caloriesBurned}</div>
              <div className={styles.label}>
                calories burned
              </div>
            </div>

            {/* Exercises Completed */}
            <div className={styles.statItem}>
              <div className={styles.iconContainerPrimary}>
                <Activity className={styles.iconPrimary} />
              </div>
              <div className={styles.value}>
                {data.exercisesCompleted}
              </div>
              <div className={styles.label}>
                {data.exercisesCompleted === 1 ? "exercise" : "exercises"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
