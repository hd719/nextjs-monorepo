import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { signCdnUrl } from "@/lib/cdn";
import { deleteFile } from "@/lib/storage";
import {
  updateUserProfileSchema,
  type UpdateUserProfileInput,
} from "@/utils/validation";
import type { UserProfile } from "@/types/profile";
import { getLatestWeight, saveWeightEntry } from "./weight";

const log = createLogger("server:profile");

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
      let signedAvatarUrl: string | null = null;
      if (user.avatarKey) {
        try {
          signedAvatarUrl = signCdnUrl(user.avatarKey);
        } catch (error) {
          log.error({ err: error, userId }, "Failed to sign avatar URL");
        }
      }

      return {
        id: user.id,
        email: user.authUser?.email || null,
        displayName: user.displayName,
        avatarUrl: signedAvatarUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        heightCm: user.heightCm ? Number(user.heightCm) : null,
        currentWeightLbs: latestWeight?.weightLbs || null,
        targetWeightLbs: user.targetWeightLbs
          ? Number(user.targetWeightLbs)
          : null,
        activityLevel: user.activityLevel,
        goalType: user.goalType,
        dailyCalorieGoal: user.dailyCalorieGoal,
        dailyProteinGoalG: user.dailyProteinGoalG,
        dailyCarbGoalG: user.dailyCarbGoalG,
        dailyFatGoalG: user.dailyFatGoalG,
        dailyWaterGoal: user.dailyWaterGoal,
        dailyStepGoal: user.dailyStepGoal,
        unitsPreference: user.unitsPreference,
        timezone: user.timezone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        defaultFastingProtocolId: user.defaultFastingProtocolId,
        fastingGoalPerWeek: user.fastingGoalPerWeek,
      };
    } catch (error) {
      log.error({ err: error, userId }, "Failed to fetch user profile");
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
      // Transform accepts unknown since we verify the value type at runtime
      type FieldConfig = {
        dbField: string;
        transform?: (value: unknown) => unknown;
      };

      type UpdateKey = keyof UpdateUserProfileInput;

      const fieldMapping: Partial<Record<UpdateKey, FieldConfig>> = {
        displayName: { dbField: "displayName" },
        avatarKey: { dbField: "avatarKey" },
        timezone: { dbField: "timezone" },
        dailyCalorieGoal: { dbField: "dailyCalorieGoal" },
        dailyProteinGoalG: { dbField: "dailyProteinGoalG" },
        dailyCarbGoalG: { dbField: "dailyCarbGoalG" },
        dailyFatGoalG: { dbField: "dailyFatGoalG" },
        dailyWaterGoal: { dbField: "dailyWaterGoal" },
        dailyStepGoal: { dbField: "dailyStepGoal" },
        heightInches: {
          dbField: "heightCm",
          transform: (inches) => (inches as number) * 2.54,
        },
        // currentWeightLbs handled separately via WeightEntry
        targetWeightLbs: { dbField: "targetWeightLbs" },
        dateOfBirth: {
          dbField: "dateOfBirth",
          transform: (date) => new Date(date as string),
        },
        gender: {
          dbField: "gender",
          transform: (gender) => (gender as string).toLowerCase(),
        },
        activityLevel: { dbField: "activityLevel" },
        goalType: { dbField: "goalType" },
      };

      // Build update object dynamically
      const updateData: Record<string, unknown> = {};
      for (const [key, config] of Object.entries(fieldMapping) as [
        UpdateKey,
        FieldConfig,
      ][]) {
        if (!config) {
          continue;
        }
        const value = updates[key];
        if (value !== undefined) {
          updateData[config.dbField] = config.transform
            ? config.transform(value)
            : value;
        }
      }

      // If avatar key is being updated, delete old avatar object
      if (updates.avatarKey) {
        const existing = await prisma.user.findUnique({
          where: { id: userId },
          select: { avatarKey: true },
        });

        if (existing?.avatarKey && existing.avatarKey !== updates.avatarKey) {
          try {
            await deleteFile(existing.avatarKey);
          } catch (error) {
            log.warn({ err: error, userId }, "Failed to delete old avatar");
          }
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
      let signedAvatarUrl: string | null = null;
      if (user.avatarKey) {
        try {
          signedAvatarUrl = signCdnUrl(user.avatarKey);
        } catch (error) {
          log.error({ err: error, userId }, "Failed to sign avatar URL");
        }
      }

      return {
        id: user.id,
        email: user.authUser?.email || null,
        displayName: user.displayName,
        avatarUrl: signedAvatarUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        heightCm: user.heightCm ? Number(user.heightCm) : null,
        currentWeightLbs: latestWeight?.weightLbs || null,
        targetWeightLbs: user.targetWeightLbs
          ? Number(user.targetWeightLbs)
          : null,
        activityLevel: user.activityLevel,
        goalType: user.goalType,
        dailyCalorieGoal: user.dailyCalorieGoal,
        dailyProteinGoalG: user.dailyProteinGoalG,
        dailyCarbGoalG: user.dailyCarbGoalG,
        dailyFatGoalG: user.dailyFatGoalG,
        dailyWaterGoal: user.dailyWaterGoal,
        dailyStepGoal: user.dailyStepGoal,
        unitsPreference: user.unitsPreference,
        timezone: user.timezone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        defaultFastingProtocolId: user.defaultFastingProtocolId,
        fastingGoalPerWeek: user.fastingGoalPerWeek,
      };
    } catch (error) {
      log.error({ err: error, userId }, "Failed to update user profile");
      // Preserve validation error messages
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update user profile");
    }
  });
