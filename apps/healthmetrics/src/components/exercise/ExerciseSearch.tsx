import { useState, useDeferredValue } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ExerciseCard } from "./ExerciseCard";
import { useExerciseSearch } from "@/hooks";
import type { WorkoutMode, SelectedExercise } from "./ExerciseWizard";
import type { ExerciseCategory } from "@/types";

// Type for exercise from search results
interface ExerciseResult {
  id: string;
  name: string;
  category: "cardio" | "strength" | "flexibility" | "sports" | "other";
  metValue: number;
  muscleGroups: string[];
  description: string | null;
  instructions: string[];
  equipment: string[];
  difficulty: string | null;
}

interface ExerciseSearchProps {
  mode: WorkoutMode;
  initialSelected: SelectedExercise[];
  onNext: (exercises: SelectedExercise[]) => void;
  onBack: () => void;
}

export function ExerciseSearch({
  mode,
  initialSelected,
  onNext,
  onBack,
}: ExerciseSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [selectedExercises, setSelectedExercises] =
    useState<SelectedExercise[]>(initialSelected);

  // Use deferred value for debouncing search queries
  const deferredQuery = useDeferredValue(searchQuery);
  const deferredCategory = useDeferredValue(category);

  const { data, isLoading, error, refetch } = useExerciseSearch(
    deferredQuery,
    deferredCategory as ExerciseCategory | undefined
  );

  // Get exercises from query result with proper typing
  const exercises: ExerciseResult[] = data?.exercises ?? [];

  const handleToggleExercise = (exerciseId: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    const isSelected = selectedExercises.some((ex) => ex.id === exerciseId);

    if (isSelected) {
      setSelectedExercises(
        selectedExercises.filter((ex) => ex.id !== exerciseId)
      );
    } else {
      // For quick mode, only allow one exercise
      if (mode === "quick") {
        setSelectedExercises([
          {
            id: exercise.id,
            name: exercise.name,
            category: exercise.category,
            metValue: exercise.metValue,
          },
        ]);
      } else {
        setSelectedExercises([
          ...selectedExercises,
          {
            id: exercise.id,
            name: exercise.name,
            category: exercise.category,
            metValue: exercise.metValue,
          },
        ]);
      }
    }
  };

  const handleNext = () => {
    if (selectedExercises.length === 0) {
      return;
    }
    onNext(selectedExercises);
  };

  return (
    <div className="exercise-search">
      {/* Search and Filters */}
      <div className="exercise-search-filters">
        <div>
          <Label htmlFor="search">Search Exercises</Label>
          <div className="exercise-search-input-wrapper">
            <Search className="exercise-search-input-icon" />
            <Input
              id="search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="exercise-search-input"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="exercise-search-select"
          >
            <option value="">All Categories</option>
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Selected Exercises Summary */}
      {selectedExercises.length > 0 && (
        <div className="exercise-search-selected">
          <div className="exercise-search-selected-header">
            <h3 className="exercise-search-selected-title">
              Selected {mode === "quick" ? "Exercise" : "Exercises"} (
              {selectedExercises.length})
            </h3>
            {mode === "quick" && (
              <span className="exercise-search-selected-note">
                Quick mode: 1 exercise only
              </span>
            )}
          </div>
          <div className="exercise-search-selected-list">
            {selectedExercises.map((ex) => (
              <div key={ex.id} className="exercise-search-selected-pill">
                {ex.name}
                <button
                  onClick={() => handleToggleExercise(ex.id)}
                  className="exercise-search-selected-remove"
                >
                  <X className="exercise-search-remove-icon" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div>
        <h3 className="exercise-search-results-title">
          {searchQuery || category ? "Search Results" : "All Exercises"}
        </h3>

        {isLoading ? (
          <div className="exercise-search-loading">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="exercise-search-skeleton" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Search}
            title="Error loading exercises"
            description="Failed to load exercises. Please try again."
            action={{
              label: "Try Again",
              onClick: () => refetch(),
            }}
          />
        ) : exercises.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No exercises found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <div className="exercise-search-results">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isSelected={selectedExercises.some(
                  (ex) => ex.id === exercise.id
                )}
                onToggle={handleToggleExercise}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="exercise-search-nav">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="exercise-search-nav-icon-left" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={selectedExercises.length === 0}>
          Next
          <ChevronRight className="exercise-search-nav-icon-right" />
        </Button>
      </div>
    </div>
  );
}
