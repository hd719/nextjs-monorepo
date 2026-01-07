import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStreaks,
  updateLoggingStreak,
  updateExerciseStreak,
} from "@/server/streaks";
import { queryKeys } from "@/utils/query-keys";

/**
 * Hook to fetch user's streak data
 */
export function useStreaks(userId?: string) {
  const enabled = Boolean(userId);
  const queryKey = enabled
    ? queryKeys.streaks(userId!)
    : queryKeys.streaksBase();

  return useQuery({
    queryKey,
    queryFn: () => getStreaks({ data: { userId: userId! } }),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to update logging streak
 * Called when user logs food
 */
export function useUpdateLoggingStreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; date: string }) =>
      updateLoggingStreak({ data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.streaks(variables.userId),
      });
    },
  });
}

/**
 * Hook to update exercise streak
 * Called when user logs workout
 */
export function useUpdateExerciseStreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; date: string }) =>
      updateExerciseStreak({ data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.streaks(variables.userId),
      });
    },
  });
}
