import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDiaryEntry,
  createDiaryEntryFromScan,
  copyDiaryDay,
  getDailyTotals,
  getDiaryDay,
  searchFoodItems,
} from "@/server/diary";
import { queryKeys } from "@/utils/query-keys";
import type {
  CreateDiaryEntryInput,
  CreateDiaryEntryFromScanInput,
  SearchFoodItemsInput,
} from "@/utils/validation";

export function useDiaryDay(userId?: string, date?: string) {
  const enabled = Boolean(userId && date);
  const queryKey = enabled
    ? queryKeys.diaryDay(userId!, date!)
    : queryKeys.diaryDayBase();

  return useQuery({
    queryKey,
    queryFn: () => getDiaryDay({ data: { userId: userId!, date: date! } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 0,
  });
}

export function useDiaryTotals(userId?: string, date?: string) {
  const enabled = Boolean(userId && date);
  const queryKey = enabled
    ? queryKeys.diaryTotals(userId!, date!)
    : queryKeys.diaryTotalsBase();

  return useQuery({
    queryKey,
    queryFn: () => getDailyTotals({ data: { userId: userId!, date: date! } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 0,
  });
}

export function useFoodSearch(query: string, limit: number = 10) {
  const trimmedQuery = query.trim();
  const enabled = trimmedQuery.length > 0;
  const queryKey = enabled
    ? queryKeys.foodSearch(trimmedQuery)
    : queryKeys.foodSearchBase();

  return useQuery({
    queryKey,
    queryFn: () =>
      searchFoodItems({
        data: { query: trimmedQuery, limit } satisfies SearchFoodItemsInput,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiaryEntryInput) => createDiaryEntry({ data }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.diaryDay(variables.userId, variables.date),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.diaryTotals(variables.userId, variables.date),
      });
    },
  });
}

export function useCreateDiaryEntryFromScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiaryEntryFromScanInput) =>
      createDiaryEntryFromScan({ data }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.diaryDay(variables.userId, variables.date),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.diaryTotals(variables.userId, variables.date),
      });
    },
  });
}

/**
 * Hook to copy all meals from one day to another
 */
export function useCopyDiaryDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      sourceDate: string;
      targetDate: string;
    }) => copyDiaryDay({ data }),
    onSuccess: (_result, variables) => {
      // Invalidate the target date queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.diaryDay(variables.userId, variables.targetDate),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.diaryTotals(variables.userId, variables.targetDate),
      });
    },
  });
}
