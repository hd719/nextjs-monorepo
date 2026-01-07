// Streak tracking types

export interface UserStreaks {
  currentLogging: number;
  currentCalorie: number;
  currentExercise: number;
  bestLogging: number;
  bestCalorie: number;
  bestExercise: number;
  lastLoggingDate: string | null;
  lastExerciseDate: string | null;
}

export interface StreakUpdate {
  userId: string;
  type: "logging" | "calorie" | "exercise";
  date: string;
}
