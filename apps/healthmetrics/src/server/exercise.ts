import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import {
  searchExercisesSchema,
  createWorkoutSessionSchema,
  updateWorkoutSessionSchema,
  updateWorkoutLogSchema,
  deleteWorkoutSessionSchema,
  deleteWorkoutLogSchema,
  getWorkoutDaySchema,
  getTodayExerciseSummarySchema,
  copyPreviousWorkoutSchema,
  type SearchExercisesInput,
  type CreateWorkoutSessionInput,
  type UpdateWorkoutSessionInput,
  type UpdateWorkoutLogInput,
  type DeleteWorkoutSessionInput,
  type DeleteWorkoutLogInput,
  type GetWorkoutDayInput,
  type GetTodayExerciseSummaryInput,
  type CopyPreviousWorkoutInput,
} from "@/utils/validation";
import {
  calculateCalories,
  estimateStrengthDuration,
  getUserWeightLbs,
  validateExerciseRequirements,
} from "@/utils/exercise-helpers";

const log = createLogger("server:exercise");

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Search exercises with optional filters
 */
export const searchExercises = createServerFn({ method: "GET" })
  .inputValidator((data: SearchExercisesInput) =>
    searchExercisesSchema.parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const { query, category, limit } = data;

      const exercises = await prisma.exercise.findMany({
        where: {
          AND: [
            // Search by name if query provided
            query
              ? {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                }
              : {},
            // Filter by category if provided
            category ? { category } : {},
            // Only show verified exercises
            { verified: true },
          ],
        },
        orderBy: [{ name: "asc" }],
        take: limit,
        select: {
          id: true,
          name: true,
          category: true,
          muscleGroups: true,
          metValue: true,
          description: true,
          instructions: true,
          equipment: true,
          difficulty: true,
        },
      });

      return {
        exercises: exercises.map((ex) => ({
          ...ex,
          metValue: Number(ex.metValue),
        })),
      };
    } catch (error) {
      log.error(
        { err: error, query: data.query, category: data.category },
        "Failed to search exercises"
      );
      throw new Error("Failed to search exercises");
    }
  });

/**
 * Get workout data for a specific day
 */
export const getWorkoutDay = createServerFn({ method: "GET" })
  .inputValidator((data: GetWorkoutDayInput) => getWorkoutDaySchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { userId, date } = data;

      const sessions = await prisma.workoutSession.findMany({
        where: {
          userId,
          date: new Date(date),
        },
        include: {
          workoutLogs: {
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  metValue: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        sessions: sessions.map((session) => ({
          ...session,
          totalCalories: session.totalCalories ?? null,
          workoutLogs: session.workoutLogs.map((log) => ({
            ...log,
            weightLbs: log.weightLbs ? Number(log.weightLbs) : null,
            distanceKm: log.distanceKm ? Number(log.distanceKm) : null,
            exercise: {
              ...log.exercise,
              metValue: Number(log.exercise.metValue),
            },
          })),
        })),
      };
    } catch (error) {
      log.error(
        { err: error, userId: data.userId, date: data.date },
        "Failed to fetch workout day"
      );
      throw new Error("Failed to fetch workout day");
    }
  });

/**
 * Get today's exercise summary for dashboard
 * Dynamically calculates calories using current weight if stored calories are null
 */
export const getTodayExerciseSummary = createServerFn({ method: "GET" })
  .inputValidator((data: GetTodayExerciseSummaryInput) =>
    getTodayExerciseSummarySchema.parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const { userId, date } = data;

      const sessions = await prisma.workoutSession.findMany({
        where: {
          userId,
          date: new Date(date),
        },
        include: {
          workoutLogs: {
            include: {
              exercise: {
                select: {
                  metValue: true,
                },
              },
            },
          },
        },
      });

      if (sessions.length === 0) {
        return {
          totalMinutes: 0,
          caloriesBurned: 0,
          exercisesCompleted: 0,
        };
      }

      const totalMinutes = sessions.reduce(
        (sum, session) => sum + session.totalMinutes,
        0
      );

      // Get user's current weight for dynamic calculation (in lbs)
      const userWeightLbs = await getUserWeightLbs(prisma, userId);

      // Calculate total calories - recalculate if null and weight is available
      let totalCalories = 0;
      let hasCalculatedCalories = false;

      for (const session of sessions) {
        for (const log of session.workoutLogs) {
          // Use stored calories if available, otherwise calculate dynamically
          if (log.caloriesBurned !== null) {
            totalCalories += log.caloriesBurned;
            hasCalculatedCalories = true;
          } else if (userWeightLbs) {
            // Dynamically calculate calories using current weight (in lbs)
            const calculatedCalories = calculateCalories(
              Number(log.exercise.metValue),
              userWeightLbs,
              log.durationMinutes
            );
            if (calculatedCalories) {
              totalCalories += calculatedCalories;
              hasCalculatedCalories = true;
            }
          }
        }
      }

      const exercisesCompleted = sessions.reduce(
        (sum, session) => sum + session.workoutLogs.length,
        0
      );

      return {
        totalMinutes,
        caloriesBurned: hasCalculatedCalories ? totalCalories : 0,
        exercisesCompleted,
      };
    } catch (error) {
      log.error(
        { err: error, userId: data.userId, date: data.date },
        "Failed to fetch exercise summary"
      );
      throw new Error("Failed to fetch exercise summary");
    }
  });

