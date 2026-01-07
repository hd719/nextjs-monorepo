import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSleepEntry,
  saveSleepEntry,
  getSleepHistory,
  getSleepAverage,
} from "@/server/sleep";
import { queryKeys } from "@/utils/query-keys";
import type { SleepData } from "@/types/sleep";

/**
 * Hook to fetch sleep entry for a specific date
 */
export function useSleepEntry(userId?: string, date?: string) {
  const enabled = Boolean(userId && date);
  const queryKey = enabled
    ? queryKeys.sleepEntry(userId!, date!)
    : queryKeys.sleepBase();

  return useQuery({
    queryKey,
    queryFn: () => getSleepEntry({ data: { userId: userId!, date: date! } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch sleep history for charts
 */
export function useSleepHistory(userId?: string, days: number = 30) {
  const enabled = Boolean(userId);
  const queryKey = enabled
    ? queryKeys.sleepHistory(userId!, days)
    : queryKeys.sleepBase();

  return useQuery({
    queryKey,
    queryFn: () => getSleepHistory({ data: { userId: userId!, days } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes for historical data
  });
}

/**
 * Hook to fetch average sleep stats
 */
export function useSleepAverage(userId?: string, days: number = 7) {
  const enabled = Boolean(userId);
  const queryKey = enabled
    ? queryKeys.sleepAverage(userId!, days)
    : queryKeys.sleepBase();

  return useQuery({
    queryKey,
    queryFn: () => getSleepAverage({ data: { userId: userId!, days } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to save sleep entry
 * Optimistically updates the cache for instant feedback
 * All fields (quality, bedtime, wakeTime) are required
 */
export function useSaveSleepEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      date: string;
      hoursSlept: number;
      quality: number; // 1-5 rating (required)
      bedtime: string; // HH:MM format (required)
      wakeTime: string; // HH:MM format (required)
      notes?: string;
    }) => saveSleepEntry({ data }),

    // Optimistic update for instant UI feedback
    onMutate: async (newData) => {
      const queryKey = queryKeys.sleepEntry(newData.userId, newData.date);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<SleepData>(queryKey);

      // Optimistically update cache
      queryClient.setQueryData<SleepData>(queryKey, {
        hoursSlept: newData.hoursSlept,
        quality: newData.quality,
        bedtime: newData.bedtime,
        wakeTime: newData.wakeTime,
        date: newData.date,
        hasEntry: true,
      });

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
      // Invalidate the specific entry
      queryClient.invalidateQueries({
        queryKey: queryKeys.sleepEntry(variables.userId, variables.date),
      });
      // Also invalidate history and average caches
      queryClient.invalidateQueries({
        queryKey: queryKeys.sleepHistoryBase(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.sleepAverageBase(),
      });
    },
  });
}
