export type OnboardingGoalType =
  | "lose_weight"
  | "build_muscle"
  | "maintain_weight"
  | "improve_fitness"
  | "eat_healthier";

export type Gender = "male" | "female" | "other";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active";

export type UnitsPreference = "imperial" | "metric";

// Onboarding step data for each step
export interface OnboardingStepData {
  // Step 1: Goal
  goalType?: OnboardingGoalType;

  // Step 2: Measurements
  heightCm?: number;
  currentWeightLbs?: number;
  dateOfBirth?: string; // ISO date string
  gender?: Gender;
  activityLevel?: ActivityLevel;

  // Step 3: Calculated goals (user can adjust)
  dailyCalorieGoal?: number;
  dailyProteinGoalG?: number;
  dailyCarbGoalG?: number;
  dailyFatGoalG?: number;
  targetWeightLbs?: number;

  // Step 4: Preferences
  unitsPreference?: UnitsPreference;
  dailyWaterGoal?: number;
  dailyStepGoal?: number;
  timezone?: string;
}

// Full onboarding state
export interface OnboardingState {
  currentStep: number;
  data: OnboardingStepData;
  completed: boolean;
  skippedAt: string | null; // ISO date string
}

// Nutrition calculation input
export interface NutritionCalculationInput {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goalType: OnboardingGoalType;
}

// Nutrition calculation result
export interface NutritionGoals {
  dailyCalorieGoal: number;
  dailyProteinGoalG: number;
  dailyCarbGoalG: number;
  dailyFatGoalG: number;
  bmr: number;
  tdee: number;
}

// Save step input
export interface SaveOnboardingStepInput {
  userId: string;
  step: number;
  data: OnboardingStepData;
}
