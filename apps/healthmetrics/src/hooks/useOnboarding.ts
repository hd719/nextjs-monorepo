import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOnboardingState,
  saveOnboardingStep,
  calculateGoalsFromProfile,
  completeOnboarding,
  skipOnboarding,
  resetOnboarding,
} from "@/server/onboarding";
import type { OnboardingStepData, NutritionGoals } from "@/types/onboarding";
import { queryKeys } from "@/utils/query-keys";

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to get current onboarding state
 */
export function useOnboardingState(userId?: string) {
  const enabled = Boolean(userId);

  return useQuery({
    queryKey: queryKeys.onboardingState(userId || ""),
    queryFn: () => getOnboardingState({ data: { userId: userId! } }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to save onboarding step data
 */
export function useSaveOnboardingStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      step: number;
      data: OnboardingStepData;
    }) => saveOnboardingStep({ data }),
    onSuccess: (_result, variables) => {
      // Invalidate onboarding state to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboardingState(variables.userId),
      });
      // Also invalidate profile since we may have updated it
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(variables.userId),
      });
    },
  });
}

/**
 * Hook to calculate nutrition goals from profile
 */
export function useCalculateGoals() {
  return useMutation({
    mutationFn: (data: { userId: string }) =>
      calculateGoalsFromProfile({ data }),
  });
}

/**
 * Hook to complete onboarding
 */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string }) => completeOnboarding({ data }),
    onSuccess: (_result, variables) => {
      // Invalidate onboarding state
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboardingState(variables.userId),
      });
      // Invalidate profile
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(variables.userId),
      });
    },
  });
}

/**
 * Hook to skip onboarding
 */
export function useSkipOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string }) => skipOnboarding({ data }),
    onSuccess: (_result, variables) => {
      // Invalidate onboarding state
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboardingState(variables.userId),
      });
    },
  });
}

/**
 * Hook to reset onboarding (DEV ONLY)
 * Clears onboarding state so user can test the flow again
 */
export function useResetOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string }) => resetOnboarding({ data }),
    onSuccess: (_result, variables) => {
      // Invalidate onboarding state
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboardingState(variables.userId),
      });
    },
  });
}

// ============================================================================
// COMBINED HOOK FOR WIZARD
// ============================================================================

/**
 * Combined hook for onboarding wizard
 * Provides all state and mutations needed
 */
export function useOnboardingWizard(userId: string) {
  const stateQuery = useOnboardingState(userId);
  const saveStepMutation = useSaveOnboardingStep();
  const calculateGoalsMutation = useCalculateGoals();
  const completeMutation = useCompleteOnboarding();
  const skipMutation = useSkipOnboarding();

  return {
    // State
    state: stateQuery.data,
    isLoading: stateQuery.isLoading,
    isError: stateQuery.isError,

    // Mutations
    saveStep: (step: number, data: OnboardingStepData) =>
      saveStepMutation.mutateAsync({ userId, step, data }),
    isSaving: saveStepMutation.isPending,

    calculateGoals: () => calculateGoalsMutation.mutateAsync({ userId }),
    isCalculating: calculateGoalsMutation.isPending,
    calculatedGoals: calculateGoalsMutation.data as NutritionGoals | null,

    complete: () => completeMutation.mutateAsync({ userId }),
    isCompleting: completeMutation.isPending,

    skip: () => skipMutation.mutateAsync({ userId }),
    isSkipping: skipMutation.isPending,
  };
}
