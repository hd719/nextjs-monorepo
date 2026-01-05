// Progress page type definitions

export interface ProgressWeightEntry {
  date: string;
  weight: number;
  note?: string;
}

export interface CalorieEntry {
  date: string;
  consumed: number;
  goal: number;
  burned: number;
}

export interface MacroData {
  current: number;
  goal: number;
}

export interface ProgressExerciseEntry {
  date: string;
  type: "cardio" | "strength" | "flexibility" | "sports";
  duration: number; // minutes
  calories: number;
  intensity: 0 | 1 | 2 | 3; // 0=none, 1=light, 2=moderate, 3=intense
}

export interface Streak {
  current: number;
  best: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  earnedAt: string;
}

export interface Milestone {
  title: string;
  progress: number;
  target: number;
}

export interface Insight {
  type: "positive" | "warning" | "opportunity";
  icon: string;
  title: string;
  message: string;
}

export interface WeekComparisonData {
  avgCalories: number;
  totalCalories: number;
  avgProtein: number;
  proteinGoalPercent: number;
  workouts: number;
  exerciseDuration: number;
  exerciseCalories: number;
  weightChange: number;
}

export interface SleepData {
  avgHours: number;
  goalHours: number;
  quality: number; // 0-100 score
  weeklyData: { day: string; hours: number }[];
}

export interface ProgressData {
  summary: {
    weightChange: number;
    avgDailyCalories: number;
    goalAdherencePercent: number;
    currentStreak: number;
    periodDays: number;
  };
  weightHistory: ProgressWeightEntry[];
  weightGoal: number;
  startWeight: number;
  calorieHistory: CalorieEntry[];
  macroAverages: {
    protein: MacroData;
    carbs: MacroData;
    fat: MacroData;
  };
  sleepData: SleepData;
  exerciseHistory: ProgressExerciseEntry[];
  exerciseSummary: {
    workoutsThisMonth: number;
    hoursThisMonth: number;
    caloriesBurnedThisWeek: number;
  };
  comparison: {
    thisWeek: WeekComparisonData;
    lastWeek: WeekComparisonData;
  };
  streaks: {
    logging: Streak;
    water: Streak;
    exercise: Streak;
  };
  achievements: Achievement[];
  milestones: Milestone[];
  insights: Insight[];
}

export type DateRange = "7d" | "30d" | "90d" | "180d" | "365d" | "all";

export interface DateRangeOption {
  value: DateRange;
  label: string;
}

// Alias for backward compatibility with chart components
export type WeightEntry = ProgressWeightEntry;
export type ExerciseEntry = ProgressExerciseEntry;
