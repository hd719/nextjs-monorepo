import type {
  DailySummary,
  MealEntry,
  Activity,
  UserDisplayProfile,
  WaterIntake,
  ExerciseSummary,
  SleepCardData,
  UserStreaks,
  AchievementSummary,
  ScannedProduct,
} from "@/types";

// Static date for consistent SSR/client rendering
// In production, this would be generated server-side per request
const today = "Wed, Dec 10, 2025";

// Mock user profile
export const mockUser: UserDisplayProfile = {
  id: "user-1",
  displayName: "Alex Johnson",
  avatarUrl: undefined,
  dailyCalorieGoal: 2000,
  dailyProteinGoal: 150,
  dailyCarbGoal: 200,
  dailyFatGoal: 65,
};

// Mock daily summary
export const mockDailySummary: DailySummary = {
  date: today,
  calories: { consumed: 1847, goal: 2000 },
  protein: { consumed: 145, goal: 150 },
  carbs: { consumed: 180, goal: 200 },
  fat: { consumed: 58, goal: 65 },
};

// Mock meal entries
export const mockMealEntries: MealEntry[] = [
  {
    id: "meal-1",
    type: "breakfast",
    foods: [
      {
        id: "food-1",
        name: "Oatmeal",
        quantity: "1 cup",
        calories: 150,
        protein: 5,
        carbs: 27,
        fat: 3,
      },
      {
        id: "food-2",
        name: "Banana",
        quantity: "1 medium",
        calories: 105,
        protein: 1,
        carbs: 27,
        fat: 0,
      },
      {
        id: "food-3",
        name: "Greek Yogurt",
        quantity: "1 cup",
        calories: 195,
        protein: 20,
        carbs: 11,
        fat: 10,
      },
    ],
    totalCalories: 450,
  },
  {
    id: "meal-2",
    type: "lunch",
    foods: [
      {
        id: "food-4",
        name: "Grilled Chicken",
        quantity: "200g",
        calories: 330,
        protein: 62,
        carbs: 0,
        fat: 7,
      },
      {
        id: "food-5",
        name: "Brown Rice",
        quantity: "1 cup",
        calories: 215,
        protein: 5,
        carbs: 45,
        fat: 2,
      },
      {
        id: "food-6",
        name: "Broccoli",
        quantity: "1 cup",
        calories: 55,
        protein: 4,
        carbs: 11,
        fat: 1,
      },
    ],
    totalCalories: 680,
  },
  {
    id: "meal-3",
    type: "dinner",
    foods: [
      {
        id: "food-7",
        name: "Salmon",
        quantity: "150g",
        calories: 312,
        protein: 39,
        carbs: 0,
        fat: 18,
      },
      {
        id: "food-8",
        name: "Quinoa",
        quantity: "1 cup",
        calories: 222,
        protein: 8,
        carbs: 39,
        fat: 4,
      },
      {
        id: "food-9",
        name: "Mixed Vegetables",
        quantity: "1 cup",
        calories: 183,
        protein: 6,
        carbs: 38,
        fat: 1,
      },
    ],
    totalCalories: 717,
  },
];

// Mock recent activities
export const mockActivities: Activity[] = [
  {
    id: "activity-1",
    type: "exercise",
    description: "Ran 5km",
    timestamp: "2025-12-10T08:00:00Z",
    timeAgo: "2 hours ago",
    calories: 420,
    duration: "30 min",
  },
  {
    id: "activity-2",
    type: "weight",
    description: "Logged weight: 75.2 kg",
    timestamp: "2025-12-10T05:00:00Z",
    timeAgo: "5 hours ago",
  },
  {
    id: "activity-3",
    type: "goal",
    description: "Goal progress: 85% to target",
    timestamp: "2025-12-09T10:00:00Z",
    timeAgo: "1 day ago",
  },
];

// Mock exercise summary
export const mockExerciseSummary: ExerciseSummary = {
  totalMinutes: 45,
  caloriesBurned: 420,
  exercisesCompleted: 2,
};

// Mock water intake
export const mockWaterIntake: WaterIntake = {
  current: 5,
  goal: 8,
  date: today,
};

// Mock sleep data for dashboard
export const mockSleepCardData: SleepCardData = {
  hoursSlept: 7.5,
  quality: 4,
  bedtime: "22:30",
  wakeTime: "06:00",
  hasEntry: true,
};

// Mock streaks data
export const mockStreaks: UserStreaks = {
  currentLogging: 12,
  bestLogging: 21,
  currentCalorie: 5,
  bestCalorie: 14,
  currentExercise: 3,
  bestExercise: 7,
  lastLoggingDate: "2025-12-10",
  lastExerciseDate: "2025-12-09",
};

// Mock achievement summary
export const mockAchievementSummary: AchievementSummary = {
  totalPoints: 285,
  unlockedCount: 5,
  totalCount: 12,
  recentUnlocks: [
    {
      id: "ua-1",
      achievementId: "ach-1",
      key: "streak_7",
      name: "Week Warrior",
      description: "7-day logging streak",
      icon: "flame",
      category: "streaks",
      points: 25,
      unlockedAt: "2025-12-08T10:00:00Z",
    },
    {
      id: "ua-2",
      achievementId: "ach-2",
      key: "first_meal",
      name: "First Bite",
      description: "Log your first meal",
      icon: "utensils",
      category: "logging",
      points: 10,
      unlockedAt: "2025-12-01T08:30:00Z",
    },
  ],
};

