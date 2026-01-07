import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLatestWeight,
  saveWeightEntry,
  getWeightTrend,
} from "@/server/weight";
import { queryKeys } from "@/utils/query-keys";

/**
 * Hook to fetch the user's latest weight entry
 */
export function useLatestWeight(userId?: string) {
  const enabled = Boolean(userId);
  const queryKey = enabled
    ? queryKeys.weightLatest(userId!)
    : queryKeys.weightBase();

  return useQuery({
    queryKey,
    queryFn: () => getLatestWeight({ data: { userId: userId! } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to save a weight entry (creates or updates)
 */
export function useSaveWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      weightLbs: number;
      date?: string;
      notes?: string;
    }) => saveWeightEntry({ data }),
    onSuccess: (_result, variables) => {
      // Invalidate weight queries to refetch latest data
      queryClient.invalidateQueries({
        queryKey: queryKeys.weightLatest(variables.userId),
      });
      // Also invalidate profile since it includes weight
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(variables.userId),
      });
      // Invalidate weight trend
      queryClient.invalidateQueries({
        queryKey: queryKeys.weightTrend(variables.userId),
      });
    },
  });
}

/**
 * Hook to fetch weight trend data for the last N days
 */
export function useWeightTrend(userId?: string, days: number = 7) {
  const enabled = Boolean(userId);
  const queryKey = enabled
    ? queryKeys.weightTrend(userId!, days)
    : queryKeys.weightBase();

  return useQuery({
    queryKey,
    queryFn: () => getWeightTrend({ data: { userId: userId!, days } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
