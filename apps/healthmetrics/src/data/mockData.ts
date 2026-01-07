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
