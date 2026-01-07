import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWaterIntake, updateWaterIntake } from "@/server/water";
import { queryKeys } from "@/utils/query-keys";

/**
 * Hook to fetch water intake for a specific date
 */
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

/**
 * Hook to update water intake
 * Optimistically updates the cache for instant feedback
 */
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
