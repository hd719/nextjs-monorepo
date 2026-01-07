import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardMeals, getRecentActivity } from "@/server/dashboard";
import { getWaterIntake, updateWaterIntake } from "@/server/water";
import { getStepCount, addSteps } from "@/server/steps";
import { queryKeys } from "@/utils/query-keys";

export function useDashboardMeals(userId?: string, date?: string) {
  const enabled = Boolean(userId && date);
  const queryKey = enabled
    ? queryKeys.dashboardMeals(userId!, date!)
    : queryKeys.dashboardMealsBase();

  return useQuery({
    queryKey,
    queryFn: () =>
      getDashboardMeals({ data: { userId: userId!, date: date! } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });
}

export function useRecentActivity(userId?: string, limit: number = 10) {
  const enabled = Boolean(userId);
  const queryKey = enabled
    ? queryKeys.recentActivity(userId!, limit)
    : queryKeys.recentActivityBase(limit);

  return useQuery({
    queryKey,
    queryFn: () => getRecentActivity({ data: { userId: userId!, limit } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });
}

export function useWaterIntake(userId?: string, date?: string) {
  const enabled = Boolean(userId && date);
  const queryKey = enabled
    ? queryKeys.waterIntake(userId!, date!)
    : queryKeys.waterIntakeBase();

  return useQuery({
    queryKey,
    queryFn: () => getWaterIntake({ data: { userId: userId!, date: date! } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });
}

export function useUpdateWaterIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; date: string; glasses: number }) =>
      updateWaterIntake({ data }),
    // Optimistic update for instant UI feedback
    onMutate: async ({ userId, date, glasses }) => {
      const queryKey = queryKeys.waterIntake(userId, date);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update cache
      queryClient.setQueryData(
        queryKey,
        (old: { goal: number } | undefined) => ({
          current: glasses,
          goal: old?.goal ?? 8,
          date,
        })
      );

      return { previousData, queryKey };
    },
    // Rollback on error
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    // Refetch after success to ensure consistency
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.waterIntake(variables.userId, variables.date),
      });
    },
  });
}

// ============================================================================
// STEP COUNT HOOKS
// ============================================================================

export function useStepCount(userId?: string, date?: string) {
  const enabled = Boolean(userId && date);
  const queryKey = enabled
    ? queryKeys.stepCount(userId!, date!)
    : queryKeys.stepCountBase();

  return useQuery({
    queryKey,
    queryFn: () => getStepCount({ data: { userId: userId!, date: date! } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to add steps to current count
 * Optimistically updates the cache for instant feedback
 */
export function useAddSteps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; date: string; stepsToAdd: number }) =>
      addSteps({ data }),
    // Optimistic update for instant UI feedback
    onMutate: async ({ userId, date, stepsToAdd }) => {
      const queryKey = queryKeys.stepCount(userId, date);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update cache
      queryClient.setQueryData(
        queryKey,
        (old: { current: number; goal: number } | undefined) => ({
          current: (old?.current ?? 0) + stepsToAdd,
          goal: old?.goal ?? 10000,
          date,
        })
      );

      return { previousData, queryKey };
    },
    // Rollback on error
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    // Refetch after success to ensure consistency
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.stepCount(variables.userId, variables.date),
      });
    },
  });
}
