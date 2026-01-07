import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import type {
  OnboardingState,
  OnboardingStepData,
  NutritionGoals,
  NutritionCalculationInput,
} from "@/types/onboarding";
import { calculateNutritionGoals, lbsToKg, calculateAge } from "@/utils";
import { saveWeightEntry } from "./weight";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

type UserWithWeightEntries = {
  goalType: string | null;
  heightCm: { toString(): string } | null;
  dateOfBirth: Date | null;
  gender: string | null;
  activityLevel: string | null;
  dailyCalorieGoal: number | null;
  dailyProteinGoalG: number | null;
  dailyCarbGoalG: number | null;
  dailyFatGoalG: number | null;
  targetWeightLbs: { toString(): string } | null;
  unitsPreference: string;
  dailyWaterGoal: number;
  dailyStepGoal: number;
  timezone: string;
  weightEntries: Array<{ weightLbs: { toString(): string } | null }>;
};

/**
 * Transform user profile data into onboarding step data
 * Cleanly maps database fields to the onboarding data structure
 */
function buildOnboardingData(user: UserWithWeightEntries): OnboardingStepData {
  const currentWeight = user.weightEntries[0]?.weightLbs;

  return {
    // Optional fields - only include if present
    goalType: (user.goalType as OnboardingStepData["goalType"]) ?? undefined,
    heightCm: user.heightCm ? Number(user.heightCm) : undefined,
    currentWeightLbs: currentWeight ? Number(currentWeight) : undefined,
    dateOfBirth: user.dateOfBirth?.toISOString().split("T")[0],
    gender: (user.gender as OnboardingStepData["gender"]) ?? undefined,
    activityLevel:
      (user.activityLevel as OnboardingStepData["activityLevel"]) ?? undefined,
    dailyCalorieGoal: user.dailyCalorieGoal ?? undefined,
    dailyProteinGoalG: user.dailyProteinGoalG ?? undefined,
    dailyCarbGoalG: user.dailyCarbGoalG ?? undefined,
    dailyFatGoalG: user.dailyFatGoalG ?? undefined,
    targetWeightLbs: user.targetWeightLbs
      ? Number(user.targetWeightLbs)
      : undefined,
    // Required fields - always include
    unitsPreference:
      user.unitsPreference as OnboardingStepData["unitsPreference"],
    dailyWaterGoal: user.dailyWaterGoal,
    dailyStepGoal: user.dailyStepGoal,
    timezone: user.timezone,
  };
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get onboarding state for a user
 * Returns current step, data collected so far, and completion status
 */
export const getOnboardingState = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<OnboardingState> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          onboardingCompleted: true,
          onboardingStep: true,
          onboardingSkippedAt: true,
          goalType: true,
          heightCm: true,
          dateOfBirth: true,
          gender: true,
          activityLevel: true,
          dailyCalorieGoal: true,
          dailyProteinGoalG: true,
          dailyCarbGoalG: true,
          dailyFatGoalG: true,
          targetWeightLbs: true,
          unitsPreference: true,
          dailyWaterGoal: true,
          dailyStepGoal: true,
          timezone: true,
          weightEntries: {
            orderBy: { date: "desc" },
            take: 1,
            select: { weightLbs: true },
          },
        },
      });

      if (!user) {
        return {
          currentStep: 0,
          data: {},
          completed: false,
          skippedAt: null,
        };
      }

      return {
        currentStep: user.onboardingStep,
        data: buildOnboardingData(user),
        completed: user.onboardingCompleted,
        skippedAt: user.onboardingSkippedAt?.toISOString() || null,
      };
    } catch (error) {
      console.error("Failed to fetch onboarding state:", error);
      throw new Error("Failed to fetch onboarding state");
    }
  });

/**
 * Check if user needs onboarding
 * Quick check for redirect logic
 * Returns false if completed OR skipped
 */
export const checkOnboardingRequired = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<{ required: boolean }> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          onboardingCompleted: true,
          onboardingSkippedAt: true,
        },
      });

      // Not required if completed OR skipped
      const isCompleted = user?.onboardingCompleted ?? false;
      const isSkipped = user?.onboardingSkippedAt !== null;

      return { required: !isCompleted && !isSkipped };
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      return { required: false };
    }
  });

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Save onboarding step data
 * Updates user profile and advances step counter
 */
