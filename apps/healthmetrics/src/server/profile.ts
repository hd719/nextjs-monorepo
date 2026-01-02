import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import {
  updateUserProfileSchema,
  type UpdateUserProfileInput,
} from "@/lib/validation";
import { getLatestWeight, saveWeightEntry } from "./weight";

// ============================================================================
// TYPES
// ============================================================================

export type UserProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  heightCm: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  activityLevel: string | null;
  goalType: string | null;
  dailyCalorieGoal: number | null;
  dailyProteinGoalG: number | null;
  dailyCarbGoalG: number | null;
  dailyFatGoalG: number | null;
  unitsPreference: string;
  timezone: string;
  isAdmin: boolean;
  createdAt: string; // ISO string for serialization
  updatedAt: string; // ISO string for serialization
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get user profile by user ID
 * Returns null if profile doesn't exist
 */
export const getUserProfile = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }): Promise<UserProfile | null> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          authUser: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      // Get latest weight entry
      const latestWeight = await getLatestWeight({ data: { userId } });

      return {
        id: user.id,
        email: user.authUser?.email || null,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        heightCm: user.heightCm ? Number(user.heightCm) : null,
        currentWeightKg: latestWeight?.weightKg || null,
        targetWeightKg: user.targetWeightKg
          ? Number(user.targetWeightKg)
          : null,
        activityLevel: user.activityLevel,
        goalType: user.goalType,
        dailyCalorieGoal: user.dailyCalorieGoal,
        dailyProteinGoalG: user.dailyProteinGoalG,
        dailyCarbGoalG: user.dailyCarbGoalG,
        dailyFatGoalG: user.dailyFatGoalG,
        unitsPreference: user.unitsPreference,
        timezone: user.timezone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  });

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Update user profile
 * Only updates fields that are provided
 */
export const updateUserProfile = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { userId: string; updates: UpdateUserProfileInput }) => {
      // Validate the updates object
      updateUserProfileSchema.parse(data.updates);
      return data;
    }
  )
  .handler(async ({ data: { userId, updates } }): Promise<UserProfile> => {
    try {
      // Field mapping: input field -> { dbField, transform? }
      const fieldMapping: Record<
        string,
        { dbField: string; transform?: (value: any) => any }
      > = {
        displayName: { dbField: "displayName" },
        avatarUrl: { dbField: "avatarUrl" },
        timezone: { dbField: "timezone" },
        dailyCalorieGoal: { dbField: "dailyCalorieGoal" },
        dailyProteinGoalG: { dbField: "dailyProteinGoalG" },
        dailyCarbGoalG: { dbField: "dailyCarbGoalG" },
        dailyFatGoalG: { dbField: "dailyFatGoalG" },
        heightInches: {
          dbField: "heightCm",
          transform: (inches: number) => inches * 2.54, // inches to cm
        },
        // currentWeightLbs handled separately via WeightEntry
        targetWeightLbs: {
          dbField: "targetWeightKg",
          transform: (lbs: number) => lbs * 0.453592, // lbs to kg
        },
        targetWeightKg: { dbField: "targetWeightKg" },
        dateOfBirth: {
          dbField: "dateOfBirth",
          transform: (date: string) => new Date(date),
        },
        gender: {
          dbField: "gender",
          transform: (gender: string) => gender.toUpperCase(), // Match enum
        },
        activityLevel: { dbField: "activityLevel" },
        goalType: { dbField: "goalType" },
      };

      // Build update object dynamically
      const updateData: any = {};
      for (const [key, config] of Object.entries(fieldMapping)) {
        const value = (updates as any)[key];
        if (value !== undefined) {
          updateData[config.dbField] = config.transform
            ? config.transform(value)
            : value;
        }
      }

      // Handle current weight separately - create WeightEntry
      if (updates.currentWeightLbs !== undefined) {
        await saveWeightEntry({
          data: {
            userId,
            weightLbs: updates.currentWeightLbs,
            notes: "Updated from profile",
          },
        });
      }

      // Update user profile
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          authUser: {
            select: {
              email: true,
            },
          },
        },
      });

      // Get latest weight after update
      const latestWeight = await getLatestWeight({ data: { userId } });

      return {
        id: user.id,
        email: user.authUser?.email || null,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        heightCm: user.heightCm ? Number(user.heightCm) : null,
        currentWeightKg: latestWeight?.weightKg || null,
        targetWeightKg: user.targetWeightKg
          ? Number(user.targetWeightKg)
          : null,
        activityLevel: user.activityLevel,
        goalType: user.goalType,
        dailyCalorieGoal: user.dailyCalorieGoal,
        dailyProteinGoalG: user.dailyProteinGoalG,
        dailyCarbGoalG: user.dailyCarbGoalG,
        dailyFatGoalG: user.dailyFatGoalG,
        unitsPreference: user.unitsPreference,
        timezone: user.timezone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw new Error("Failed to update user profile");
    }
  });
