/**
 * Nutrition Calculator Utility
 * Uses Mifflin-St Jeor equation for BMR calculation
 * and activity multipliers for TDEE
 */

import type {
  NutritionCalculationInput,
  NutritionGoals,
} from "@/types/onboarding";
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_CALORIE_ADJUSTMENTS,
  GOAL_MACRO_RATIOS,
} from "@/constants/onboarding";

/**
 * Calculate BMR using Mifflin-St Jeor equation
 * Male:   BMR = 10×weight(kg) + 6.25×height(cm) − 5×age + 5
 * Female: BMR = 10×weight(kg) + 6.25×height(cm) − 5×age − 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female" | "other"
): number {
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;

  // Use average offset for "other" gender
  if (gender === "male") {
    return Math.round(baseBMR + 5);
  } else if (gender === "female") {
    return Math.round(baseBMR - 161);
  } else {
    // Average of male (+5) and female (-161) adjustments
    return Math.round(baseBMR - 78);
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: keyof typeof ACTIVITY_MULTIPLIERS
): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate daily calorie goal based on TDEE and goal type
 */
export function calculateCalorieGoal(
  tdee: number,
  goalType: keyof typeof GOAL_CALORIE_ADJUSTMENTS
): number {
  const adjustment = GOAL_CALORIE_ADJUSTMENTS[goalType];
  // Ensure minimum of 1200 calories for safety
  return Math.max(1200, Math.round(tdee + adjustment));
}

/**
 * Calculate macro goals in grams based on calorie goal
 * Uses 4 cal/g for protein and carbs, 9 cal/g for fat
 */
export function calculateMacros(
  calorieGoal: number,
  goalType: keyof typeof GOAL_MACRO_RATIOS
): { protein: number; carbs: number; fat: number } {
  const ratios = GOAL_MACRO_RATIOS[goalType];

  // Calculate calories per macro
  const proteinCals = calorieGoal * ratios.protein;
  const carbsCals = calorieGoal * ratios.carbs;
  const fatCals = calorieGoal * ratios.fat;

  // Convert to grams (protein/carbs = 4 cal/g, fat = 9 cal/g)
  return {
    protein: Math.round(proteinCals / 4),
    carbs: Math.round(carbsCals / 4),
    fat: Math.round(fatCals / 9),
  };
}

/**
 * Convert lbs to kg
 */
export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

/**
 * Convert kg to lbs
 */
export function kgToLbs(kg: number): number {
  return kg / 0.453592;
}

/**
 * Convert feet and inches to cm
 */
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54);
}

/**
 * Convert cm to feet and inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Full nutrition calculation - takes all inputs and returns complete goals
 */
export function calculateNutritionGoals(
  input: NutritionCalculationInput
): NutritionGoals {
  const { heightCm, weightKg, age, gender, activityLevel, goalType } = input;

  // Calculate BMR
  const bmr = calculateBMR(weightKg, heightCm, age, gender);

  // Calculate TDEE
  const tdee = calculateTDEE(bmr, activityLevel);

  // Calculate calorie goal
  const dailyCalorieGoal = calculateCalorieGoal(tdee, goalType);

  // Calculate macros
  const macros = calculateMacros(dailyCalorieGoal, goalType);

  return {
    dailyCalorieGoal,
    dailyProteinGoalG: macros.protein,
    dailyCarbGoalG: macros.carbs,
    dailyFatGoalG: macros.fat,
    bmr,
    tdee,
  };
}
