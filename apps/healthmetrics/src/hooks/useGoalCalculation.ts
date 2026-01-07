import { useState, useCallback } from "react";
import type { OnboardingStepData, NutritionGoals } from "@/types/onboarding";
import { lbsToKg, calculateAge, calculateNutritionGoals } from "@/utils";

interface UseGoalCalculationResult {
  goals: NutritionGoals | null;
  isCalculating: boolean;
  error: Error | null;
  calculate: (data: OnboardingStepData) => void;
  reset: () => void;
}

/**
 * Check if all required fields are present for goal calculation
 */
function hasRequiredFields(data: OnboardingStepData): boolean {
  return Boolean(
    data.heightCm &&
    data.currentWeightLbs &&
    data.dateOfBirth &&
    data.gender &&
    data.activityLevel &&
    data.goalType
  );
}

/**
 * Hook for calculating nutrition goals from onboarding data
 * Returns { goals, isCalculating, error, calculate, reset }
 */
export function useGoalCalculation(): UseGoalCalculationResult {
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const calculate = useCallback((data: OnboardingStepData) => {
    // Skip if missing required fields
    if (!hasRequiredFields(data)) return;

    setIsCalculating(true);
    setError(null);

    // Use requestAnimationFrame to avoid blocking UI
    requestAnimationFrame(() => {
      try {
        const result = calculateNutritionGoals({
          heightCm: data.heightCm!,
          weightKg: lbsToKg(data.currentWeightLbs!),
          age: calculateAge(new Date(data.dateOfBirth!)),
          gender: data.gender!,
          activityLevel: data.activityLevel!,
          goalType: data.goalType!,
        });
        setGoals(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Calculation failed"));
        console.error("Failed to calculate goals:", err);
      } finally {
        setIsCalculating(false);
      }
    });
  }, []);

  const reset = useCallback(() => {
    setGoals(null);
    setError(null);
    setIsCalculating(false);
  }, []);

  return { goals, isCalculating, error, calculate, reset };
}
