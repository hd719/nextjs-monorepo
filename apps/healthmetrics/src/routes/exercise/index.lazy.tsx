import type { ReactNode } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout";
import { ExerciseWizard } from "@/components/exercise";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Flame, Activity, Info } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useExerciseSummary } from "@/hooks/useExercise";
import { ROUTES } from "@/constants/routes";

export const Route = createLazyFileRoute("/exercise/")({
  component: ExercisePage,
});

interface SummaryStatCardProps {
  icon: ReactNode;
  iconVariant: "primary" | "destructive";
  value: ReactNode;
  label: ReactNode;
  children?: ReactNode;
}

function SummaryStatCard({
  icon,
  iconVariant,
  value,
  label,
  children,
}: SummaryStatCardProps) {
  const iconWrapperClass =
    iconVariant === "destructive"
      ? "exercise-stat-icon-wrapper exercise-stat-icon-wrapper-destructive"
      : "exercise-stat-icon-wrapper exercise-stat-icon-wrapper-primary";

  return (
    <Card variant="supporting">
      <CardContent className="exercise-stat-card-content">
        <div className={iconWrapperClass}>{icon}</div>
        <div className="exercise-stat-body">
          <div className="exercise-stat-value">{value}</div>
          <div className="exercise-stat-label">{label}</div>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function ExercisePage() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useProfile(user.id);

  // Use user's timezone for date calculations
  const timezone = profile?.timezone || "UTC";
  const currentDate = new Date().toLocaleDateString("en-CA", {
    timeZone: timezone,
  });
  const { data: summary } = useExerciseSummary(user.id, currentDate);

  return (
    <AppLayout>
      <div className="exercise-page-layout">
        {/* Page Header */}
        <div className="exercise-page-header animate-fade-slide-in">
          <div>
            <h1 className="exercise-page-header-title">Exercise Tracker</h1>
            <p className="exercise-page-header-subtitle">
              Log your workouts and track your fitness progress
            </p>
          </div>
        </div>

        {/* Today's Summary - Supporting stats */}
        {summary &&
          (summary.totalMinutes > 0 || summary.exercisesCompleted > 0) && (
            <div className="animate-fade-slide-in animate-stagger-1">
              <h2 className="exercise-summary-section-title">
                Today's Activity
              </h2>
              <div className="exercise-summary-grid">
                <SummaryStatCard
                  icon={<Activity className="exercise-stat-icon" />}
                  iconVariant="primary"
                  value={summary.exercisesCompleted}
                  label={
                    summary.exercisesCompleted === 1 ? "Exercise" : "Exercises"
                  }
                />
                <SummaryStatCard
                  icon={<Clock className="exercise-stat-icon" />}
                  iconVariant="primary"
                  value={summary.totalMinutes}
                  label="Minutes"
                />
                <SummaryStatCard
                  icon={<Flame className="exercise-stat-icon" />}
                  iconVariant="destructive"
                  value={
                    summary.caloriesBurned > 0 ? summary.caloriesBurned : "--"
                  }
                  label="Calories Burned"
                >
                  {summary.caloriesBurned === 0 && (
                    <Link
                      to={ROUTES.PROFILE}
                      className="exercise-stat-hint-link"
                    >
                      <Info className="exercise-stat-hint-icon" />
                      Add weight to see calories
                    </Link>
                  )}
                </SummaryStatCard>
              </div>
            </div>
          )}

        {/* Exercise Wizard - Hero section */}
        <div className="animate-fade-slide-in animate-stagger-2">
          <h2 className="exercise-wizard-section-title">Log New Workout</h2>
          <ExerciseWizard userId={user.id} date={currentDate} />
        </div>
      </div>
    </AppLayout>
  );
}