/**
 * Copy previous workout as template for new workout
 */
export const copyPreviousWorkout = createServerFn({ method: "POST" })
  .inputValidator((data: CopyPreviousWorkoutInput) =>
    copyPreviousWorkoutSchema.parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const { userId, targetDate } = data;

      // Find most recent workout session before target date
      const previousSession = await prisma.workoutSession.findFirst({
        where: {
          userId,
          date: {
            lt: new Date(targetDate),
          },
        },
        include: {
          workoutLogs: {
            include: {
              exercise: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      if (!previousSession) {
        return null;
      }

      // Return session data as template (without IDs, with new date)
      return {
        sessionType: previousSession.sessionType,
        notes: previousSession.notes,
        exercises: previousSession.workoutLogs.map((log) => ({
          exerciseId: log.exerciseId,
          exerciseName: log.exercise.name,
          category: log.exercise.category,
          durationMinutes: log.durationMinutes,
          distanceKm: log.distanceKm ? Number(log.distanceKm) : undefined,
          sets: log.sets ?? undefined,
          reps: log.reps ?? undefined,
          weightLbs: log.weightLbs ? Number(log.weightLbs) : undefined,
          notes: log.notes ?? undefined,
        })),
      };
    } catch (error) {
      log.error(
        { err: error, userId: data.userId, targetDate: data.targetDate },
        "Failed to copy previous workout"
      );
      // Preserve validation error messages
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to copy previous workout");
    }
  });

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Create a new workout session with exercises
 */
export const createWorkoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: CreateWorkoutSessionInput) =>
    createWorkoutSessionSchema.parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const { userId, date, sessionType, notes, exercises } = data;

      // Server-side validation of category-specific requirements
      for (const ex of exercises) {
        const validationError = validateExerciseRequirements(
          ex.category,
          ex.durationMinutes,
          ex.sets,
          ex.reps
        );
        if (validationError) {
          throw new Error(validationError);
        }
      }

      // Get user's latest weight for calorie calculations (in lbs)
      const userWeightLbs = await getUserWeightLbs(prisma, userId);

      // Fetch exercise details for MET values
      const exerciseIds = exercises.map((ex) => ex.exerciseId);
      const exerciseDetails = await prisma.exercise.findMany({
        where: { id: { in: exerciseIds } },
        select: { id: true, metValue: true, category: true },
      });

      const exerciseMap = new Map(exerciseDetails.map((ex) => [ex.id, ex]));

      // Process each exercise to calculate duration and calories
      const processedExercises = exercises.map((ex) => {
        const exerciseDetail = exerciseMap.get(ex.exerciseId);
        if (!exerciseDetail) {
          throw new Error(`Exercise not found: ${ex.exerciseId}`);
        }

        let durationMinutes = ex.durationMinutes;

        // Auto-calculate duration for strength exercises
        if (
          exerciseDetail.category === "strength" &&
          ex.sets &&
          ex.reps &&
          !ex.durationMinutes
        ) {
          durationMinutes = estimateStrengthDuration(ex.sets, ex.reps);
        }

        // Validate that we have duration
        if (!durationMinutes) {
          throw new Error(`Duration required for exercise: ${ex.exerciseId}`);
        }

        // Calculate calories burned (using weight in lbs)
        const caloriesBurned = calculateCalories(
          Number(exerciseDetail.metValue),
          userWeightLbs,
          durationMinutes
        );

        return {
          exerciseId: ex.exerciseId,
          durationMinutes,
          caloriesBurned,
          sets: ex.sets ?? null,
          reps: ex.reps ?? null,
          weightLbs: ex.weightLbs ?? null,
          distanceKm: ex.distanceKm ?? null,
          notes: ex.notes ?? null,
        };
      });

      // Calculate session totals
      const totalMinutes = processedExercises.reduce(
        (sum, ex) => sum + ex.durationMinutes,
        0
      );

      const totalCalories = processedExercises.reduce((sum, ex) => {
        return sum + (ex.caloriesBurned ?? 0);
      }, 0);

      // Create workout session with all logs in a transaction
      const session = await prisma.$transaction(async (tx) => {
        const newSession = await tx.workoutSession.create({
          data: {
            userId,
            date: new Date(date),
            sessionType,
            totalMinutes,
            totalCalories: totalCalories > 0 ? totalCalories : null,
            notes: notes ?? null,
          },
        });

        // Create all workout logs
        await tx.workoutLog.createMany({
          data: processedExercises.map((ex) => ({
            userId,
            exerciseId: ex.exerciseId,
            workoutSessionId: newSession.id,
            date: new Date(date),
            durationMinutes: ex.durationMinutes,
            caloriesBurned: ex.caloriesBurned,
            sets: ex.sets,
            reps: ex.reps,
            weightLbs: ex.weightLbs,
            distanceKm: ex.distanceKm,
            notes: ex.notes,
          })),
        });

        return newSession;
      });

      return {
        sessionId: session.id,
        totalMinutes: session.totalMinutes,
        totalCalories: session.totalCalories,
        hasWeight: userWeightLbs !== null,
      };
    } catch (error) {
      log.error(
        { err: error, userId: data.userId },
        "Failed to create workout session"
      );
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to create workout session"
      );
    }
  });

