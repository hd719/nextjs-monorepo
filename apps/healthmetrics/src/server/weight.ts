import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import type { WeightEntry } from "@/types/weight";

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
      console.error("Failed to fetch latest weight:", error);
      return null;
    }
  });

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
        console.error("Failed to save weight entry:", error);
        // Preserve validation error messages
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to save weight entry");
      }
    }
  );
