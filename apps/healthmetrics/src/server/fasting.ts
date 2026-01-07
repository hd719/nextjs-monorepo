import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import type {
  FastingProtocol,
  FastingStats,
  FastingHistoryEntry,
  ActiveFast,
  FastingCalendarDay,
} from "@/types";

const log = createLogger("server:fasting");

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get active fast for user
 * Returns the currently active fasting session with protocol details
 */
export const getActiveFast = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<ActiveFast | null> => {
    try {
      const session = await prisma.fastingSession.findFirst({
        where: {
          userId,
          status: { in: ["active", "paused"] },
        },
        include: {
          protocol: true,
        },
        orderBy: { startTime: "desc" },
      });

      if (!session) {
        return null;
      }

      // Calculate elapsed time
      const now = new Date();
      const startTime = new Date(session.startTime);
      let elapsedMs = now.getTime() - startTime.getTime();

      // Subtract paused time
      if (session.pausedAt) {
        const pausedMs = now.getTime() - new Date(session.pausedAt).getTime();
        elapsedMs -= pausedMs;
      }
      elapsedMs -= session.totalPausedMin * 60 * 1000;

      const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60000));
      const remainingMinutes = Math.max(
        0,
        session.targetDurationMin - elapsedMinutes
      );
      const percentComplete = Math.min(
        100,
        (elapsedMinutes / session.targetDurationMin) * 100
      );

      // Calculate estimated end time
      const estimatedEndTime = new Date(
        startTime.getTime() +
          session.targetDurationMin * 60 * 1000 +
          session.totalPausedMin * 60 * 1000
      );

      return {
        session: {
          id: session.id,
          userId: session.userId,
          protocolId: session.protocolId,
          startTime: session.startTime,
          endTime: session.endTime,
          targetDurationMin: session.targetDurationMin,
          actualDurationMin: session.actualDurationMin,
          pausedAt: session.pausedAt,
          totalPausedMin: session.totalPausedMin,
          status: session.status,
          completedAtTarget: session.completedAtTarget,
          notes: session.notes,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        },
        protocol: {
          id: session.protocol.id,
          userId: session.protocol.userId,
          name: session.protocol.name,
          fastingMinutes: session.protocol.fastingMinutes,
          eatingMinutes: session.protocol.eatingMinutes,
          isPreset: session.protocol.isPreset,
          createdAt: session.protocol.createdAt,
          updatedAt: session.protocol.updatedAt,
        },
        elapsedMinutes,
        remainingMinutes,
        percentComplete,
        estimatedEndTime,
        isPaused: session.status === "paused",
      };
    } catch (error) {
      log.error({ err: error, userId }, "Failed to fetch active fast");
      return null;
    }
  });

/**
 * Get fasting protocols (preset + user custom)
 */
export const getFastingProtocols = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<FastingProtocol[]> => {
    try {
      const protocols = await prisma.fastingProtocol.findMany({
        where: {
          OR: [{ isPreset: true }, { userId }],
        },
        orderBy: [{ isPreset: "desc" }, { fastingMinutes: "asc" }],
      });

      return protocols.map((p) => ({
        id: p.id,
        userId: p.userId,
        name: p.name,
        fastingMinutes: p.fastingMinutes,
        eatingMinutes: p.eatingMinutes,
        isPreset: p.isPreset,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    } catch (error) {
      log.error({ err: error, userId }, "Failed to fetch fasting protocols");
      return [];
    }
  });

/**
 * Get fasting history for user
 */
export const getFastingHistory = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { userId: string; limit?: number; offset?: number }) => data
  )
  .handler(
    async ({
      data: { userId, limit = 10, offset = 0 },
    }): Promise<FastingHistoryEntry[]> => {
      try {
        const sessions = await prisma.fastingSession.findMany({
          where: {
            userId,
            status: { in: ["completed", "cancelled"] },
          },
          include: {
            protocol: { select: { name: true } },
          },
          orderBy: { startTime: "desc" },
          take: limit,
          skip: offset,
        });

        return sessions.map((s) => ({
          id: s.id,
          date: s.startTime,
          protocolName: s.protocol.name,
          targetDurationMin: s.targetDurationMin,
          actualDurationMin: s.actualDurationMin,
          status: s.status,
          completedAtTarget: s.completedAtTarget ?? false,
        }));
      } catch (error) {
        log.error({ err: error, userId }, "Failed to fetch fasting history");
        return [];
      }
    }
  );

/**
 * Get fasting calendar data for a specific month
 */
