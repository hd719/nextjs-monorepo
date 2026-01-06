import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Check, Flame } from "lucide-react";
import { cn } from "@/utils/cn";

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    category: string;
    muscleGroups: string[];
    metValue: number;
    description?: string | null;
    difficulty?: string | null;
  };
  isSelected?: boolean;
  onToggle?: (exerciseId: string) => void;
}

export function ExerciseCard({
  exercise,
  isSelected = false,
  onToggle,
}: ExerciseCardProps) {
  const categoryClasses: Record<string, string> = {
    cardio: "exercise-badge-category-cardio",
    strength: "exercise-badge-category-strength",
    flexibility: "exercise-badge-category-flexibility",
    sports: "exercise-badge-category-sports",
    other: "exercise-badge-category-other",
  };

  const difficultyClasses: Record<string, string> = {
    beginner: "exercise-badge-difficulty-beginner",
    intermediate: "exercise-badge-difficulty-intermediate",
    advanced: "exercise-badge-difficulty-advanced",
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && onToggle) {
      e.preventDefault();
      onToggle(exercise.id);
    }
  };

  return (
    <Card
      className={cn(
        "exercise-card focusable-card",
        isSelected ? "exercise-card-selected" : "exercise-card-unselected"
      )}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${exercise.name} - ${exercise.category}${isSelected ? " (selected)" : ""}`}
      onKeyDown={handleKeyDown}
      onClick={() => onToggle?.(exercise.id)}
    >
      <CardContent className="exercise-card-content">
        <div className="exercise-card-layout">
          <div className="exercise-card-body">
            <div className="exercise-card-title-row">
              <h3 className="exercise-card-title">{exercise.name}</h3>
              {isSelected && (
                <Check
                  className="exercise-card-selected-icon"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="exercise-card-badges">
              <Badge
                className={
                  categoryClasses[exercise.category] || categoryClasses.other
                }
              >
                {exercise.category}
              </Badge>
              {exercise.difficulty && (
                <Badge
                  className={
                    difficultyClasses[exercise.difficulty] ||
                    difficultyClasses.beginner
                  }
                >
                  {exercise.difficulty}
                </Badge>
              )}
              <Badge variant="outline" className="exercise-badge-met">
                <Flame className="exercise-badge-met-icon" aria-hidden="true" />
                {exercise.metValue} MET
              </Badge>
            </div>

            {exercise.description && (
              <p className="exercise-card-description">
                {exercise.description}
              </p>
            )}

            {exercise.muscleGroups.length > 0 && (
              <div className="exercise-card-muscles">
                <span className="exercise-card-muscles-label">Targets:</span>{" "}
                {exercise.muscleGroups.join(", ")}
              </div>
            )}
          </div>

          {onToggle && (
            <Button
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(exercise.id);
              }}
              className="exercise-card-action focus-ring"
              aria-label={isSelected ? "Remove from workout" : "Add to workout"}
              tabIndex={-1}
            >
              {isSelected ? (
                <>
                  <Check
                    className="exercise-card-action-icon"
                    aria-hidden="true"
                  />
                  Added
                </>
              ) : (
                <>
                  <Plus
                    className="exercise-card-action-icon"
                    aria-hidden="true"
                  />
                  Add
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
