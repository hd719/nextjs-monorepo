import { z } from "zod";

// Achievement types

export type AchievementCategory = "logging" | "streaks" | "goals" | "exercise";

// Zod schema for runtime validation of JSON requirement data
export const achievementRequirementSchema = z.object({
  type: z.enum(["count", "streak", "goal"]),
  target: z.number(),
  metric: z.string().optional(),
});

export type AchievementRequirement = z.infer<
  typeof achievementRequirementSchema
>;

/**
 * Safely parse achievement requirement from Prisma JSON field
 * Returns a default requirement if parsing fails
 */
export function parseAchievementRequirement(
  data: unknown
): AchievementRequirement {
  const result = achievementRequirementSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  // Return a sensible default if parsing fails
  console.warn("Invalid achievement requirement data:", data);
  return { type: "count", target: 1 };
}

export interface AchievementDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  points: number;
}

export interface UserAchievementData {
  id: string;
  achievementId: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  points: number;
  unlockedAt: string;
}

export interface AchievementProgress {
  achievement: AchievementDefinition;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  target: number;
}

export interface AchievementSummary {
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
  recentUnlocks: UserAchievementData[];
}

// Default achievement definitions for seeding
export const ACHIEVEMENT_DEFINITIONS: Omit<AchievementDefinition, "id">[] = [
  {
    key: "first_meal",
    name: "First Bite",
    description: "Log your first meal",
    icon: "utensils",
    category: "logging",
    requirement: { type: "count", target: 1, metric: "meals" },
    points: 10,
  },
  {
    key: "streak_7",
    name: "Week Warrior",
    description: "7-day logging streak",
    icon: "flame",
    category: "streaks",
    requirement: { type: "streak", target: 7, metric: "logging" },
    points: 25,
  },
  {
    key: "streak_30",
    name: "Monthly Master",
    description: "30-day logging streak",
    icon: "trophy",
    category: "streaks",
    requirement: { type: "streak", target: 30, metric: "logging" },
    points: 100,
  },
  {
    key: "calorie_goal_7",
    name: "On Target",
    description: "Hit your calorie goal 7 days in a row",
    icon: "target",
    category: "goals",
    requirement: { type: "streak", target: 7, metric: "calorie" },
    points: 50,
  },
  {
    key: "first_workout",
    name: "Getting Moving",
    description: "Log your first workout",
    icon: "dumbbell",
    category: "exercise",
    requirement: { type: "count", target: 1, metric: "workouts" },
    points: 10,
  },
  {
    key: "water_goal_7",
    name: "Hydrated",
    description: "Hit your water goal 7 days in a row",
    icon: "droplets",
    category: "goals",
    requirement: { type: "streak", target: 7, metric: "water" },
    points: 25,
  },
  {
    key: "exercise_streak_7",
    name: "Fitness Fanatic",
    description: "Exercise 7 days in a row",
    icon: "zap",
    category: "exercise",
    requirement: { type: "streak", target: 7, metric: "exercise" },
    points: 50,
  },
  {
    key: "meals_100",
    name: "Centurion",
    description: "Log 100 meals",
    icon: "medal",
    category: "logging",
    requirement: { type: "count", target: 100, metric: "meals" },
    points: 75,
  },
];
