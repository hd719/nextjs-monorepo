import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import {
  createDiaryEntrySchema,
  searchFoodItemsSchema,
  type CreateDiaryEntryInput,
} from "@/lib/validation";

// Helper to convert number to Prisma Decimal
function toDecimal(value: number): any {
  return value;
}

// ============================================================================
// TYPES
// ============================================================================

export type DiaryEntryWithFood = {
  id: string;
  userId: string;
  date: Date;
  mealType: string;
  quantityG: number;
  servings: number;
  notes: string | null;
  createdAt: Date;
  foodItem: {
    id: string;
    name: string;
    brand: string | null;
    caloriesPer100g: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number | null;
    sugarG: number | null;
    servingSizeG: number;
    servingSizeUnit: string | null;
  };
  // Computed nutrition for this entry
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  entryCount: number;
};

export type FoodItemSearchResult = {
  id: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number | null;
  servingSizeG: number;
  servingSizeUnit: string | null;
  verified: boolean;
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all diary entries for a specific user and date
 * Returns entries grouped by meal type with computed nutrition
 */
export const getDiaryDay = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(
    async ({ data: { userId, date } }): Promise<DiaryEntryWithFood[]> => {
      try {
        // Parse date string to Date object (YYYY-MM-DD format)
        const dateObj = new Date(date + "T00:00:00.000Z");

        // Fetch entries with food item details
        const entries = await prisma.diaryEntry.findMany({
          where: {
            userId,
            date: dateObj,
          },
          include: {
            foodItem: true,
          },
          orderBy: [{ mealType: "asc" }, { createdAt: "asc" }],
        });

        // Transform to include computed nutrition
        return entries.map((entry) => {
          const quantityG = Number(entry.quantityG);
          const caloriesPer100g = Number(entry.foodItem.caloriesPer100g);
          const proteinPer100g = Number(entry.foodItem.proteinG);
          const carbsPer100g = Number(entry.foodItem.carbsG);
          const fatPer100g = Number(entry.foodItem.fatG);

          // Calculate nutrition based on quantity
          const calories = (caloriesPer100g * quantityG) / 100;
          const protein = (proteinPer100g * quantityG) / 100;
          const carbs = (carbsPer100g * quantityG) / 100;
          const fat = (fatPer100g * quantityG) / 100;

          return {
            id: entry.id,
            userId: entry.userId,
            date: entry.date,
            mealType: entry.mealType,
            quantityG: quantityG,
            servings: Number(entry.servings),
            notes: entry.notes,
            createdAt: entry.createdAt,
            foodItem: {
              id: entry.foodItem.id,
              name: entry.foodItem.name,
              brand: entry.foodItem.brand,
              caloriesPer100g: caloriesPer100g,
              proteinG: proteinPer100g,
              carbsG: carbsPer100g,
              fatG: fatPer100g,
              fiberG: entry.foodItem.fiberG
                ? Number(entry.foodItem.fiberG)
                : null,
              sugarG: entry.foodItem.sugarG
                ? Number(entry.foodItem.sugarG)
                : null,
              servingSizeG: Number(entry.foodItem.servingSizeG),
              servingSizeUnit: entry.foodItem.servingSizeUnit,
            },
            calories: Math.round(calories),
            protein: Math.round(protein * 10) / 10,
            carbs: Math.round(carbs * 10) / 10,
            fat: Math.round(fat * 10) / 10,
          };
        });
      } catch (error) {
        console.error("Failed to fetch diary day:", error);
        throw new Error("Failed to fetch diary entries");
      }
    }
  );

/**
 * Get daily totals for a specific user and date
 * Aggregates all nutrition values for the day
 */
export const getDailyTotals = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; date: string }) => data)
  .handler(async ({ data: { userId, date } }): Promise<DailyTotals> => {
    try {
      // Parse date string to Date object
      const dateObj = new Date(date + "T00:00:00.000Z");

      // Fetch all entries for the day with food details
      const entries = await prisma.diaryEntry.findMany({
        where: {
          userId,
          date: dateObj,
        },
        include: {
          foodItem: true,
        },
      });

      // Calculate totals
      const totals = entries.reduce(
        (acc, entry) => {
          const quantityG = Number(entry.quantityG);
          const caloriesPer100g = Number(entry.foodItem.caloriesPer100g);
          const proteinPer100g = Number(entry.foodItem.proteinG);
          const carbsPer100g = Number(entry.foodItem.carbsG);
          const fatPer100g = Number(entry.foodItem.fatG);
          const fiberPer100g = entry.foodItem.fiberG
            ? Number(entry.foodItem.fiberG)
            : 0;

          // Add to totals
          acc.calories += (caloriesPer100g * quantityG) / 100;
          acc.protein += (proteinPer100g * quantityG) / 100;
          acc.carbs += (carbsPer100g * quantityG) / 100;
          acc.fat += (fatPer100g * quantityG) / 100;
          acc.fiber += (fiberPer100g * quantityG) / 100;
          acc.entryCount += 1;

          return acc;
        },
        {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          entryCount: 0,
        }
      );

      // Round values for display
      return {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        fiber: Math.round(totals.fiber * 10) / 10,
        entryCount: totals.entryCount,
      };
    } catch (error) {
      console.error("Failed to fetch daily totals:", error);
      throw new Error("Failed to calculate daily totals");
    }
  });

