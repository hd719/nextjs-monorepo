import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  Clock,
  Flame,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCreateWorkoutSession } from "@/hooks/useExercise";
import type {
  WorkoutMode,
  SelectedExercise,
  ExerciseDetails,
} from "./ExerciseWizard";

const ESTIMATED_REP_SECONDS = 3;
const ESTIMATED_REST_SECONDS = 60;

function getEstimatedDuration(detail: ExerciseDetails): number {
  if (detail.durationMinutes) {
    return detail.durationMinutes;
  }

  if (detail.sets && detail.reps) {
    const workTime = detail.sets * detail.reps * ESTIMATED_REP_SECONDS;
    const restTime = (detail.sets - 1) * ESTIMATED_REST_SECONDS;
    return Math.ceil((workTime + restTime) / 60);
  }

  return 0;
}

interface WorkoutReviewProps {
  userId: string;
  date: string;
  mode: WorkoutMode;
  exercises: SelectedExercise[];
  details: ExerciseDetails[];
  sessionNotes: string;
  onSessionNotesChange: (notes: string) => void;
  onBack: () => void;
  onComplete: () => void;
}

export function WorkoutReview({
  userId,
  date,
  mode,
  exercises,
  details,
  sessionNotes,
  onSessionNotesChange,
  onBack,
  onComplete,
}: WorkoutReviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const createWorkoutSessionMutation = useCreateWorkoutSession();

  // Calculate totals
  const totalMinutes = details.reduce(
    (sum, detail) => sum + getEstimatedDuration(detail),
    0
  );

  const handleSubmit = async () => {
    try {
      setError(null);

      await createWorkoutSessionMutation.mutateAsync({
        userId,
        date,
        sessionType: mode,
        notes: sessionNotes || undefined,
        exercises: details,
      });

      setSuccess(true);

      // Wait a moment to show success message, then complete
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      console.error("Failed to create workout session:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save workout. Please try again."
      );
    }
  };

  const isSubmitting = createWorkoutSessionMutation.isPending;

  if (success) {
    return (
      <div className="exercise-review-success">
        <div className="exercise-review-success-icon">
          <CheckCircle className="exercise-review-success-check" />
        </div>
        <h3 className="exercise-review-success-title">Workout Saved!</h3>
        <p className="exercise-review-success-text">
          Your workout has been logged successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="exercise-review">
      {/* Summary Stats */}
      <div className="exercise-review-stats">
        <Card>
          <CardContent className="exercise-review-stat-content">
            <div className="exercise-review-stat-icon exercise-review-stat-icon-primary">
              <Activity className="exercise-review-stat-icon-inner" />
            </div>
            <div>
              <div className="exercise-review-stat-value">
                {exercises.length}
              </div>
              <div className="exercise-review-stat-label">
                {exercises.length === 1 ? "Exercise" : "Exercises"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="exercise-review-stat-content">
            <div className="exercise-review-stat-icon exercise-review-stat-icon-primary">
              <Clock className="exercise-review-stat-icon-inner" />
            </div>
            <div>
              <div className="exercise-review-stat-value">{totalMinutes}</div>
              <div className="exercise-review-stat-label">Minutes</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="exercise-review-stat-content">
            <div className="exercise-review-stat-icon exercise-review-stat-icon-destructive">
              <Flame className="exercise-review-stat-icon-inner" />
            </div>
            <div>
              <div className="exercise-review-stat-value">~</div>
              <div className="exercise-review-stat-label">
                Calories (calculated on save)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing Weight Warning */}
      <Alert>
        <AlertCircle className="exercise-review-alert-icon" />
        <AlertDescription>
          Calorie estimates require your weight. If you haven't logged your
          weight, calories will show as "N/A".{" "}
          <Link
            to="/profile"
            className="exercise-review-link"
          >
            Add weight in your profile
          </Link>
        </AlertDescription>
      </Alert>

      {/* Exercise Details Review */}
      <div>
        <h3 className="exercise-review-details-title">Exercise Details</h3>
        <div className="exercise-review-details-list">
          {exercises.map((exercise, index) => {
            const detail = details[index];
            const duration = getEstimatedDuration(detail);

            return (
              <Card key={exercise.id}>
                <CardContent className="exercise-review-details-card">
                  <div className="exercise-review-details-header">
                    <div className="exercise-review-details-body">
                      <h4 className="exercise-review-details-name">
                        {exercise.name}
                      </h4>
                      <div className="exercise-review-details-meta">
                        {detail.durationMinutes && (
                          <span>Duration: {detail.durationMinutes} min</span>
                        )}
                        {detail.sets && detail.reps && (
                          <>
                            <span>
                              Sets: {detail.sets} × {detail.reps} reps
                            </span>
                            {!detail.durationMinutes && (
                              <span className="exercise-review-details-estimate">
                                (~{duration} min estimated)
                              </span>
                            )}
                          </>
                        )}
                        {detail.weightLbs && (
                          <span>Weight: {detail.weightLbs} lbs</span>
                        )}
                        {detail.distanceKm && (
                          <span>Distance: {detail.distanceKm} km</span>
                        )}
                      </div>
                      {detail.notes && (
                        <p className="exercise-review-details-note">
                          "{detail.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Session Notes */}
      <div>
        <Label htmlFor="session-notes">Workout Notes (Optional)</Label>
        <Input
          id="session-notes"
          placeholder="How did the workout feel? Any observations..."
          value={sessionNotes}
          onChange={(e) => onSessionNotesChange(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="exercise-review-alert-icon" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="exercise-review-nav">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ChevronLeft className="exercise-review-nav-icon-left" />
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Workout"}
        </Button>
      </div>
    </div>
  );
}
