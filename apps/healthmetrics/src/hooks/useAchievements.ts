import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAchievements,
  getUserAchievements,
  getAchievementSummary,
  unlockAchievement,
  checkAchievements,
} from "@/server/achievements";
import { queryKeys } from "@/utils/query-keys";

/**
 * Hook to fetch all achievement definitions
 */
export function useAchievementDefinitions(category?: string) {
  return useQuery({
    queryKey: queryKeys.achievementDefinitions(category),
    queryFn: () => getAchievements({ data: { category } }),
    staleTime: 10 * 60 * 1000, // 10 minutes (definitions rarely change)
  });
}

/**
 * Hook to fetch user's unlocked achievements
 */
export function useUserAchievements(userId?: string) {
  const enabled = Boolean(userId);
  const queryKey = enabled
    ? queryKeys.userAchievements(userId!)
    : queryKeys.achievementsBase();

  return useQuery({
    queryKey,
    queryFn: () => getUserAchievements({ data: { userId: userId! } }),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch achievement summary (points, counts, recent)
 */
export function useAchievementSummary(userId?: string) {
  const enabled = Boolean(userId);
  const queryKey = enabled
    ? queryKeys.achievementSummary(userId!)
    : queryKeys.achievementsBase();

  return useQuery({
    queryKey,
    queryFn: () => getAchievementSummary({ data: { userId: userId! } }),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to unlock a specific achievement
 */
export function useUnlockAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; achievementKey: string }) =>
      unlockAchievement({ data }),
    onSuccess: (_data, variables) => {
      // Invalidate all achievement-related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.userAchievements(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.achievementSummary(variables.userId),
      });
    },
  });
}

/**
 * Hook to check and unlock achievements based on stats
 */
export function useCheckAchievements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      stats: {
        totalMeals?: number;
        totalWorkouts?: number;
        loggingStreak?: number;
        exerciseStreak?: number;
        calorieStreak?: number;
        waterStreak?: number;
      };
    }) => checkAchievements({ data }),
    onSuccess: (_data, variables) => {
      // Invalidate all achievement-related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.userAchievements(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.achievementSummary(variables.userId),
      });
    },
  });
}