/**
 * Update an existing workout session
 */
export const updateWorkoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateWorkoutSessionInput) =>
    updateWorkoutSessionSchema.parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const { sessionId, userId, date, sessionType, notes, exercises } = data;

      // Verify session belongs to user
      const existingSession = await prisma.workoutSession.findFirst({
        where: { id: sessionId, userId },
      });

      if (!existingSession) {
        throw new Error("Workout session not found");
      }

      // If exercises provided, recalculate everything
      if (exercises && exercises.length > 0) {
        // Get user's latest weight (in lbs)
        const userWeightLbs = await getUserWeightLbs(prisma, userId);

        // Fetch exercise details
        const exerciseIds = exercises.map((ex) => ex.exerciseId);
        const exerciseDetails = await prisma.exercise.findMany({
          where: { id: { in: exerciseIds } },
          select: { id: true, metValue: true, category: true },
        });

        const exerciseMap = new Map(exerciseDetails.map((ex) => [ex.id, ex]));

        // Process exercises
        const processedExercises = exercises.map((ex) => {
          const exerciseDetail = exerciseMap.get(ex.exerciseId);
          if (!exerciseDetail) {
            throw new Error(`Exercise not found: ${ex.exerciseId}`);
          }

          let durationMinutes = ex.durationMinutes;

          if (
            exerciseDetail.category === "strength" &&
            ex.sets &&
            ex.reps &&
            !ex.durationMinutes
          ) {
            durationMinutes = estimateStrengthDuration(ex.sets, ex.reps);
          }

          if (!durationMinutes) {
            throw new Error(`Duration required for exercise: ${ex.exerciseId}`);
          }

          const caloriesBurned = calculateCalories(
            Number(exerciseDetail.metValue),
            userWeightLbs,
            durationMinutes
          );

          return {
            exerciseId: ex.exerciseId,
            durationMinutes,
            caloriesBurned,
            sets: ex.sets ?? null,
            reps: ex.reps ?? null,
            weightLbs: ex.weightLbs ?? null,
            distanceKm: ex.distanceKm ?? null,
            notes: ex.notes ?? null,
          };
        });

        const totalMinutes = processedExercises.reduce(
          (sum, ex) => sum + ex.durationMinutes,
          0
        );

        const totalCalories = processedExercises.reduce(
          (sum, ex) => sum + (ex.caloriesBurned ?? 0),
          0
        );

        // Update session and replace all logs
        await prisma.$transaction(async (tx) => {
          // Delete existing logs
          await tx.workoutLog.deleteMany({
            where: { workoutSessionId: sessionId },
          });

          // Update session
          await tx.workoutSession.update({
            where: { id: sessionId },
            data: {
              date: date ? new Date(date) : undefined,
              sessionType: sessionType ?? undefined,
              totalMinutes,
              totalCalories: totalCalories > 0 ? totalCalories : null,
              notes: notes ?? undefined,
              updatedAt: new Date(),
            },
          });

          // Create new logs
          await tx.workoutLog.createMany({
            data: processedExercises.map((ex) => ({
              userId,
              exerciseId: ex.exerciseId,
              workoutSessionId: sessionId,
              date: date ? new Date(date) : existingSession.date,
              durationMinutes: ex.durationMinutes,
              caloriesBurned: ex.caloriesBurned,
              sets: ex.sets,
              reps: ex.reps,
              weightLbs: ex.weightLbs,
              distanceKm: ex.distanceKm,
              notes: ex.notes,
            })),
          });
        });
      } else {
        // Just update session metadata
        await prisma.workoutSession.update({
          where: { id: sessionId },
          data: {
            date: date ? new Date(date) : undefined,
            sessionType: sessionType ?? undefined,
            notes: notes ?? undefined,
            updatedAt: new Date(),
          },
        });
      }

      return { success: true };
    } catch (error) {
      log.error(
        { err: error, sessionId: data.sessionId },
        "Failed to update workout session"
      );
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to update workout session"
      );
    }
  });

