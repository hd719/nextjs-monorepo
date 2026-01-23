import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import type { SleepData, SleepHistoryEntry } from "@/types/sleep";

const log = createLogger("server:sleep");

const WHOOP_PROVIDER = "whoop";

type WhoopSleepRow = {
  startAt: Date;
  endAt: Date;
  durationSeconds: number;
  sleepScore: number | null;
  sourceTzOffsetMinutes: number;
};

async function getConnectedWhoopIntegrationId(
  userId: string
): Promise<string | null> {
  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: { userId, provider: WHOOP_PROVIDER },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!integration || integration.status !== "connected") {
    return null;
  }

  return integration.id;
}

function formatTimeFromOffset(date: Date, offsetMinutes: number): string {
  const local = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  const hours = local.getUTCHours().toString().padStart(2, "0");
  const minutes = local.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function mapWhoopScoreToQuality(score: number | null): number | null {
  if (score === null || Number.isNaN(score)) {
    return null;
  }
  // Map 0-100 to 1-5 (best effort for UI parity).
  return Math.min(5, Math.max(1, Math.round((score / 100) * 4 + 1)));
}

function toSleepDataFromWhoop(
  row: WhoopSleepRow,
  date: string
): SleepData {
  const hoursSlept = row.durationSeconds / 3600;
  const quality = mapWhoopScoreToQuality(row.sleepScore);
  return {
    hoursSlept,
    quality,
    bedtime: formatTimeFromOffset(row.startAt, row.sourceTzOffsetMinutes),
    wakeTime: formatTimeFromOffset(row.endAt, row.sourceTzOffsetMinutes),
    date,
    hasEntry: true,
  };
}

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

      const whoopIntegrationId = await getConnectedWhoopIntegrationId(userId);
      if (whoopIntegrationId) {
        const whoopSleep = await prisma.integrationSleep.findFirst({
          where: {
            integrationId: whoopIntegrationId,
            localDate: dateObj,
            isPrimary: true,
          },
          orderBy: {
            durationSeconds: "desc",
          },
          select: {
            startAt: true,
            endAt: true,
            durationSeconds: true,
            sleepScore: true,
            sourceTzOffsetMinutes: true,
          },
        });

        if (whoopSleep) {
          return toSleepDataFromWhoop(
            {
              startAt: whoopSleep.startAt,
              endAt: whoopSleep.endAt,
              durationSeconds: whoopSleep.durationSeconds,
              sleepScore: whoopSleep.sleepScore ?? null,
              sourceTzOffsetMinutes: whoopSleep.sourceTzOffsetMinutes,
            },
            date
          );
        }
      }

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

      const whoopIntegrationId = await getConnectedWhoopIntegrationId(userId);
      if (whoopIntegrationId) {
        const entries = await prisma.integrationSleep.findMany({
          where: {
            integrationId: whoopIntegrationId,
            localDate: { gte: startDate },
            isPrimary: true,
          },
          orderBy: { localDate: "desc" },
          select: {
            localDate: true,
            startAt: true,
            endAt: true,
            durationSeconds: true,
            sleepScore: true,
            sourceTzOffsetMinutes: true,
          },
        });

        return entries.map((entry) => ({
          date: entry.localDate.toISOString().split("T")[0],
          hoursSlept: entry.durationSeconds / 3600,
          quality: mapWhoopScoreToQuality(entry.sleepScore ?? null) ?? 0,
          bedtime: formatTimeFromOffset(
            entry.startAt,
            entry.sourceTzOffsetMinutes
          ),
          wakeTime: formatTimeFromOffset(
            entry.endAt,
            entry.sourceTzOffsetMinutes
          ),
        }));
      }

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

        const whoopIntegrationId = await getConnectedWhoopIntegrationId(userId);
        if (whoopIntegrationId) {
          const entries = await prisma.integrationSleep.findMany({
            where: {
              integrationId: whoopIntegrationId,
              localDate: { gte: startDate },
              isPrimary: true,
            },
            select: {
              durationSeconds: true,
              sleepScore: true,
            },
          });

          if (entries.length === 0) {
            return { averageHours: 0, averageQuality: null };
          }

          const totalHours = entries.reduce(
            (sum, entry) => sum + entry.durationSeconds / 3600,
            0
          );
          const qualities = entries
            .map((entry) => mapWhoopScoreToQuality(entry.sleepScore ?? null))
            .filter((quality): quality is number => quality !== null);
          const avgQuality =
            qualities.length > 0
              ? qualities.reduce((sum, value) => sum + value, 0) /
                qualities.length
              : null;

          return {
            averageHours: totalHours / entries.length,
            averageQuality: avgQuality
              ? Math.round(avgQuality * 10) / 10
              : null,
          };
        }

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