export const getFastingCalendar = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; month: string }) => data)
  .handler(
    async ({ data: { userId, month } }): Promise<FastingCalendarDay[]> => {
      try {
        // Parse month (format: YYYY-MM)
        const [year, monthNum] = month.split("-").map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

        // Get all fasts for the month
        const sessions = await prisma.fastingSession.findMany({
          where: {
            userId,
            startTime: {
              gte: startDate,
              lte: endDate,
            },
            status: { in: ["completed", "cancelled"] },
          },
          select: {
            startTime: true,
            status: true,
            actualDurationMin: true,
            completedAtTarget: true,
          },
          orderBy: { startTime: "asc" },
        });

        // Build calendar data for each day
        const calendarDays: FastingCalendarDay[] = [];
        const daysInMonth = new Date(year, monthNum, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          // Find fasts for this day
          const dayFasts = sessions.filter((s) => {
            const fastDate = new Date(s.startTime).toISOString().split("T")[0];
            return fastDate === dateStr;
          });

          if (dayFasts.length > 0) {
            // Use the best fast of the day (completed at target preferred)
            const bestFast =
              dayFasts.find((f) => f.completedAtTarget) || dayFasts[0];

            calendarDays.push({
              date: dateStr,
              hasFast: true,
              status: bestFast.status,
              durationMin: bestFast.actualDurationMin ?? undefined,
              completedAtTarget: bestFast.completedAtTarget ?? undefined,
            });
          } else {
            calendarDays.push({
              date: dateStr,
              hasFast: false,
            });
          }
        }

        return calendarDays;
      } catch (error) {
        log.error(
          { err: error, userId, month },
          "Failed to fetch fasting calendar"
        );
        return [];
      }
    }
  );

/**
 * Get fasting stats for user
 */
export const getFastingStats = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<FastingStats> => {
    try {
      // Get user's weekly goal
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fastingGoalPerWeek: true },
      });

      // Get all completed fasts
      const allFasts = await prisma.fastingSession.findMany({
        where: {
          userId,
          status: "completed",
        },
        orderBy: { startTime: "desc" },
        select: {
          startTime: true,
          actualDurationMin: true,
          completedAtTarget: true,
        },
      });

      // Calculate this week's fasts
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const fastsThisWeek = allFasts.filter(
        (f) => new Date(f.startTime) >= weekStart
      ).length;

      // Calculate totals
      const totalFasts = allFasts.length;
      const totalFastingMinutes = allFasts.reduce(
        (sum, f) => sum + (f.actualDurationMin ?? 0),
        0
      );
      const averageFastDuration =
        totalFasts > 0 ? totalFastingMinutes / totalFasts : 0;

      // Completion rate
      const completedAtTarget = allFasts.filter(
        (f) => f.completedAtTarget
      ).length;
      const completionRate =
        totalFasts > 0 ? (completedAtTarget / totalFasts) * 100 : 0;

      // Calculate streak
      const { currentStreak, longestStreak } = calculateFastingStreak(allFasts);

      // Last fast
      const lastFast = allFasts[0];

      return {
        currentStreak,
        longestStreak,
        fastsThisWeek,
        weeklyGoal: user?.fastingGoalPerWeek ?? null,
        totalFasts,
        totalFastingMinutes,
        averageFastDuration: Math.round(averageFastDuration),
        completionRate: Math.round(completionRate),
        lastFastDate: lastFast?.startTime ?? null,
        lastFastDuration: lastFast?.actualDurationMin ?? null,
      };
    } catch (error) {
      log.error({ err: error, userId }, "Failed to fetch fasting stats");
      return {
        currentStreak: 0,
        longestStreak: 0,
        fastsThisWeek: 0,
        weeklyGoal: null,
        totalFasts: 0,
        totalFastingMinutes: 0,
        averageFastDuration: 0,
        completionRate: 0,
        lastFastDate: null,
        lastFastDuration: null,
      };
    }
  });

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Start a new fast
 */
export const startFast = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { userId: string; protocolId: string; startTime?: string }) => data
  )
  .handler(async ({ data: { userId, protocolId, startTime } }) => {
    try {
      // Check for existing active fast
      const existingFast = await prisma.fastingSession.findFirst({
        where: {
          userId,
          status: { in: ["active", "paused"] },
        },
      });

      if (existingFast) {
        throw new Error("You already have an active fast");
      }

      // Get protocol
      const protocol = await prisma.fastingProtocol.findUnique({
        where: { id: protocolId },
      });

      if (!protocol) {
        throw new Error("Protocol not found");
      }

      // Create new session
      const session = await prisma.fastingSession.create({
        data: {
          userId,
          protocolId,
          startTime: startTime ? new Date(startTime) : new Date(),
          targetDurationMin: protocol.fastingMinutes,
          status: "active",
          totalPausedMin: 0,
        },
        include: { protocol: true },
      });

      log.info(
        { userId, sessionId: session.id, protocol: protocol.name },
        "Started new fast"
      );

      return {
        success: true,
        session: {
          id: session.id,
          userId: session.userId,
          protocolId: session.protocolId,
          startTime: session.startTime,
          endTime: session.endTime,
          targetDurationMin: session.targetDurationMin,
          actualDurationMin: session.actualDurationMin,
          pausedAt: session.pausedAt,
          totalPausedMin: session.totalPausedMin,
          status: session.status,
          completedAtTarget: session.completedAtTarget,
          notes: session.notes,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        },
      };
    } catch (error) {
      log.error({ err: error, userId, protocolId }, "Failed to start fast");
      throw error;
    }
  });

