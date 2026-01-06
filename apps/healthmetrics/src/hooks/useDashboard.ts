import { useQuery } from "@tanstack/react-query";
import {
  getDashboardMeals,
  getRecentActivity,
  getWaterIntake,
} from "@/server/dashboard";
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
