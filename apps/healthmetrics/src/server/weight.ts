import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import type { WeightEntry } from "@/types/weight";

const log = createLogger("server:weight");

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get latest weight entry for a user
 */
export const getLatestWeight = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<WeightEntry | null> => {
    try {
      const entry = await prisma.weightEntry.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
        select: {
          id: true,
          userId: true,
          date: true,
          weightLbs: true,
          notes: true,
          createdAt: true,
        },
      });

      if (!entry || !entry.weightLbs) {
        return null;
      }

      return {
        id: entry.id,
        userId: entry.userId,
        date: entry.date,
        weightLbs: Number(entry.weightLbs),
        notes: entry.notes,
        createdAt: entry.createdAt,
      };
    } catch (error) {
      log.error({ err: error, userId }, "Failed to fetch latest weight");
      return null;
    }
  });

/**
 * Get weight entries for the last N days (for trend chart)
 * Returns array sorted by date ascending
 */
export const getWeightTrend = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; days?: number }) => data)
  .handler(
    async ({
      data: { userId, days = 7 },
    }): Promise<{
      entries: WeightEntry[];
      change: number;
      goalWeight: number | null;
    }> => {
      try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const entries = await prisma.weightEntry.findMany({
          where: {
            userId,
            date: {
              gte: startDate,
              lte: endDate,
            },
            weightLbs: { not: null },
          },
          orderBy: { date: "asc" },
          select: {
            id: true,
            userId: true,
            date: true,
            weightLbs: true,
            notes: true,
            createdAt: true,
          },
        });

        // Get user's target weight from profile
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { targetWeightLbs: true },
        });

        // Calculate weight change
        const weightEntries = entries
          .filter((e) => e.weightLbs !== null)
          .map((e) => ({
            id: e.id,
            userId: e.userId,
            date: e.date,
            weightLbs: Number(e.weightLbs),
            notes: e.notes,
            createdAt: e.createdAt,
          }));

        let change = 0;
        if (weightEntries.length >= 2) {
          const first = weightEntries[0].weightLbs;
          const last = weightEntries[weightEntries.length - 1].weightLbs;
          change = Math.round((last - first) * 10) / 10;
        }

        return {
          entries: weightEntries,
          change,
          goalWeight: user?.targetWeightLbs
            ? Number(user.targetWeightLbs)
            : null,
        };
      } catch (error) {
        log.error({ err: error, userId }, "Failed to fetch weight trend");
        return { entries: [], change: 0, goalWeight: null };
      }
    }
  );

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Create or update weight entry
 * If entry exists for the date, update it; otherwise create new
 */
export const saveWeightEntry = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      userId: string;
      weightLbs: number;
      date?: string;
      notes?: string;
    }) => data
  )
  .handler(
    async ({
      data: { userId, weightLbs, date, notes },
    }): Promise<WeightEntry> => {
      try {
        const entryDate = date ? new Date(date) : new Date();

        // Check if entry exists for this date
        const existing = await prisma.weightEntry.findFirst({
          where: {
            userId,
            date: entryDate,
          },
        });

        let entry;
        if (existing) {
          // Update existing entry
          entry = await prisma.weightEntry.update({
            where: { id: existing.id },
            data: {
              weightLbs,
              notes,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new entry
          entry = await prisma.weightEntry.create({
            data: {
              userId,
              date: entryDate,
              weightLbs,
              notes,
            },
          });
        }

        return {
          id: entry.id,
          userId: entry.userId,
          date: entry.date,
          weightLbs: Number(entry.weightLbs),
          notes: entry.notes,
          createdAt: entry.createdAt,
        };
      } catch (error) {
        log.error({ err: error, userId }, "Failed to save weight entry");
        // Preserve validation error messages
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to save weight entry");
      }
    }
  );
