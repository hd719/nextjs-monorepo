import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLatestWeight, saveWeightEntry } from "@/server/weight";
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
    },
  });
}
