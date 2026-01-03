import { Dumbbell, Clock, Flame, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExerciseSummary as ExerciseSummaryType } from "@/types/nutrition";

export interface ExerciseSummaryProps {
  data: ExerciseSummaryType | null;
  isLoading?: boolean;
}

export function ExerciseSummary({ data, isLoading }: ExerciseSummaryProps) {
  if (isLoading) {
    return (
      <section className="dashboard-exercise-section">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-exercise-loading-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="dashboard-exercise-loading-item">
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
      <section className="dashboard-exercise-section">
        <h2 className="dashboard-exercise-heading">Today's Exercise</h2>
        <Card>
          <CardContent className="dashboard-exercise-empty-card-content">
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
    <section className="dashboard-exercise-section">
      <h2 className="dashboard-exercise-heading">Today's Exercise</h2>
      <Card>
        <CardHeader>
          <CardTitle className="dashboard-exercise-title">
            Workout Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="dashboard-exercise-grid">
            {/* Total Time */}
            <div className="dashboard-exercise-stat-item">
              <div className="dashboard-exercise-icon-container">
                <Clock className="dashboard-exercise-icon" />
              </div>
              <div className="dashboard-exercise-value">
                {data.totalMinutes}
              </div>
              <div className="dashboard-exercise-label">minutes</div>
            </div>

            {/* Calories Burned */}
            <div className="dashboard-exercise-stat-item">
              <div className="dashboard-exercise-icon-container-destructive">
                <Flame className="dashboard-exercise-icon-destructive" />
              </div>
              <div className="dashboard-exercise-value">
                {data.caloriesBurned}
              </div>
              <div className="dashboard-exercise-label">calories burned</div>
            </div>

            {/* Exercises Completed */}
            <div className="dashboard-exercise-stat-item">
              <div className="dashboard-exercise-icon-container-primary">
                <Activity className="dashboard-exercise-icon-primary" />
              </div>
              <div className="dashboard-exercise-value">
                {data.exercisesCompleted}
              </div>
              <div className="dashboard-exercise-label">
                {data.exercisesCompleted === 1 ? "exercise" : "exercises"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