/**
 * End current fast
 */
export const endFast = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { userId: string; sessionId: string; notes?: string }) => data
  )
  .handler(async ({ data: { userId, sessionId, notes } }) => {
    try {
      const session = await prisma.fastingSession.findFirst({
        where: {
          id: sessionId,
          userId,
          status: { in: ["active", "paused"] },
        },
      });

      if (!session) {
        throw new Error("Active fast not found");
      }

      const now = new Date();
      const startTime = new Date(session.startTime);

      // Calculate actual duration
      let elapsedMs = now.getTime() - startTime.getTime();
      if (session.pausedAt) {
        const pausedMs = now.getTime() - new Date(session.pausedAt).getTime();
        elapsedMs -= pausedMs;
      }
      elapsedMs -= session.totalPausedMin * 60 * 1000;

      const actualDurationMin = Math.max(0, Math.floor(elapsedMs / 60000));
      const completedAtTarget = actualDurationMin >= session.targetDurationMin;

      // Update session
      const updated = await prisma.fastingSession.update({
        where: { id: sessionId },
        data: {
          endTime: now,
          actualDurationMin,
          completedAtTarget,
          status: "completed",
          notes: notes ?? session.notes,
        },
      });

      log.info(
        {
          userId,
          sessionId,
          actualDurationMin,
          completedAtTarget,
        },
        "Ended fast"
      );

      return {
        success: true,
        actualDurationMin,
        completedAtTarget,
        session: updated,
      };
    } catch (error) {
      log.error({ err: error, userId, sessionId }, "Failed to end fast");
      throw error;
    }
  });

/**
 * Cancel fast (delete without completing)
 */
export const cancelFast = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; sessionId: string }) => data)
  .handler(async ({ data: { userId, sessionId } }) => {
    try {
      const session = await prisma.fastingSession.findFirst({
        where: {
          id: sessionId,
          userId,
          status: { in: ["active", "paused"] },
        },
      });

      if (!session) {
        throw new Error("Active fast not found");
      }

      await prisma.fastingSession.update({
        where: { id: sessionId },
        data: {
          status: "cancelled",
          endTime: new Date(),
        },
      });

      log.info({ userId, sessionId }, "Cancelled fast");

      return { success: true };
    } catch (error) {
      log.error({ err: error, userId, sessionId }, "Failed to cancel fast");
      throw error;
    }
  });

/**
 * Pause fast
 */
export const pauseFast = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; sessionId: string }) => data)
  .handler(async ({ data: { userId, sessionId } }) => {
    try {
      const session = await prisma.fastingSession.findFirst({
        where: {
          id: sessionId,
          userId,
          status: "active",
        },
      });

      if (!session) {
        throw new Error("Active fast not found");
      }

      await prisma.fastingSession.update({
        where: { id: sessionId },
        data: {
          status: "paused",
          pausedAt: new Date(),
        },
      });

      log.info({ userId, sessionId }, "Paused fast");

      return { success: true };
    } catch (error) {
      log.error({ err: error, userId, sessionId }, "Failed to pause fast");
      throw error;
    }
  });

/**
 * Resume fast
 */
export const resumeFast = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; sessionId: string }) => data)
  .handler(async ({ data: { userId, sessionId } }) => {
    try {
      const session = await prisma.fastingSession.findFirst({
        where: {
          id: sessionId,
          userId,
          status: "paused",
        },
      });

      if (!session || !session.pausedAt) {
        throw new Error("Paused fast not found");
      }

      const now = new Date();
      const pausedMs = now.getTime() - new Date(session.pausedAt).getTime();
      const pausedMinutes = Math.floor(pausedMs / 60000);

      await prisma.fastingSession.update({
        where: { id: sessionId },
        data: {
          status: "active",
          pausedAt: null,
          totalPausedMin: session.totalPausedMin + pausedMinutes,
        },
      });

      log.info({ userId, sessionId, pausedMinutes }, "Resumed fast");

      return { success: true };
    } catch (error) {
      log.error({ err: error, userId, sessionId }, "Failed to resume fast");
      throw error;
    }
  });

/**
 * Create a custom fasting protocol
 */
