import { Zap, Dumbbell } from "lucide-react";
import type { WorkoutMode } from "./ExerciseWizard";

interface ModeSelectorProps {
  onSelect: (mode: WorkoutMode) => void;
}

const MODES = [
  {
    mode: "quick" as WorkoutMode,
    title: "Quick Log",
    description:
      "Log a single exercise quickly. Perfect for a quick run, walk, or single workout.",
    icon: Zap,
  },
  {
    mode: "full" as WorkoutMode,
    title: "Full Workout",
    description:
      "Build a complete workout with multiple exercises. Track sets, reps, and more.",
    icon: Dumbbell,
  },
] as const;

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="exercise-mode-grid">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.mode}
            onClick={() => onSelect(mode.mode)}
            className="group exercise-mode-button focus-ring"
          >
            <div className="exercise-mode-icon-container">
              <Icon className="exercise-mode-icon" aria-hidden="true" />
            </div>
            <h3 className="exercise-mode-title">{mode.title}</h3>
            <p className="exercise-mode-description">{mode.description}</p>
          </button>
        );
      })}
    </div>
  );
}
