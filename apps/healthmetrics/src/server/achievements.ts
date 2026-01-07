import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import type {
  AchievementDefinition,
  UserAchievementData,
  AchievementSummary,
  AchievementCategory,
} from "@/types/achievements";
import { parseAchievementRequirement } from "@/types/achievements";

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all achievement definitions
 */
export const getAchievements = createServerFn({ method: "GET" })
  .inputValidator((data: { category?: string }) => data)
  .handler(async ({ data: { category } }): Promise<AchievementDefinition[]> => {
    try {
      const achievements = await prisma.achievement.findMany({
        where: category ? { category } : undefined,
        orderBy: [{ category: "asc" }, { points: "asc" }],
      });

      return achievements.map((a) => ({
        id: a.id,
        key: a.key,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category as AchievementCategory,
        requirement: parseAchievementRequirement(a.requirement),
        points: a.points,
      }));
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
      return [];
    }
  });

/**
 * Get user's unlocked achievements
 */
export const getUserAchievements = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<UserAchievementData[]> => {
    try {
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
      });

      return userAchievements.map((ua) => ({
        id: ua.id,
        achievementId: ua.achievementId,
        key: ua.achievement.key,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category as AchievementCategory,
        points: ua.achievement.points,
        unlockedAt: ua.unlockedAt.toISOString(),
      }));
    } catch (error) {
      console.error("Failed to fetch user achievements:", error);
      return [];
    }
  });

/**
 * Get achievement summary for user (total points, counts, recent)
 */
export const getAchievementSummary = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<AchievementSummary> => {
    try {
      const [userAchievements, totalAchievements] = await Promise.all([
        prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true },
          orderBy: { unlockedAt: "desc" },
        }),
        prisma.achievement.count(),
      ]);

      const totalPoints = userAchievements.reduce(
        (sum, ua) => sum + ua.achievement.points,
        0
      );

      const recentUnlocks = userAchievements.slice(0, 5).map((ua) => ({
        id: ua.id,
        achievementId: ua.achievementId,
        key: ua.achievement.key,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category as AchievementCategory,
        points: ua.achievement.points,
        unlockedAt: ua.unlockedAt.toISOString(),
      }));

      return {
        totalPoints,
        unlockedCount: userAchievements.length,
        totalCount: totalAchievements,
        recentUnlocks,
      };
    } catch (error) {
      console.error("Failed to fetch achievement summary:", error);
      return {
        totalPoints: 0,
        unlockedCount: 0,
        totalCount: 0,
        recentUnlocks: [],
      };
    }
  });

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Unlock an achievement for a user
 * Returns the unlocked achievement data or null if already unlocked
 */
export const unlockAchievement = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; achievementKey: string }) => data)
  .handler(
    async ({
      data: { userId, achievementKey },
    }): Promise<UserAchievementData | null> => {
      try {
        // Find the achievement by key
        const achievement = await prisma.achievement.findUnique({
          where: { key: achievementKey },
        });

        if (!achievement) {
          console.error(`Achievement not found: ${achievementKey}`);
          return null;
        }

        // Check if already unlocked
        const existing = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
        });

        if (existing) {
          // Already unlocked
          return null;
        }

        // Create the unlock
        const userAchievement = await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
          include: { achievement: true },
        });

        return {
          id: userAchievement.id,
          achievementId: userAchievement.achievementId,
          key: userAchievement.achievement.key,
          name: userAchievement.achievement.name,
          description: userAchievement.achievement.description,
          icon: userAchievement.achievement.icon,
          category: userAchievement.achievement.category as AchievementCategory,
          points: userAchievement.achievement.points,
          unlockedAt: userAchievement.unlockedAt.toISOString(),
        };
      } catch (error) {
        console.error("Failed to unlock achievement:", error);
        return null;
      }
    }
  );

/**
 * Check and unlock achievements based on user's current stats
 * This is called after various actions to check for newly earned achievements
 */
export const checkAchievements = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      userId: string;
      stats: {
        totalMeals?: number;
        totalWorkouts?: number;
        loggingStreak?: number;
        exerciseStreak?: number;
        calorieStreak?: number;
        waterStreak?: number;
      };
    }) => data
  )
  .handler(
    async ({ data: { userId, stats } }): Promise<UserAchievementData[]> => {
      try {
        // Get all achievements and user's unlocked ones
        const [achievements, userAchievements] = await Promise.all([
          prisma.achievement.findMany(),
          prisma.userAchievement.findMany({
            where: { userId },
            select: { achievementId: true },
          }),
        ]);

        const unlockedIds = new Set(
          userAchievements.map((ua) => ua.achievementId)
        );
        const newUnlocks: UserAchievementData[] = [];

        for (const achievement of achievements) {
          // Skip if already unlocked
          if (unlockedIds.has(achievement.id)) continue;

          const req = parseAchievementRequirement(achievement.requirement);
          let shouldUnlock = false;

          // Check if requirement is met
          if (req.type === "count") {
            if (req.metric === "meals" && stats.totalMeals !== undefined) {
              shouldUnlock = stats.totalMeals >= req.target;
            } else if (
              req.metric === "workouts" &&
              stats.totalWorkouts !== undefined
            ) {
              shouldUnlock = stats.totalWorkouts >= req.target;
            }
          } else if (req.type === "streak") {
            if (req.metric === "logging" && stats.loggingStreak !== undefined) {
              shouldUnlock = stats.loggingStreak >= req.target;
            } else if (
              req.metric === "exercise" &&
              stats.exerciseStreak !== undefined
            ) {
              shouldUnlock = stats.exerciseStreak >= req.target;
            } else if (
              req.metric === "calorie" &&
              stats.calorieStreak !== undefined
            ) {
              shouldUnlock = stats.calorieStreak >= req.target;
            } else if (
              req.metric === "water" &&
              stats.waterStreak !== undefined
            ) {
              shouldUnlock = stats.waterStreak >= req.target;
            }
          }

          if (shouldUnlock) {
            const ua = await prisma.userAchievement.create({
              data: { userId, achievementId: achievement.id },
              include: { achievement: true },
            });

            newUnlocks.push({
              id: ua.id,
              achievementId: ua.achievementId,
              key: ua.achievement.key,
              name: ua.achievement.name,
              description: ua.achievement.description,
              icon: ua.achievement.icon,
              category: ua.achievement.category as AchievementCategory,
              points: ua.achievement.points,
              unlockedAt: ua.unlockedAt.toISOString(),
            });
          }
        }

        return newUnlocks;
      } catch (error) {
        console.error("Failed to check achievements:", error);
        return [];
      }
    }
  );
