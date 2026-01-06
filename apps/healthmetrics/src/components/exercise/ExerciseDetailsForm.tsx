import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SelectedExercise, ExerciseDetails } from "./ExerciseWizard";

interface ExerciseDetailsFormProps {
  exercises: SelectedExercise[];
  initialDetails: ExerciseDetails[];
  onNext: (details: ExerciseDetails[]) => void;
  onBack: () => void;
}

export function ExerciseDetailsForm({
  exercises,
  initialDetails,
  onNext,
  onBack,
}: ExerciseDetailsFormProps) {
  const [details, setDetails] = useState<ExerciseDetails[]>(initialDetails);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateDetail = (
    index: number,
    field: keyof ExerciseDetails,
    value: ExerciseDetails[keyof ExerciseDetails]
  ) => {
    setDetails((prevDetails) => {
      const nextDetails = [...prevDetails];
      nextDetails[index] = {
        ...nextDetails[index],
        [field]: value,
      };
      return nextDetails;
    });

    // Clear error for this field
    const errorKey = `${index}-${field}`;
    setErrors((prevErrors) => {
      if (!prevErrors[errorKey]) {
        return prevErrors;
      }
      const nextErrors = { ...prevErrors };
      delete nextErrors[errorKey];
      return nextErrors;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    details.forEach((detail, index) => {
      const exercise = exercises[index];

      // Cardio validation
      if (exercise.category === "cardio") {
        if (!detail.durationMinutes || detail.durationMinutes <= 0) {
          newErrors[`${index}-durationMinutes`] =
            "Duration is required for cardio exercises";
        }
      }

      // Strength validation
      if (exercise.category === "strength") {
        if (!detail.sets || detail.sets <= 0) {
          newErrors[`${index}-sets`] =
            "Sets are required for strength exercises";
        }
        if (!detail.reps || detail.reps <= 0) {
          newErrors[`${index}-reps`] =
            "Reps are required for strength exercises";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(details);
    }
  };

  return (
    <div className="exercise-details">
      <p className="exercise-details-description">
        Fill in the details for each exercise. Required fields are marked with
        *.
      </p>

      {/* Exercise Details Forms */}
      <div className="exercise-details-list">
        {exercises.map((exercise, index) => (
          <Card key={exercise.id}>
            <CardContent className="exercise-details-card-content">
              <h3 className="exercise-details-title">{exercise.name}</h3>

              <div className="exercise-details-fields">
                {/* Cardio Fields */}
                {exercise.category === "cardio" && (
                  <>
                    <div>
                      <Label htmlFor={`duration-${index}`}>
                        Duration (minutes) *
                      </Label>
                      <Input
                        id={`duration-${index}`}
                        type="number"
                        min="1"
                        placeholder="e.g., 30"
                        value={details[index]?.durationMinutes || ""}
                        onChange={(e) =>
                          updateDetail(
                            index,
                            "durationMinutes",
                            parseInt(e.target.value) || undefined
                          )
                        }
                        className={
                          errors[`${index}-durationMinutes`]
                            ? "exercise-input-error"
                            : ""
                        }
                      />
                      {errors[`${index}-durationMinutes`] && (
                        <p className="exercise-details-error">
                          {errors[`${index}-durationMinutes`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`distance-${index}`}>
                        Distance (km) - Optional
                      </Label>
                      <Input
                        id={`distance-${index}`}
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="e.g., 5.0"
                        value={details[index]?.distanceKm || ""}
                        onChange={(e) =>
                          updateDetail(
                            index,
                            "distanceKm",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                      />
                    </div>
                  </>
                )}

                {/* Strength Fields */}
                {exercise.category === "strength" && (
                  <>
                    <div className="exercise-details-strength-grid">
                      <div>
                        <Label htmlFor={`sets-${index}`}>Sets *</Label>
                        <Input
                          id={`sets-${index}`}
                          type="number"
                          min="1"
                          placeholder="e.g., 3"
                          value={details[index]?.sets || ""}
                          onChange={(e) =>
                            updateDetail(
                              index,
                              "sets",
                              parseInt(e.target.value) || undefined
                            )
                          }
                          className={
                            errors[`${index}-sets`]
                              ? "exercise-input-error"
                              : ""
                          }
                        />
                        {errors[`${index}-sets`] && (
                          <p className="exercise-details-error">
                            {errors[`${index}-sets`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`reps-${index}`}>Reps *</Label>
                        <Input
                          id={`reps-${index}`}
                          type="number"
                          min="1"
                          placeholder="e.g., 10"
                          value={details[index]?.reps || ""}
                          onChange={(e) =>
                            updateDetail(
                              index,
                              "reps",
                              parseInt(e.target.value) || undefined
                            )
                          }
                          className={
                            errors[`${index}-reps`]
                              ? "exercise-input-error"
                              : ""
                          }
                        />
                        {errors[`${index}-reps`] && (
                          <p className="exercise-details-error">
                            {errors[`${index}-reps`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`weight-${index}`}>
                          Weight (lbs) - Optional
                        </Label>
                        <Input
                          id={`weight-${index}`}
                          type="number"
                          min="0"
                          step="1"
                          placeholder="e.g., 110"
                          value={details[index]?.weightLbs || ""}
                          onChange={(e) =>
                            updateDetail(
                              index,
                              "weightLbs",
                              parseFloat(e.target.value) || undefined
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="exercise-details-help">
                      Duration will be auto-calculated: (sets × reps × 3 sec) +
                      rest periods
                    </div>
                  </>
                )}

                {/* Flexibility/Sports/Other Fields */}
                {(exercise.category === "flexibility" ||
                  exercise.category === "sports" ||
                  exercise.category === "other") && (
                  <div>
                    <Label htmlFor={`duration-${index}`}>
                      Duration (minutes) *
                    </Label>
                    <Input
                      id={`duration-${index}`}
                      type="number"
                      min="1"
                      placeholder="e.g., 30"
                      value={details[index]?.durationMinutes || ""}
                      onChange={(e) =>
                        updateDetail(
                          index,
                          "durationMinutes",
                          parseInt(e.target.value) || undefined
                        )
                      }
                      className={
                        errors[`${index}-durationMinutes`]
                          ? "exercise-input-error"
                          : ""
                      }
                    />
                    {errors[`${index}-durationMinutes`] && (
                      <p className="exercise-details-error">
                        {errors[`${index}-durationMinutes`]}
                      </p>
                    )}
                  </div>
                )}

                {/* Notes (common for all) */}
                <div>
                  <Label htmlFor={`notes-${index}`}>Notes - Optional</Label>
                  <Input
                    id={`notes-${index}`}
                    placeholder="Any additional notes..."
                    value={details[index]?.notes || ""}
                    onChange={(e) =>
                      updateDetail(index, "notes", e.target.value || undefined)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="exercise-details-nav">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="exercise-details-nav-icon-left" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
          <ChevronRight className="exercise-details-nav-icon-right" />
        </Button>
      </div>
    </div>
  );
}