// Mock barcode products database
// IDs must be valid UUIDs to work with the diary entry API
export const mockBarcodeProducts: Record<string, ScannedProduct> = {
  // Coca-Cola Classic 330ml
  "5449000000996": {
    id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    barcode: "5449000000996",
    name: "Coca-Cola Classic",
    brand: "Coca-Cola",
    caloriesPer100g: 42,
    proteinG: 0,
    carbsG: 10.6,
    fatG: 0,
    fiberG: 0,
    sugarG: 10.6,
    sodiumMg: 4,
    servingSizeG: 330,
    imageUrl: null,
    source: "user",
    verified: true,
  },
  // Cheerios Original
  "0016000275287": {
    id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    barcode: "0016000275287",
    name: "Cheerios Original",
    brand: "General Mills",
    caloriesPer100g: 372,
    proteinG: 12.1,
    carbsG: 73.2,
    fatG: 6.7,
    fiberG: 10.1,
    sugarG: 4.6,
    sodiumMg: 497,
    servingSizeG: 28,
    imageUrl: null,
    source: "user",
    verified: true,
  },
  // Chobani Greek Yogurt
  "0894700010045": {
    id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    barcode: "0894700010045",
    name: "Greek Yogurt Plain Non-Fat",
    brand: "Chobani",
    caloriesPer100g: 59,
    proteinG: 10.3,
    carbsG: 3.6,
    fatG: 0.7,
    fiberG: 0,
    sugarG: 3.2,
    sodiumMg: 36,
    servingSizeG: 170,
    imageUrl: null,
    source: "user",
    verified: true,
  },
  // Nature Valley Granola Bar
  "0016000439894": {
    id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
    barcode: "0016000439894",
    name: "Crunchy Granola Bars Oats 'n Honey",
    brand: "Nature Valley",
    caloriesPer100g: 471,
    proteinG: 7.1,
    carbsG: 64.7,
    fatG: 20,
    fiberG: 3.5,
    sugarG: 28.2,
    sodiumMg: 353,
    servingSizeG: 42,
    imageUrl: null,
    source: "user",
    verified: true,
  },
  // Silk Almond Milk Original
  "0025293001053": {
    id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
    barcode: "0025293001053",
    name: "Almond Milk Original",
    brand: "Silk",
    caloriesPer100g: 25,
    proteinG: 0.4,
    carbsG: 3.3,
    fatG: 1,
    fiberG: 0.4,
    sugarG: 2.9,
    sodiumMg: 63,
    servingSizeG: 240,
    imageUrl: null,
    source: "user",
    verified: true,
  },
  // KIND Bar Dark Chocolate Nuts
  "0602652177514": {
    id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
    barcode: "0602652177514",
    name: "Dark Chocolate Nuts & Sea Salt",
    brand: "KIND",
    caloriesPer100g: 475,
    proteinG: 15,
    carbsG: 40,
    fatG: 32.5,
    fiberG: 7.5,
    sugarG: 12.5,
    sodiumMg: 313,
    servingSizeG: 40,
    imageUrl: null,
    source: "user",
    verified: true,
  },
  // Lay's Classic Chips
  "0028400064057": {
    id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
    barcode: "0028400064057",
    name: "Classic Potato Chips",
    brand: "Lay's",
    caloriesPer100g: 536,
    proteinG: 7.1,
    carbsG: 53.6,
    fatG: 32.1,
    fiberG: 3.6,
    sugarG: 1.8,
    sodiumMg: 536,
    servingSizeG: 28,
    imageUrl: null,
    source: "user",
    verified: true,
  },
  // Clif Bar Chocolate Chip
  "0722252100900": {
    id: "b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e",
    barcode: "0722252100900",
    name: "Energy Bar Chocolate Chip",
    brand: "Clif Bar",
    caloriesPer100g: 379,
    proteinG: 14.7,
    carbsG: 64.7,
    fatG: 7.4,
    fiberG: 5.9,
    sugarG: 30.9,
    sodiumMg: 368,
    servingSizeG: 68,
    imageUrl: null,
    source: "user",
    verified: true,
  },
  // Heinz Tomato Ketchup
  "0013000006408": {
    id: "c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f",
    barcode: "0013000006408",
    name: "Tomato Ketchup",
    brand: "Heinz",
    caloriesPer100g: 101,
    proteinG: 1.2,
    carbsG: 27.4,
    fatG: 0,
    fiberG: 0,
    sugarG: 22.8,
    sodiumMg: 907,
    servingSizeG: 17,
    imageUrl: null,
    source: "user",
    verified: true,
  },
  // Skippy Peanut Butter
  "0037600105651": {
    id: "d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a",
    barcode: "0037600105651",
    name: "Creamy Peanut Butter",
    brand: "Skippy",
    caloriesPer100g: 588,
    proteinG: 25,
    carbsG: 21.9,
    fatG: 50,
    fiberG: 6.3,
    sugarG: 9.4,
    sodiumMg: 469,
    servingSizeG: 32,
    imageUrl: null,
    source: "user",
    verified: true,
  },
};

// Simulate barcode lookup with delay
export async function mockBarcodeLookup(
  barcode: string
): Promise<ScannedProduct | null> {
  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 500)
  );

  return mockBarcodeProducts[barcode] ?? null;
}