export const saveOnboardingStep = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { userId: string; step: number; data: OnboardingStepData }) => data
  )
  .handler(
    async ({
      data: { userId, step, data: stepData },
    }): Promise<{ success: boolean; nextStep: number }> => {
      try {
        // Build update object based on step data
        const updateData: Record<string, unknown> = {
          onboardingStep: step,
        };

        // Step 1: Goal
        if (stepData.goalType) {
          updateData.goalType = stepData.goalType;
        }

        // Step 2: Measurements
        if (stepData.heightCm) {
          updateData.heightCm = stepData.heightCm;
        }
        if (stepData.dateOfBirth) {
          updateData.dateOfBirth = new Date(stepData.dateOfBirth);
        }
        if (stepData.gender) {
          updateData.gender = stepData.gender;
        }
        if (stepData.activityLevel) {
          updateData.activityLevel = stepData.activityLevel;
        }

        // Step 3: Goals
        if (stepData.dailyCalorieGoal) {
          updateData.dailyCalorieGoal = stepData.dailyCalorieGoal;
        }
        if (stepData.dailyProteinGoalG) {
          updateData.dailyProteinGoalG = stepData.dailyProteinGoalG;
        }
        if (stepData.dailyCarbGoalG) {
          updateData.dailyCarbGoalG = stepData.dailyCarbGoalG;
        }
        if (stepData.dailyFatGoalG) {
          updateData.dailyFatGoalG = stepData.dailyFatGoalG;
        }
        if (stepData.targetWeightLbs) {
          updateData.targetWeightLbs = stepData.targetWeightLbs;
        }

        // Step 4: Preferences
        if (stepData.unitsPreference) {
          updateData.unitsPreference = stepData.unitsPreference;
        }
        if (stepData.dailyWaterGoal) {
          updateData.dailyWaterGoal = stepData.dailyWaterGoal;
        }
        if (stepData.dailyStepGoal) {
          updateData.dailyStepGoal = stepData.dailyStepGoal;
        }
        if (stepData.timezone) {
          updateData.timezone = stepData.timezone;
        }

        // Update user profile
        await prisma.user.update({
          where: { id: userId },
          data: updateData,
        });

        // Handle weight entry separately (Step 2)
        if (stepData.currentWeightLbs) {
          await saveWeightEntry({
            data: {
              userId,
              weightLbs: stepData.currentWeightLbs,
              notes: "Initial weight from onboarding",
            },
          });
        }

        return { success: true, nextStep: step + 1 };
      } catch (error) {
        console.error("Failed to save onboarding step:", error);
        throw new Error("Failed to save onboarding step");
      }
    }
  );

/**
 * Calculate personalized nutrition goals
 * Uses Mifflin-St Jeor equation for BMR
 */
export const calculateGoals = createServerFn({ method: "POST" })
  .inputValidator((data: NutritionCalculationInput) => data)
  .handler(async ({ data }): Promise<NutritionGoals> => {
    try {
      return calculateNutritionGoals(data);
    } catch (error) {
      console.error("Failed to calculate goals:", error);
      throw new Error("Failed to calculate nutrition goals");
    }
  });

/**
 * Calculate goals from existing onboarding data
 * Convenience function that fetches user data and calculates
 */
export const calculateGoalsFromProfile = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<NutritionGoals | null> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          heightCm: true,
          dateOfBirth: true,
          gender: true,
          activityLevel: true,
          goalType: true,
          weightEntries: {
            orderBy: { date: "desc" },
            take: 1,
            select: { weightLbs: true },
          },
        },
      });

      if (
        !user ||
        !user.heightCm ||
        !user.dateOfBirth ||
        !user.gender ||
        !user.activityLevel ||
        !user.goalType ||
        !user.weightEntries[0]
      ) {
        return null;
      }

      const weightKg = lbsToKg(Number(user.weightEntries[0].weightLbs));
      const age = calculateAge(new Date(user.dateOfBirth));

      const input: NutritionCalculationInput = {
        heightCm: Number(user.heightCm),
        weightKg,
        age,
        gender: user.gender as "male" | "female" | "other",
        activityLevel:
          user.activityLevel as NutritionCalculationInput["activityLevel"],
        goalType: user.goalType as NutritionCalculationInput["goalType"],
      };

      return calculateNutritionGoals(input);
    } catch (error) {
      console.error("Failed to calculate goals from profile:", error);
      return null;
    }
  });

/**
 * Complete onboarding
 * Sets onboardingCompleted = true
 */
export const completeOnboarding = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<{ success: boolean }> => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
          onboardingSkippedAt: null, // Clear skip if they complete later
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      throw new Error("Failed to complete onboarding");
    }
  });

/**
 * Skip onboarding
 * Records skip timestamp for re-engagement
 */
export const skipOnboarding = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<{ success: boolean }> => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          onboardingSkippedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      throw new Error("Failed to skip onboarding");
    }
  });

/**
 * Reset onboarding (DEV ONLY)
 * Clears onboarding state so user can go through flow again
 */
export const resetOnboarding = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<{ success: boolean }> => {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      throw new Error("Reset onboarding is only available in development");
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          onboardingCompleted: false,
          onboardingStep: 0,
          onboardingSkippedAt: null,
          onboardingCompletedAt: null,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to reset onboarding:", error);
      throw new Error("Failed to reset onboarding");
    }
  });
