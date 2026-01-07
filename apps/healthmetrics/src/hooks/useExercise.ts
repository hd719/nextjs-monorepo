import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWorkoutSession,
  getTodayExerciseSummary,
  searchExercises,
} from "@/server/exercise";
import { queryKeys } from "@/utils/query-keys";
import type { CreateWorkoutSessionInput } from "@/utils/validation";
import type { ExerciseCategory } from "@/types/exercise";

// Type for the search result
type SearchResult = Awaited<ReturnType<typeof searchExercises>>;

/**
 * Hook to fetch today's exercise summary
 */
export function useExerciseSummary(userId?: string, date?: string) {
  const enabled = Boolean(userId && date);
  const queryKey = enabled
    ? queryKeys.exerciseSummary(userId!, date!)
    : queryKeys.exerciseSummaryBase();

  return useQuery({
    queryKey,
    queryFn: () =>
      getTodayExerciseSummary({ data: { userId: userId!, date: date! } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to create a new workout session
 */
export function useCreateWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkoutSessionInput) =>
      createWorkoutSession({ data }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.exerciseSummary(variables.userId, variables.date),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutDay(variables.userId, variables.date),
      });
    },
  });
}

/**
 * Hook for searching exercises with TanStack Query
 * Provides automatic request deduplication and cancellation
 * to prevent stale results from out-of-order responses
 */
export function useExerciseSearch(
  query: string,
  category: ExerciseCategory | undefined,
  enabled: boolean = true
) {
  const queryKey = enabled
    ? queryKeys.exerciseSearch(query, category)
    : queryKeys.exerciseSearchBase();

  return useQuery({
    queryKey,
    queryFn: () =>
      searchExercises({
        data: {
          query: query || undefined,
          category: category || undefined, // Convert empty string to undefined
          limit: 20,
        },
      }),
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData: SearchResult | undefined) => previousData,
  });
}
