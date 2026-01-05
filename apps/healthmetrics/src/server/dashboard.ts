import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import type { Activity, MealEntry, WaterIntake } from "@/types/nutrition";
import { MEAL_TYPES, type MealType } from "@/constants/defaults";

function normalizeMealType(value: string): MealType | null {
  if (MEAL_TYPES.includes(value as MealType)) {
    return value as MealType;
  }
  if (value === "other") {
    return "snack";
  }
  return null;
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 60) {
    return "just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function formatWeight(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export const getDashboardMeals = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(async ({ data: { userId, date } }): Promise<MealEntry[]> => {
    try {
      const dateObj = new Date(date + "T00:00:00.000Z");

      const entries = await prisma.diaryEntry.findMany({
        where: { userId, date: dateObj },
        include: { foodItem: true },
        orderBy: [{ mealType: "asc" }, { createdAt: "asc" }],
      });

      const meals = new Map<MealType, MealEntry>();

      for (const entry of entries) {
        const mealType = normalizeMealType(entry.mealType);
        if (!mealType) {
          continue;
        }

        const quantityG = Number(entry.quantityG);
        const servings = Number(entry.servings);
        const caloriesPer100g = Number(entry.foodItem.caloriesPer100g);
        const proteinPer100g = Number(entry.foodItem.proteinG);
        const carbsPer100g = Number(entry.foodItem.carbsG);
        const fatPer100g = Number(entry.foodItem.fatG);

        const calories = Math.round((caloriesPer100g * quantityG) / 100);
        const protein = Math.round((proteinPer100g * quantityG) / 100);
        const carbs = Math.round((carbsPer100g * quantityG) / 100);
        const fat = Math.round((fatPer100g * quantityG) / 100);

        const quantityLabel = `${quantityG}g${
          servings && servings !== 1 ? ` (${servings} servings)` : ""
        }`;

        const food = {
          id: entry.id,
          name: entry.foodItem.name,
          quantity: quantityLabel,
          calories,
          protein,
          carbs,
          fat,
        };

        const existing = meals.get(mealType);
        if (existing) {
          existing.foods.push(food);
          existing.totalCalories += calories;
        } else {
          meals.set(mealType, {
            id: `meal-${mealType}-${date}`,
            type: mealType,
            foods: [food],
            totalCalories: calories,
          });
        }
      }

      return MEAL_TYPES.map((mealType) => meals.get(mealType)).filter(
        (meal): meal is MealEntry => Boolean(meal && meal.foods.length > 0)
      );
    } catch (error) {
      console.error("Failed to fetch dashboard meals:", error);
      throw new Error("Failed to fetch dashboard meals");
    }
  });

export const getRecentActivity = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; limit?: number }) => data)
  .handler(async ({ data: { userId, limit = 10 } }): Promise<Activity[]> => {
    try {
      const [workouts, weights] = await Promise.all([
        prisma.workoutSession.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: limit,
          include: {
            _count: { select: { workoutLogs: true } },
          },
        }),
        prisma.weightEntry.findMany({
          where: { userId, weightLbs: { not: null } },
          orderBy: { createdAt: "desc" },
          take: limit,
        }),
      ]);

      const workoutActivities: Activity[] = workouts.map((session) => ({
        id: session.id,
        type: "exercise",
        description: `Logged workout (${session._count.workoutLogs} ${
          session._count.workoutLogs === 1 ? "exercise" : "exercises"
        })`,
        timestamp: session.createdAt.toISOString(),
        timeAgo: formatTimeAgo(session.createdAt),
        calories: session.totalCalories ?? undefined,
        duration: session.totalMinutes
          ? `${session.totalMinutes} min`
          : undefined,
      }));

      const weightActivities: Activity[] = weights.map((entry) => {
        const weightValue = Number(entry.weightLbs);
        return {
          id: entry.id,
          type: "weight",
          description: `Logged weight: ${formatWeight(weightValue)} lbs`,
          timestamp: entry.createdAt.toISOString(),
          timeAgo: formatTimeAgo(entry.createdAt),
        };
      });

      return [...workoutActivities, ...weightActivities]
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      throw new Error("Failed to fetch recent activity");
    }
  });

export const getWaterIntake = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(async ({ data: { date } }): Promise<WaterIntake> => {
    return {
      current: 0,
      goal: 8,
      date,
    };
  });
