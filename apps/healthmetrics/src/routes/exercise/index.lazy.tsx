import type { ReactNode } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout";
import { ExerciseWizard } from "@/components/exercise";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Flame, Activity, Info } from "lucide-react";
import { useProfile, useExerciseSummary, useExerciseActivity } from "@/hooks";
import { formatDateKey, formatDuration, resolveTimezone } from "@/utils/time-helpers";
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

  const timezone = resolveTimezone(profile?.timezone);
  const currentDate = formatDateKey(new Date(), timezone);
  const { data: summary } = useExerciseSummary(user.id, currentDate);
  const { data: activity } = useExerciseActivity(user.id, currentDate);
  const activityItems = activity?.items ?? [];

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    });

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
                Today&apos;s Activity
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

        <div className="animate-fade-slide-in animate-stagger-2">
          <h2 className="exercise-wizard-section-title">Today&apos;s Workouts</h2>
          <Card variant="supporting" className="exercise-activity-card">
            <CardContent className="exercise-activity-content">
              {activityItems.length === 0 ? (
                <div className="exercise-activity-empty">
                  <p className="exercise-activity-empty-title">
                    No workouts logged yet
                  </p>
                  <p className="exercise-activity-empty-subtitle">
                    Log a workout below or connect WHOOP to import workouts.
                  </p>
                </div>
              ) : (
                <div className="exercise-activity-list">
                  {activityItems.map((item) => (
                    <div key={item.id} className="exercise-activity-item">
                      <div className="exercise-activity-main">
                        <div className="exercise-activity-title-row">
                          <span className="exercise-activity-title">
                            {item.title}
                          </span>
                          <span
                            className={
                              item.source === "whoop"
                                ? "exercise-activity-badge exercise-activity-badge-whoop"
                                : "exercise-activity-badge exercise-activity-badge-manual"
                            }
                          >
                            {item.source === "whoop" ? "WHOOP" : "Manual"}
                          </span>
                        </div>
                        <span className="exercise-activity-subtitle">
                          {item.subtitle}
                        </span>
                      </div>
                      <div className="exercise-activity-meta">
                        <span className="exercise-activity-time">
                          {formatTime(item.startAt)}
                        </span>
                        {item.durationMinutes !== null && (
                          <span className="exercise-activity-stat">
                            {formatDuration(item.durationMinutes)}
                          </span>
                        )}
                        {item.caloriesBurned !== null && (
                          <span className="exercise-activity-stat">
                            {item.caloriesBurned} cal
                          </span>
                        )}
                        {item.strain !== null && (
                          <span className="exercise-activity-stat">
                            Strain {item.strain.toFixed(1)}
                          </span>
                        )}
                        {item.readOnly && (
                          <span className="exercise-activity-readonly">
                            Read-only
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exercise Wizard - Hero section */}
        <div className="animate-fade-slide-in animate-stagger-3">
          <h2 className="exercise-wizard-section-title">Log New Workout</h2>
          <ExerciseWizard userId={user.id} date={currentDate} />
        </div>
      </div>
    </AppLayout>
  );
}
