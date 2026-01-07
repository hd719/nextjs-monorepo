import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import type { WaterIntake } from "@/types/nutrition";

const log = createLogger("server:water");

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get water intake for a specific user and date
 * Returns current glasses consumed and daily goal
 */
export const getWaterIntake = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(async ({ data: { userId, date } }): Promise<WaterIntake> => {
    try {
      const dateObj = new Date(date + "T00:00:00.000Z");

      // Fetch water entry and user goal in parallel
      const [waterEntry, user] = await Promise.all([
        prisma.waterEntry.findUnique({
          where: {
            userId_date: { userId, date: dateObj },
          },
          select: { glasses: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { dailyWaterGoal: true },
        }),
      ]);

      return {
        current: waterEntry?.glasses ?? 0,
        goal: user?.dailyWaterGoal ?? 8,
        date,
      };
    } catch (error) {
      log.error({ err: error, userId, date }, "Failed to fetch water intake");
      return {
        current: 0,
        goal: 8,
        date,
      };
    }
  });

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Update water intake for a specific user and date
 * Creates entry if it doesn't exist, updates if it does
 */
export const updateWaterIntake = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { userId: string; date: string; glasses: number }) => data
  )
  .handler(
    async ({ data: { userId, date, glasses } }): Promise<WaterIntake> => {
      try {
        const dateObj = new Date(date + "T00:00:00.000Z");

        // Ensure glasses is non-negative
        const validGlasses = Math.max(0, Math.floor(glasses));

        // Upsert water entry (create or update)
        const [waterEntry, user] = await Promise.all([
          prisma.waterEntry.upsert({
            where: {
              userId_date: { userId, date: dateObj },
            },
            update: {
              glasses: validGlasses,
              updatedAt: new Date(),
            },
            create: {
              userId,
              date: dateObj,
              glasses: validGlasses,
            },
            select: { glasses: true },
          }),
          prisma.user.findUnique({
            where: { id: userId },
            select: { dailyWaterGoal: true },
          }),
        ]);

        return {
          current: waterEntry.glasses,
          goal: user?.dailyWaterGoal ?? 8,
          date,
        };
      } catch (error) {
        log.error(
          { err: error, userId, date },
          "Failed to update water intake"
        );
        throw new Error("Failed to update water intake");
      }
    }
  );

/**
 * Update user's daily water goal
 */
export const updateWaterGoal = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; goal: number }) => data)
  .handler(async ({ data: { userId, goal } }): Promise<{ goal: number }> => {
    try {
      // Ensure goal is between 1 and 20 glasses
      const validGoal = Math.min(20, Math.max(1, Math.floor(goal)));

      await prisma.user.update({
        where: { id: userId },
        data: { dailyWaterGoal: validGoal },
      });

      return { goal: validGoal };
    } catch (error) {
      log.error({ err: error, userId }, "Failed to update water goal");
      throw new Error("Failed to update water goal");
    }
  });
