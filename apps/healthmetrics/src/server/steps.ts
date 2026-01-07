import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import type { StepCount } from "@/types/nutrition";

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get step count for a specific user and date
 * Returns current steps and daily goal
 */
export const getStepCount = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(async ({ data: { userId, date } }): Promise<StepCount> => {
    try {
      const dateObj = new Date(date + "T00:00:00.000Z");

      // Fetch step entry and user goal in parallel
      const [stepEntry, user] = await Promise.all([
        prisma.stepEntry.findUnique({
          where: {
            userId_date: { userId, date: dateObj },
          },
          select: { steps: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { dailyStepGoal: true },
        }),
      ]);

      return {
        current: stepEntry?.steps ?? 0,
        goal: user?.dailyStepGoal ?? 10000,
        date,
      };
    } catch (error) {
      console.error("Failed to fetch step count:", error);
      return {
        current: 0,
        goal: 10000,
        date,
      };
    }
  });

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Update step count for a specific user and date
 * Creates entry if it doesn't exist, updates if it does
 */
export const updateStepCount = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { userId: string; date: string; steps: number }) => data
  )
  .handler(async ({ data: { userId, date, steps } }): Promise<StepCount> => {
    try {
      const dateObj = new Date(date + "T00:00:00.000Z");

      // Ensure steps is non-negative
      const validSteps = Math.max(0, Math.floor(steps));

      // Upsert step entry (create or update)
      const [stepEntry, user] = await Promise.all([
        prisma.stepEntry.upsert({
          where: {
            userId_date: { userId, date: dateObj },
          },
          update: {
            steps: validSteps,
            updatedAt: new Date(),
          },
          create: {
            userId,
            date: dateObj,
            steps: validSteps,
          },
          select: { steps: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { dailyStepGoal: true },
        }),
      ]);

      return {
        current: stepEntry.steps,
        goal: user?.dailyStepGoal ?? 10000,
        date,
      };
    } catch (error) {
      console.error("Failed to update step count:", error);
      throw new Error("Failed to update step count");
    }
  });

/**
 * Add steps to current count (increment)
 * Useful for quick-add buttons
 */
export const addSteps = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { userId: string; date: string; stepsToAdd: number }) => data
  )
  .handler(
    async ({ data: { userId, date, stepsToAdd } }): Promise<StepCount> => {
      try {
        const dateObj = new Date(date + "T00:00:00.000Z");

        // Ensure stepsToAdd is positive
        const validStepsToAdd = Math.max(0, Math.floor(stepsToAdd));

        // Get current steps or create new entry
        const existing = await prisma.stepEntry.findUnique({
          where: { userId_date: { userId, date: dateObj } },
          select: { steps: true },
        });

        const newSteps = (existing?.steps ?? 0) + validStepsToAdd;

        // Upsert with new total
        const [stepEntry, user] = await Promise.all([
          prisma.stepEntry.upsert({
            where: { userId_date: { userId, date: dateObj } },
            update: { steps: newSteps, updatedAt: new Date() },
            create: { userId, date: dateObj, steps: newSteps },
            select: { steps: true },
          }),
          prisma.user.findUnique({
            where: { id: userId },
            select: { dailyStepGoal: true },
          }),
        ]);

        return {
          current: stepEntry.steps,
          goal: user?.dailyStepGoal ?? 10000,
          date,
        };
      } catch (error) {
        console.error("Failed to add steps:", error);
        throw new Error("Failed to add steps");
      }
    }
  );
