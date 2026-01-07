import type {
  OnboardingGoalType,
  ActivityLevel,
  Gender,
} from "@/types/onboarding";
import {
  Target,
  Dumbbell,
  Scale,
  Activity,
  Salad,
  type LucideIcon,
} from "lucide-react";

// Total number of onboarding steps (including completion)
export const ONBOARDING_TOTAL_STEPS = 5;

// Number of content steps (excludes completion step)
// Used for progress indicator display
export const ONBOARDING_CONTENT_STEPS = 4;

// Goal options with display info
export const GOAL_OPTIONS: Array<{
  value: OnboardingGoalType;
  label: string;
  icon: LucideIcon;
  description: string;
}> = [
  {
    value: "lose_weight",
    label: "Lose Weight",
    icon: Target,
    description: "Reduce body fat and reach a healthier weight",
  },
  {
    value: "build_muscle",
    label: "Build Muscle",
    icon: Dumbbell,
    description: "Gain strength and muscle mass",
  },
  {
    value: "maintain_weight",
    label: "Maintain Weight",
    icon: Scale,
    description: "Keep your current weight stable",
  },
  {
    value: "improve_fitness",
    label: "Improve Fitness",
    icon: Activity,
    description: "Boost endurance and overall fitness",
  },
  {
    value: "eat_healthier",
    label: "Eat Healthier",
    icon: Salad,
    description: "Focus on better nutrition and food choices",
  },
];

// Activity level options
export const ACTIVITY_LEVEL_OPTIONS: Array<{
  value: ActivityLevel;
  label: string;
  description: string;
}> = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Desk job, little to no exercise",
  },
  {
    value: "lightly_active",
    label: "Lightly Active",
    description: "Light exercise 1-3 days/week",
  },
  {
    value: "moderately_active",
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week",
  },
  {
    value: "very_active",
    label: "Very Active",
    description: "Hard exercise 6-7 days/week",
  },
  {
    value: "extremely_active",
    label: "Athlete",
    description: "Very hard exercise, physical job, or 2x training",
  },
];

// Gender options
export const GENDER_OPTIONS: Array<{
  value: Gender;
  label: string;
}> = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Prefer not to say" },
];

// Activity multipliers for TDEE calculation (Mifflin-St Jeor)
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

// Calorie adjustments based on goal
export const GOAL_CALORIE_ADJUSTMENTS: Record<OnboardingGoalType, number> = {
  lose_weight: -500, // ~1 lb/week loss
  build_muscle: 300, // surplus for muscle gain
  maintain_weight: 0,
  improve_fitness: 100, // slight surplus for performance
  eat_healthier: 0, // focus on macros, not deficit
};

// Macro ratios based on goal (protein%, carbs%, fat%)
export const GOAL_MACRO_RATIOS: Record<
  OnboardingGoalType,
  { protein: number; carbs: number; fat: number }
> = {
  lose_weight: { protein: 0.4, carbs: 0.3, fat: 0.3 },
  build_muscle: { protein: 0.3, carbs: 0.45, fat: 0.25 },
  maintain_weight: { protein: 0.25, carbs: 0.5, fat: 0.25 },
  improve_fitness: { protein: 0.25, carbs: 0.55, fat: 0.2 },
  eat_healthier: { protein: 0.25, carbs: 0.5, fat: 0.25 },
};

// Default values
export const ONBOARDING_DEFAULTS = {
  dailyWaterGoal: 8,
  dailyStepGoal: 10000,
  unitsPreference: "imperial" as const,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
};

// Validation limits
export const ONBOARDING_LIMITS = {
  height: { minCm: 100, maxCm: 250, minFt: 3, maxFt: 8 },
  weight: { minLbs: 50, maxLbs: 600, minKg: 25, maxKg: 275 },
  age: { min: 13, max: 120 },
  calories: { min: 1000, max: 5000 },
  waterGoal: { min: 1, max: 20 },
  stepGoal: { min: 1000, max: 50000 },
};