/**
 * Search for food items by name
 * Returns matching foods from the shared database
 */
export const searchFoodItems = createServerFn({ method: "GET" })
  .inputValidator((data: { query: string; limit?: number }) => {
    return searchFoodItemsSchema.parse(data);
  })
  .handler(
    async ({
      data: { query, limit = 10 },
    }): Promise<FoodItemSearchResult[]> => {
      try {
        const foods = await prisma.foodItem.findMany({
          where: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          orderBy: [{ verified: "desc" }, { name: "asc" }],
          take: limit,
        });

        return foods.map((food) => ({
          id: food.id,
          name: food.name,
          brand: food.brand,
          caloriesPer100g: Number(food.caloriesPer100g),
          proteinG: Number(food.proteinG),
          carbsG: Number(food.carbsG),
          fatG: Number(food.fatG),
          fiberG: food.fiberG ? Number(food.fiberG) : null,
          servingSizeG: Number(food.servingSizeG),
          servingSizeUnit: food.servingSizeUnit,
          verified: food.verified,
        }));
      } catch (error) {
        console.error("Failed to search food items:", error);
        throw new Error("Failed to search food items");
      }
    }
  );

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Create a new diary entry
 * Validates input and creates the entry in the database
 */
export const createDiaryEntry = createServerFn({ method: "POST" })
  .inputValidator((data: CreateDiaryEntryInput) => {
    return createDiaryEntrySchema.parse(data);
  })
  .handler(async ({ data }): Promise<DiaryEntryWithFood> => {
    try {
      // Validate that the food item exists
      const foodItem = await prisma.foodItem.findUnique({
        where: { id: data.foodItemId },
      });

      if (!foodItem) {
        throw new Error("Food item not found");
      }

      // Parse date string to Date object
      const dateObj = new Date(data.date + "T00:00:00.000Z");

      // Create the diary entry
      const entry = await prisma.diaryEntry.create({
        data: {
          userId: data.userId,
          foodItemId: data.foodItemId,
          date: dateObj,
          mealType: data.mealType,
          quantityG: toDecimal(data.quantityG),
          servings: data.servings ? toDecimal(data.servings) : toDecimal(1),
          notes: data.notes || null,
        },
        include: {
          foodItem: true,
        },
      });

      // Compute nutrition for this entry
      const quantityG = Number(entry.quantityG);
      const caloriesPer100g = Number(entry.foodItem.caloriesPer100g);
      const proteinPer100g = Number(entry.foodItem.proteinG);
      const carbsPer100g = Number(entry.foodItem.carbsG);
      const fatPer100g = Number(entry.foodItem.fatG);

      const calories = (caloriesPer100g * quantityG) / 100;
      const protein = (proteinPer100g * quantityG) / 100;
      const carbs = (carbsPer100g * quantityG) / 100;
      const fat = (fatPer100g * quantityG) / 100;

      return {
        id: entry.id,
        userId: entry.userId,
        date: entry.date,
        mealType: entry.mealType,
        quantityG: quantityG,
        servings: Number(entry.servings),
        notes: entry.notes,
        createdAt: entry.createdAt,
        foodItem: {
          id: entry.foodItem.id,
          name: entry.foodItem.name,
          brand: entry.foodItem.brand,
          caloriesPer100g: caloriesPer100g,
          proteinG: proteinPer100g,
          carbsG: carbsPer100g,
          fatG: fatPer100g,
          fiberG: entry.foodItem.fiberG ? Number(entry.foodItem.fiberG) : null,
          sugarG: entry.foodItem.sugarG ? Number(entry.foodItem.sugarG) : null,
          servingSizeG: Number(entry.foodItem.servingSizeG),
          servingSizeUnit: entry.foodItem.servingSizeUnit,
        },
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
      };
    } catch (error) {
      console.error("Failed to create diary entry:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create diary entry");
    }
  });
