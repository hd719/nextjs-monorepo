import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { ModeSelector } from "./ModeSelector";
import { ExerciseSearch } from "./ExerciseSearch";
import { ExerciseDetailsForm } from "./ExerciseDetailsForm";
import { WorkoutReview } from "./WorkoutReview";

// Types for wizard state
export type WorkoutMode = "quick" | "full";

export type SelectedExercise = {
  id: string;
  name: string;
  category: "cardio" | "strength" | "flexibility" | "sports" | "other";
  metValue: number;
};

export type ExerciseDetails = {
  exerciseId: string;
  category: "cardio" | "strength" | "flexibility" | "sports" | "other";
  // Cardio fields
  durationMinutes?: number;
  distanceKm?: number;
  // Strength fields
  sets?: number;
  reps?: number;
  weightLbs?: number;
  // Common
  notes?: string;
};

type WizardStep = "mode" | "search" | "details" | "review";
const STEP_ORDER: WizardStep[] = ["mode", "search", "details", "review"];
const STEP_LABELS: Record<WizardStep, string> = {
  mode: "Mode",
  search: "Select",
  details: "Details",
  review: "Review",
};

interface ExerciseWizardProps {
  userId: string;
  date: string;
  onComplete?: () => void;
}

export function ExerciseWizard({
  userId,
  date,
  onComplete,
}: ExerciseWizardProps) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>("mode");
  const [workoutMode, setWorkoutMode] = useState<WorkoutMode>("full");
  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExercise[]
  >([]);
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetails[]>([]);
  const [sessionNotes, setSessionNotes] = useState<string>("");

  // Navigation handlers
  const handleModeSelect = (mode: WorkoutMode) => {
    setWorkoutMode(mode);
    setCurrentStep("search");
  };

  const handleExercisesSelected = (exercises: SelectedExercise[]) => {
    setSelectedExercises(exercises);
    // Initialize details array
    setExerciseDetails(
      exercises.map((ex) => ({
        exerciseId: ex.id,
        category: ex.category,
      }))
    );
    setCurrentStep("details");
  };

  const handleDetailsComplete = (details: ExerciseDetails[]) => {
    setExerciseDetails(details);
    setCurrentStep("review");
  };

  const handleBack = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  };

  const handleReset = () => {
    setCurrentStep("mode");
    setWorkoutMode("full");
    setSelectedExercises([]);
    setExerciseDetails([]);
    setSessionNotes("");
  };

  // Step indicator
  const steps = STEP_ORDER.map((step, index) => ({
    id: step,
    label: STEP_LABELS[step],
    number: index + 1,
  }));

  const currentStepNumber = STEP_ORDER.indexOf(currentStep) + 1;

  return (
    <div className="exercise-wizard">
      {/* Step Indicator */}
      <div className="exercise-wizard-steps">
        {steps.map((step, index) => (
          <div key={step.id} className="exercise-wizard-step">
            <div
              className={cn(
                "exercise-wizard-step-circle",
                currentStepNumber > step.number
                  ? "exercise-wizard-step-circle-complete"
                  : currentStepNumber === step.number
                    ? "exercise-wizard-step-circle-current"
                    : "exercise-wizard-step-circle-upcoming"
              )}
            >
              {step.number}
            </div>
            <span
              className={cn(
                "exercise-wizard-step-label",
                currentStepNumber >= step.number
                  ? "exercise-wizard-step-label-active"
                  : "exercise-wizard-step-label-inactive"
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight className="exercise-wizard-step-divider" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card variant="hero" className="exercise-wizard-card">
        <CardHeader>
          <CardTitle>
            {currentStep === "mode" && "Choose Workout Type"}
            {currentStep === "search" && "Select Exercises"}
            {currentStep === "details" && "Exercise Details"}
            {currentStep === "review" && "Review & Submit"}
          </CardTitle>
        </CardHeader>
        <CardContent className="exercise-wizard-content">
          {currentStep === "mode" && (
            <ModeSelector onSelect={handleModeSelect} />
          )}

          {currentStep === "search" && (
            <ExerciseSearch
              mode={workoutMode}
              initialSelected={selectedExercises}
              onNext={handleExercisesSelected}
              onBack={handleBack}
            />
          )}

          {currentStep === "details" && (
            <ExerciseDetailsForm
              exercises={selectedExercises}
              initialDetails={exerciseDetails}
              onNext={handleDetailsComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === "review" && (
            <WorkoutReview
              userId={userId}
              date={date}
              mode={workoutMode}
              exercises={selectedExercises}
              details={exerciseDetails}
              sessionNotes={sessionNotes}
              onSessionNotesChange={setSessionNotes}
              onBack={handleBack}
              onComplete={() => {
                handleReset();
                onComplete?.();
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
