import { Dumbbell, Clock, Flame, Activity, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, Link } from "@tanstack/react-router";
import type { ExerciseSummary as ExerciseSummaryType } from "@/types";
import { ROUTES } from "@/constants/routes";

export interface ExerciseSummaryProps {
  data: ExerciseSummaryType | null;
  isLoading?: boolean;
}

export function ExerciseSummary({ data, isLoading }: ExerciseSummaryProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="dashboard-exercise-section">
        <Skeleton className="skeleton-xl" />
        <Card variant="supporting">
          <CardHeader>
            <Skeleton className="skeleton-lg" />
          </CardHeader>
          <CardContent>
            {/* Loading skeletons for the number of exercise summary stats we display */}
            <div className="dashboard-exercise-loading-grid">
              {["totalMinutes", "caloriesBurned", "exercisesCompleted"].map(
                (stat) => (
                  <div key={stat} className="dashboard-exercise-loading-item">
                    <Skeleton className="skeleton-icon-lg" />
                    <Skeleton className="skeleton-value-sm" />
                    <Skeleton className="skeleton-label" />
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!data || data.exercisesCompleted === 0) {
    return (
      <section className="dashboard-exercise-section">
        <h2 className="dashboard-exercise-heading">Today&apos;s Exercise</h2>
        <EmptyState
          icon={Dumbbell}
          title="No exercises logged today"
          description="Start your fitness journey by logging your first workout"
          action={{
            label: "Log Exercise",
            onClick: () => navigate({ to: ROUTES.EXERCISE }),
          }}
          clickable
        />
      </section>
    );
  }

  return (
    <section className="dashboard-exercise-section">
      <h2 className="dashboard-exercise-heading">Today&apos;s Exercise</h2>
      <Card variant="supporting" className="dashboard-card-stretch">
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
                {data.caloriesBurned > 0 ? data.caloriesBurned : "--"}
              </div>
              <div className="dashboard-exercise-label">calories burned</div>
              {data.caloriesBurned === 0 && (
                <Link
                  to={ROUTES.PROFILE}
                  className="dashboard-exercise-weight-link"
                >
                  <Info
                    className="dashboard-exercise-weight-link-icon"
                    aria-hidden="true"
                  />
                  Add weight to calculate
                </Link>
              )}
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

export type { ExerciseSummaryType };
