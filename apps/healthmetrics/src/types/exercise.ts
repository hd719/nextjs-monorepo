// Exercise domain type definitions

export type ExerciseCategory =
  | "cardio"
  | "strength"
  | "flexibility"
  | "sports"
  | "other";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  metValue: number;
  description: string | null;
}

export interface WorkoutLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  exercise: Exercise;
  durationMinutes: number | null;
  distanceKm: number | null;
  sets: number | null;
  reps: number | null;
  weightLbs: number | null;
  caloriesBurned: number | null;
  notes: string | null;
  createdAt: Date;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  date: Date;
  sessionType: "quick" | "full";
  notes: string | null;
  logs: WorkoutLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseSummaryData {
  totalMinutes: number;
  caloriesBurned: number;
  exercisesCompleted: number;
}

export interface ExerciseSearchResult {
  id: string;
  name: string;
  category: ExerciseCategory;
  metValue: number;
  description: string | null;
}