/**
 * Update a single workout log
 */
export const updateWorkoutLog = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateWorkoutLogInput) =>
    updateWorkoutLogSchema.parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const { logId, userId, ...updates } = data;

      // Verify log belongs to user
      const existingLog = await prisma.workoutLog.findFirst({
        where: { id: logId, userId },
        include: { exercise: true, workoutSession: true },
      });

      if (!existingLog) {
        throw new Error("Workout log not found");
      }

      // If duration or exercise changed, recalculate calories
      let caloriesBurned = existingLog.caloriesBurned;

      if (updates.durationMinutes || updates.exerciseId) {
        // Get user's latest weight (in lbs)
        const userWeightLbs = await getUserWeightLbs(prisma, userId);

        const exerciseId = updates.exerciseId ?? existingLog.exerciseId;
        const exercise = await prisma.exercise.findUnique({
          where: { id: exerciseId },
          select: { metValue: true, category: true },
        });

        if (!exercise) {
          throw new Error("Exercise not found");
        }

        let durationMinutes =
          updates.durationMinutes ?? existingLog.durationMinutes;

        // Auto-calculate duration for strength if sets/reps provided
        if (
          exercise.category === "strength" &&
          updates.sets &&
          updates.reps &&
          !updates.durationMinutes
        ) {
          durationMinutes = estimateStrengthDuration(
            updates.sets,
            updates.reps
          );
        }

        caloriesBurned = calculateCalories(
          Number(exercise.metValue),
          userWeightLbs,
          durationMinutes
        );
      }

      // Update the log
      await prisma.workoutLog.update({
        where: { id: logId },
        data: {
          exerciseId: updates.exerciseId,
          durationMinutes: updates.durationMinutes,
          caloriesBurned,
          sets: updates.sets,
          reps: updates.reps,
          weightLbs: updates.weightLbs,
          distanceKm: updates.distanceKm,
          notes: updates.notes,
          updatedAt: new Date(),
        },
      });

      // Recalculate session totals
      const sessionLogs = await prisma.workoutLog.findMany({
        where: { workoutSessionId: existingLog.workoutSessionId },
      });

      const totalMinutes = sessionLogs.reduce(
        (sum, log) => sum + log.durationMinutes,
        0
      );

      const totalCalories = sessionLogs.reduce(
        (sum, log) => sum + (log.caloriesBurned ?? 0),
        0
      );

      await prisma.workoutSession.update({
        where: { id: existingLog.workoutSessionId },
        data: {
          totalMinutes,
          totalCalories: totalCalories > 0 ? totalCalories : null,
          updatedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      log.error(
        { err: error, logId: data.logId },
        "Failed to update workout log"
      );
      throw new Error(
        error instanceof Error ? error.message : "Failed to update workout log"
      );
    }
  });

