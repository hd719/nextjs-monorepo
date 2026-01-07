import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import type { UserStreaks } from "@/types/streaks";

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get user's streak data
 */
export const getStreaks = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<UserStreaks> => {
    try {
      const streak = await prisma.userStreak.findUnique({
        where: { userId },
      });

      if (!streak) {
        // Return default values if no streak record exists
        return {
          currentLogging: 0,
          currentCalorie: 0,
          currentExercise: 0,
          bestLogging: 0,
          bestCalorie: 0,
          bestExercise: 0,
          lastLoggingDate: null,
          lastExerciseDate: null,
        };
      }

      return {
        currentLogging: streak.currentLogging,
        currentCalorie: streak.currentCalorie,
        currentExercise: streak.currentExercise,
        bestLogging: streak.bestLogging,
        bestCalorie: streak.bestCalorie,
        bestExercise: streak.bestExercise,
        lastLoggingDate:
          streak.lastLoggingDate?.toISOString().split("T")[0] ?? null,
        lastExerciseDate:
          streak.lastExerciseDate?.toISOString().split("T")[0] ?? null,
      };
    } catch (error) {
      console.error("Failed to fetch streaks:", error);
      return {
        currentLogging: 0,
        currentCalorie: 0,
        currentExercise: 0,
        bestLogging: 0,
        bestCalorie: 0,
        bestExercise: 0,
        lastLoggingDate: null,
        lastExerciseDate: null,
      };
    }
  });

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Update logging streak when user logs food
 */
export const updateLoggingStreak = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(async ({ data: { userId, date } }): Promise<UserStreaks> => {
    try {
      const dateObj = new Date(date + "T00:00:00.000Z");
      const streak = await prisma.userStreak.findUnique({ where: { userId } });

      if (!streak) {
        // Create new streak record
        const newStreak = await prisma.userStreak.create({
          data: {
            userId,
            currentLogging: 1,
            bestLogging: 1,
            lastLoggingDate: dateObj,
          },
        });
        return formatStreak(newStreak);
      }

      // Calculate days since last log
      const daysSinceLastLog = streak.lastLoggingDate
        ? Math.floor(
            (dateObj.getTime() - streak.lastLoggingDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : -1;

      let newCurrentLogging = streak.currentLogging;
      let newBestLogging = streak.bestLogging;

      if (daysSinceLastLog === 1) {
        // Consecutive day - increment streak
        newCurrentLogging = streak.currentLogging + 1;
        newBestLogging = Math.max(newCurrentLogging, streak.bestLogging);
      } else if (daysSinceLastLog > 1 || daysSinceLastLog === -1) {
        // Streak broken - reset to 1
        newCurrentLogging = 1;
      }
      // daysSinceLastLog === 0: Same day, no update needed

      if (daysSinceLastLog !== 0) {
        const updatedStreak = await prisma.userStreak.update({
          where: { userId },
          data: {
            currentLogging: newCurrentLogging,
            bestLogging: newBestLogging,
            lastLoggingDate: dateObj,
          },
        });
        return formatStreak(updatedStreak);
      }

      return formatStreak(streak);
    } catch (error) {
      console.error("Failed to update logging streak:", error);
      throw new Error("Failed to update streak");
    }
  });

/**
 * Update exercise streak when user logs workout
 */
export const updateExerciseStreak = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(async ({ data: { userId, date } }): Promise<UserStreaks> => {
    try {
      const dateObj = new Date(date + "T00:00:00.000Z");
      const streak = await prisma.userStreak.findUnique({ where: { userId } });

      if (!streak) {
        // Create new streak record
        const newStreak = await prisma.userStreak.create({
          data: {
            userId,
            currentExercise: 1,
            bestExercise: 1,
            lastExerciseDate: dateObj,
          },
        });
        return formatStreak(newStreak);
      }

      // Calculate days since last exercise
      const daysSinceLastExercise = streak.lastExerciseDate
        ? Math.floor(
            (dateObj.getTime() - streak.lastExerciseDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : -1;

      let newCurrentExercise = streak.currentExercise;
      let newBestExercise = streak.bestExercise;

      if (daysSinceLastExercise === 1) {
        // Consecutive day - increment streak
        newCurrentExercise = streak.currentExercise + 1;
        newBestExercise = Math.max(newCurrentExercise, streak.bestExercise);
      } else if (daysSinceLastExercise > 1 || daysSinceLastExercise === -1) {
        // Streak broken - reset to 1
        newCurrentExercise = 1;
      }
      // daysSinceLastExercise === 0: Same day, no update needed

      if (daysSinceLastExercise !== 0) {
        const updatedStreak = await prisma.userStreak.update({
          where: { userId },
          data: {
            currentExercise: newCurrentExercise,
            bestExercise: newBestExercise,
            lastExerciseDate: dateObj,
          },
        });
        return formatStreak(updatedStreak);
      }

      return formatStreak(streak);
    } catch (error) {
      console.error("Failed to update exercise streak:", error);
      throw new Error("Failed to update streak");
    }
  });

/**
 * Update calorie goal streak
 * Called when user hits their calorie goal for the day
 */
export const updateCalorieStreak = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; hitGoal: boolean }) => data)
  .handler(async ({ data: { userId, hitGoal } }): Promise<UserStreaks> => {
    try {
      const streak = await prisma.userStreak.findUnique({ where: { userId } });

      if (!streak) {
        const newStreak = await prisma.userStreak.create({
          data: {
            userId,
            currentCalorie: hitGoal ? 1 : 0,
            bestCalorie: hitGoal ? 1 : 0,
          },
        });
        return formatStreak(newStreak);
      }

      let newCurrentCalorie = streak.currentCalorie;
      let newBestCalorie = streak.bestCalorie;

      if (hitGoal) {
        newCurrentCalorie = streak.currentCalorie + 1;
        newBestCalorie = Math.max(newCurrentCalorie, streak.bestCalorie);
      } else {
        // Streak broken
        newCurrentCalorie = 0;
      }

      const updatedStreak = await prisma.userStreak.update({
        where: { userId },
        data: {
          currentCalorie: newCurrentCalorie,
          bestCalorie: newBestCalorie,
        },
      });

      return formatStreak(updatedStreak);
    } catch (error) {
      console.error("Failed to update calorie streak:", error);
      throw new Error("Failed to update streak");
    }
  });

// Helper to format streak data
function formatStreak(streak: {
  currentLogging: number;
  currentCalorie: number;
  currentExercise: number;
  bestLogging: number;
  bestCalorie: number;
  bestExercise: number;
  lastLoggingDate: Date | null;
  lastExerciseDate: Date | null;
}): UserStreaks {
  return {
    currentLogging: streak.currentLogging,
    currentCalorie: streak.currentCalorie,
    currentExercise: streak.currentExercise,
    bestLogging: streak.bestLogging,
    bestCalorie: streak.bestCalorie,
    bestExercise: streak.bestExercise,
    lastLoggingDate:
      streak.lastLoggingDate?.toISOString().split("T")[0] ?? null,
    lastExerciseDate:
      streak.lastExerciseDate?.toISOString().split("T")[0] ?? null,
  };
}
