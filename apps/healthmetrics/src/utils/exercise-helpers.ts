/**
 * Shared domain helpers for exercise calculations
 * These are used by both server functions and UI components
 */

import type { PrismaClient } from "../../prisma/generated/client";

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Calculate calories burned using MET formula
 * Formula: MET × weight (kg) × duration (hours)
 * @param metValue - MET value of the exercise
 * @param weightLbs - User's weight in pounds (will be converted to kg internally)
 * @param durationMinutes - Duration of exercise in minutes
 * @returns Calories burned, or null if weight is invalid
 */
export function calculateCalories(
  metValue: number,
  weightLbs: number | null,
  durationMinutes: number
): number | null {
  if (!weightLbs || weightLbs <= 0) return null;
  // Convert lbs to kg for MET formula (1 lb = 0.453592 kg)
  const weightKg = weightLbs * 0.453592;
  return Math.round(metValue * weightKg * (durationMinutes / 60));
}

/**
 * Auto-estimate duration for strength training exercises
 * Formula: (sets × reps × 3 seconds per rep) + ((sets - 1) × 60 seconds rest)
 * @param sets - Number of sets
 * @param reps - Number of reps per set
 * @returns Duration in minutes (rounded up)
 */
export function estimateStrengthDuration(sets: number, reps: number): number {
  const workTimeSeconds = sets * reps * 3; // 3 seconds per rep
  const restTimeSeconds = (sets - 1) * 60; // 60 seconds rest between sets
  const totalSeconds = workTimeSeconds + restTimeSeconds;
  return Math.ceil(totalSeconds / 60); // Convert to minutes, round up
}

// ============================================================================
// DATA LOOKUP HELPERS
// ============================================================================

/**
 * Get user's weight in pounds
 * Tries weight entries first, falls back to profile target weight
 * @param prisma - Prisma client instance
 * @param userId - User ID to look up weight for
 * @returns Weight in pounds, or null if no weight data available
 */
export async function getUserWeightLbs(
  prisma: PrismaClient,
  userId: string
): Promise<number | null> {
  // Try weight entries first (most recent)
  const latestWeight = await prisma.weightEntry.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { weightLbs: true },
  });

  if (latestWeight?.weightLbs) {
    return Number(latestWeight.weightLbs);
  }

  // Fallback to profile target weight
  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    select: { targetWeightLbs: true },
  });

  return userProfile?.targetWeightLbs
    ? Number(userProfile.targetWeightLbs)
    : null;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate category-specific exercise requirements
 * @param category - Exercise category
 * @param durationMinutes - Duration in minutes (required for cardio)
 * @param sets - Number of sets (required for strength)
 * @param reps - Number of reps (required for strength)
 * @returns Error message if validation fails, null if valid
 */
export function validateExerciseRequirements(
  category: string,
  durationMinutes?: number,
  sets?: number,
  reps?: number
): string | null {
  // Cardio requires duration
  if (category === "cardio" && !durationMinutes) {
    return "Duration is required for cardio exercises";
  }

  // Strength requires sets and reps
  if (category === "strength" && (!sets || !reps)) {
    return "Sets and reps are required for strength exercises";
  }

  // Flexibility, sports, and other also require duration
  if (
    (category === "flexibility" ||
      category === "sports" ||
      category === "other") &&
    !durationMinutes
  ) {
    return "Duration is required for this exercise type";
  }

  return null;
}