/**
 * Delete a workout session and all its logs
 */
export const deleteWorkoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteWorkoutSessionInput) =>
    deleteWorkoutSessionSchema.parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const { sessionId, userId } = data;

      // Verify session belongs to user
      const session = await prisma.workoutSession.findFirst({
        where: { id: sessionId, userId },
      });

      if (!session) {
        throw new Error("Workout session not found");
      }

      // Delete session (logs will be cascade deleted)
      await prisma.workoutSession.delete({
        where: { id: sessionId },
      });

      return { success: true };
    } catch (error) {
      log.error(
        { err: error, sessionId: data.sessionId },
        "Failed to delete workout session"
      );
      // Preserve validation error messages
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete workout session");
    }
  });

/**
 * Delete a single workout log from a session
 */
export const deleteWorkoutLog = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteWorkoutLogInput) =>
    deleteWorkoutLogSchema.parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const { logId, userId } = data;

      // Verify log belongs to user
      const log = await prisma.workoutLog.findFirst({
        where: { id: logId, userId },
      });

      if (!log) {
        throw new Error("Workout log not found");
      }

      const sessionId = log.workoutSessionId;

      // Delete the log
      await prisma.workoutLog.delete({
        where: { id: logId },
      });

      // Recalculate session totals
      const remainingLogs = await prisma.workoutLog.findMany({
        where: { workoutSessionId: sessionId },
      });

      if (remainingLogs.length === 0) {
        // If no logs remain, delete the session
        await prisma.workoutSession.delete({
          where: { id: sessionId },
        });
      } else {
        // Update session totals
        const totalMinutes = remainingLogs.reduce(
          (sum, log) => sum + log.durationMinutes,
          0
        );

        const totalCalories = remainingLogs.reduce(
          (sum, log) => sum + (log.caloriesBurned ?? 0),
          0
        );

        await prisma.workoutSession.update({
          where: { id: sessionId },
          data: {
            totalMinutes,
            totalCalories: totalCalories > 0 ? totalCalories : null,
            updatedAt: new Date(),
          },
        });
      }

      return { success: true };
    } catch (error) {
      log.error(
        { err: error, logId: data.logId },
        "Failed to delete workout log"
      );
      // Preserve validation error messages
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete workout log");
    }
  });
