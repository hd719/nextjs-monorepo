import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getActiveFast,
  getFastingProtocols,
  getFastingHistory,
  getFastingStats,
  getFastingCalendar,
  startFast,
  endFast,
  cancelFast,
  pauseFast,
  resumeFast,
  createCustomProtocol,
  deleteCustomProtocol,
} from "@/server";
import { queryKeys } from "@/utils/query-keys";

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch the active fast for a user
 * Polls frequently when a fast is active for real-time updates
 */
export function useActiveFast(userId?: string) {
  const enabled = Boolean(userId);

  return useQuery({
    queryKey: enabled ? queryKeys.activeFast(userId!) : queryKeys.fastingBase(),
    queryFn: () => getActiveFast({ data: { userId: userId! } }),
    enabled,
    // Refetch frequently when active to keep timer in sync
    refetchInterval: (query) => {
      const data = query.state.data;
      // Refetch every 30 seconds if there's an active fast
      return data && !data.isPaused ? 30000 : false;
    },
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Hook to fetch fasting protocols (preset + user custom)
 */
export function useFastingProtocols(userId?: string) {
  const enabled = Boolean(userId);

  return useQuery({
    queryKey: enabled
      ? queryKeys.fastingProtocols(userId!)
      : queryKeys.fastingBase(),
    queryFn: () => getFastingProtocols({ data: { userId: userId! } }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - protocols don't change often
  });
}

/**
 * Hook to fetch fasting history
 */
export function useFastingHistory(userId?: string, limit: number = 10) {
  const enabled = Boolean(userId);

  return useQuery({
    queryKey: enabled
      ? queryKeys.fastingHistory(userId!, limit)
      : queryKeys.fastingBase(),
    queryFn: () =>
      getFastingHistory({ data: { userId: userId!, limit, offset: 0 } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch fasting stats
 */
export function useFastingStats(userId?: string) {
  const enabled = Boolean(userId);

  return useQuery({
    queryKey: enabled
      ? queryKeys.fastingStats(userId!)
      : queryKeys.fastingBase(),
    queryFn: () => getFastingStats({ data: { userId: userId! } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch fasting calendar for a specific month
 */
export function useFastingCalendar(userId?: string, month?: string) {
  const enabled = Boolean(userId) && Boolean(month);

  return useQuery({
    queryKey: enabled
      ? queryKeys.fastingCalendar(userId!, month!)
      : queryKeys.fastingBase(),
    queryFn: () =>
      getFastingCalendar({ data: { userId: userId!, month: month! } }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to start a new fast
 */
export function useStartFast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; protocolId: string }) =>
      startFast({ data }),

    onSuccess: (_data, variables) => {
      // Invalidate active fast query to show the new fast
      queryClient.invalidateQueries({
        queryKey: queryKeys.activeFast(variables.userId),
      });
      // Invalidate stats as they might change
      queryClient.invalidateQueries({
        queryKey: queryKeys.fastingStats(variables.userId),
      });
    },
  });
}

/**
 * Hook to end the current fast
 */
export function useEndFast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; sessionId: string; notes?: string }) =>
      endFast({ data }),

    onSuccess: (_data, variables) => {
      // Invalidate all fasting queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.activeFast(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.fastingHistoryBase(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.fastingStats(variables.userId),
      });
    },
  });
}

/**
 * Hook to cancel the current fast
 */
export function useCancelFast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; sessionId: string }) =>
      cancelFast({ data }),

    onSuccess: (_data, variables) => {
      // Invalidate active fast query
      queryClient.invalidateQueries({
        queryKey: queryKeys.activeFast(variables.userId),
      });
      // Invalidate history
      queryClient.invalidateQueries({
        queryKey: queryKeys.fastingHistoryBase(),
      });
    },
  });
}

/**
 * Hook to pause the current fast
 */
export function usePauseFast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; sessionId: string }) =>
      pauseFast({ data }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.activeFast(variables.userId),
      });
    },
  });
}

/**
 * Hook to resume a paused fast
 */
export function useResumeFast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; sessionId: string }) =>
      resumeFast({ data }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.activeFast(variables.userId),
      });
    },
  });
}

/**
 * Hook to create a custom fasting protocol
 */
export function useCreateCustomProtocol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      name: string;
      fastingMinutes: number;
      eatingMinutes: number;
    }) => createCustomProtocol({ data }),

    onSuccess: (_data, variables) => {
      // Invalidate protocols list to show new protocol
      queryClient.invalidateQueries({
        queryKey: queryKeys.fastingProtocols(variables.userId),
      });
    },
  });
}

/**
 * Hook to delete a custom fasting protocol
 */
export function useDeleteCustomProtocol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; protocolId: string }) =>
      deleteCustomProtocol({ data }),

    onSuccess: (_data, variables) => {
      // Invalidate protocols list
      queryClient.invalidateQueries({
        queryKey: queryKeys.fastingProtocols(variables.userId),
      });
    },
  });
}
