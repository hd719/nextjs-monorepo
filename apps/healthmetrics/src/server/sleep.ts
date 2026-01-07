import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import type { SleepData, SleepHistoryEntry } from "@/types/sleep";

const log = createLogger("server:sleep");

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get sleep entry for a specific user and date
 * Returns hours slept, quality, and times if logged
 */
export const getSleepEntry = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(async ({ data: { userId, date } }): Promise<SleepData> => {
    try {
      const dateObj = new Date(date + "T00:00:00.000Z");

      const sleepEntry = await prisma.sleepEntry.findUnique({
        where: {
          userId_date: { userId, date: dateObj },
        },
        select: {
          hoursSlept: true,
          quality: true,
          bedtime: true,
          wakeTime: true,
        },
      });

      // Return null values if no entry exists
      if (!sleepEntry) {
        return {
          hoursSlept: null,
          quality: null,
          bedtime: null,
          wakeTime: null,
          date,
          hasEntry: false,
        };
      }

      return {
        hoursSlept: Number(sleepEntry.hoursSlept),
        quality: sleepEntry.quality,
        bedtime: sleepEntry.bedtime,
        wakeTime: sleepEntry.wakeTime,
        date,
        hasEntry: true,
      };
    } catch (error) {
      log.error({ err: error, userId, date }, "Failed to fetch sleep entry");
      return {
        hoursSlept: null,
        quality: null,
        bedtime: null,
        wakeTime: null,
        date,
        hasEntry: false,
      };
    }
  });

/**
 * Get sleep history for charts and analytics
 * Returns entries for the specified number of days
 */
export const getSleepHistory = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; days: number }) => data)
  .handler(async ({ data: { userId, days } }): Promise<SleepHistoryEntry[]> => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const entries = await prisma.sleepEntry.findMany({
        where: {
          userId,
          date: { gte: startDate },
        },
        orderBy: { date: "desc" },
        select: {
          date: true,
          hoursSlept: true,
          quality: true,
          bedtime: true,
          wakeTime: true,
        },
      });

      return entries.map((entry) => ({
        date: entry.date.toISOString().split("T")[0],
        hoursSlept: Number(entry.hoursSlept),
        quality: entry.quality,
        bedtime: entry.bedtime,
        wakeTime: entry.wakeTime,
      }));
    } catch (error) {
      log.error({ err: error, userId }, "Failed to fetch sleep history");
      return [];
    }
  });

/**
 * Get average sleep for a date range
 * Useful for weekly/monthly summaries
 */
export const getSleepAverage = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; days: number }) => data)
  .handler(
    async ({
      data: { userId, days },
    }): Promise<{ averageHours: number; averageQuality: number | null }> => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const result = await prisma.sleepEntry.aggregate({
          where: {
            userId,
            date: { gte: startDate },
          },
          _avg: {
            hoursSlept: true,
            quality: true,
          },
        });

        return {
          averageHours: result._avg.hoursSlept
            ? Number(result._avg.hoursSlept)
            : 0,
          averageQuality: result._avg.quality
            ? Math.round(result._avg.quality * 10) / 10
            : null,
        };
      } catch (error) {
        log.error({ err: error, userId }, "Failed to calculate sleep average");
        return { averageHours: 0, averageQuality: null };
      }
    }
  );

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Save sleep entry for a specific user and date
 * Creates entry if it doesn't exist, updates if it does
 * All fields (quality, bedtime, wakeTime) are required
 */
export const saveSleepEntry = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      userId: string;
      date: string;
      hoursSlept: number;
      quality: number;
      bedtime: string;
      wakeTime: string;
      notes?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<SleepData> => {
    try {
      const dateObj = new Date(data.date + "T00:00:00.000Z");

      // Validate hoursSlept (0-24 range)
      const validHours = Math.min(24, Math.max(0, data.hoursSlept));

      // Validate quality (1-5 range, required)
      const validQuality = Math.min(5, Math.max(1, Math.round(data.quality)));

      // Validate time formats (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.bedtime) || !timeRegex.test(data.wakeTime)) {
        throw new Error("Invalid time format. Use HH:MM format.");
      }

      // Upsert sleep entry (create or update)
      const sleepEntry = await prisma.sleepEntry.upsert({
        where: {
          userId_date: { userId: data.userId, date: dateObj },
        },
        update: {
          hoursSlept: validHours,
          quality: validQuality,
          bedtime: data.bedtime,
          wakeTime: data.wakeTime,
          notes: data.notes,
          updatedAt: new Date(),
        },
        create: {
          userId: data.userId,
          date: dateObj,
          hoursSlept: validHours,
          quality: validQuality,
          bedtime: data.bedtime,
          wakeTime: data.wakeTime,
          notes: data.notes,
        },
        select: {
          hoursSlept: true,
          quality: true,
          bedtime: true,
          wakeTime: true,
        },
      });

      return {
        hoursSlept: Number(sleepEntry.hoursSlept),
        quality: sleepEntry.quality,
        bedtime: sleepEntry.bedtime,
        wakeTime: sleepEntry.wakeTime,
        date: data.date,
        hasEntry: true,
      };
    } catch (error) {
      log.error(
        { err: error, userId: data.userId, date: data.date },
        "Failed to save sleep entry"
      );
      throw new Error("Failed to save sleep entry");
    }
  });

/**
 * Delete sleep entry for a specific date
 */
export const deleteSleepEntry = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(
    async ({ data: { userId, date } }): Promise<{ success: boolean }> => {
      try {
        const dateObj = new Date(date + "T00:00:00.000Z");

        await prisma.sleepEntry.delete({
          where: {
            userId_date: { userId, date: dateObj },
          },
        });

        return { success: true };
      } catch (error) {
        // If entry doesn't exist, that's fine
        log.error({ err: error, userId, date }, "Failed to delete sleep entry");
        return { success: false };
      }
    }
  );