export const createCustomProtocol = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      userId: string;
      name: string;
      fastingMinutes: number;
      eatingMinutes: number;
    }) => data
  )
  .handler(
    async ({
      data: { userId, name, fastingMinutes, eatingMinutes },
    }): Promise<FastingProtocol> => {
      try {
        // Validate inputs
        if (!name.trim()) {
          throw new Error("Protocol name is required");
        }
        if (fastingMinutes < 60) {
          throw new Error("Fasting duration must be at least 1 hour");
        }
        if (eatingMinutes < 60) {
          throw new Error("Eating window must be at least 1 hour");
        }
        if (fastingMinutes + eatingMinutes !== 1440) {
          throw new Error("Fasting and eating windows must total 24 hours");
        }

        // Check for duplicate names for this user
        const existing = await prisma.fastingProtocol.findFirst({
          where: {
            userId,
            name: name.trim(),
          },
        });

        if (existing) {
          throw new Error("You already have a protocol with this name");
        }

        const protocol = await prisma.fastingProtocol.create({
          data: {
            userId,
            name: name.trim(),
            fastingMinutes,
            eatingMinutes,
            isPreset: false,
          },
        });

        log.info(
          { userId, protocolId: protocol.id, name: protocol.name },
          "Created custom protocol"
        );

        return {
          id: protocol.id,
          userId: protocol.userId,
          name: protocol.name,
          fastingMinutes: protocol.fastingMinutes,
          eatingMinutes: protocol.eatingMinutes,
          isPreset: protocol.isPreset,
          createdAt: protocol.createdAt,
          updatedAt: protocol.updatedAt,
        };
      } catch (error) {
        log.error(
          { err: error, userId, name },
          "Failed to create custom protocol"
        );
        throw error;
      }
    }
  );

/**
 * Delete a custom protocol
 */
export const deleteCustomProtocol = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; protocolId: string }) => data)
  .handler(async ({ data: { userId, protocolId } }) => {
    try {
      const protocol = await prisma.fastingProtocol.findFirst({
        where: {
          id: protocolId,
          userId,
          isPreset: false,
        },
      });

      if (!protocol) {
        throw new Error("Custom protocol not found");
      }

      // Check if protocol is in use
      const sessionsUsingProtocol = await prisma.fastingSession.count({
        where: { protocolId },
      });

      if (sessionsUsingProtocol > 0) {
        throw new Error(
          "Cannot delete protocol that has been used for fasting sessions"
        );
      }

      await prisma.fastingProtocol.delete({
        where: { id: protocolId },
      });

      log.info({ userId, protocolId }, "Deleted custom protocol");

      return { success: true };
    } catch (error) {
      log.error(
        { err: error, userId, protocolId },
        "Failed to delete custom protocol"
      );
      throw error;
    }
  });

/**
 * Update user's fasting preferences
 */
export const updateFastingPreferences = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      userId: string;
      defaultProtocolId?: string;
      goalPerWeek?: number;
    }) => data
  )
  .handler(async ({ data: { userId, defaultProtocolId, goalPerWeek } }) => {
    try {
      // Validate protocol exists if provided
      if (defaultProtocolId) {
        const protocol = await prisma.fastingProtocol.findUnique({
          where: { id: defaultProtocolId },
        });
        if (!protocol) {
          throw new Error("Protocol not found");
        }
      }

      // Update user preferences
      await prisma.user.update({
        where: { id: userId },
        data: {
          defaultFastingProtocolId: defaultProtocolId ?? null,
          fastingGoalPerWeek: goalPerWeek ?? null,
        },
      });

      log.info(
        { userId, defaultProtocolId, goalPerWeek },
        "Updated fasting preferences"
      );

      return { success: true };
    } catch (error) {
      log.error({ err: error, userId }, "Failed to update fasting preferences");
      throw error;
    }
  });

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate fasting streak from completed fasts
 */
function calculateFastingStreak(
  fasts: Array<{ startTime: Date; completedAtTarget: boolean | null }>
): { currentStreak: number; longestStreak: number } {
  if (fasts.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Group fasts by date
  const fastsByDate = new Map<string, boolean>();
  for (const fast of fasts) {
    const dateStr = new Date(fast.startTime).toISOString().split("T")[0];
    // If any fast on that day completed at target, mark as success
    if (fast.completedAtTarget) {
      fastsByDate.set(dateStr, true);
    } else if (!fastsByDate.has(dateStr)) {
      fastsByDate.set(dateStr, false);
    }
  }

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check from today backwards
  const checkDate = new Date(today);
  let isCurrentStreakActive = true;

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const hasFast = fastsByDate.get(dateStr);

    if (hasFast) {
      tempStreak++;
      if (isCurrentStreakActive) {
        currentStreak = tempStreak;
      }
    } else {
      // Allow one day gap for current streak (today might not be done yet)
      if (i === 0) {
        // Skip today, check yesterday
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
        isCurrentStreakActive = false;
      }
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Final check
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  return { currentStreak, longestStreak };
}
