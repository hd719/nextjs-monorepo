import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Create Prisma client instance for seeding
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

// Common foods with realistic nutrition data (per 100g)
// Source: USDA FoodData Central
const commonFoods = [
  // Proteins
  {
    name: "Grilled Chicken Breast",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 165,
    proteinG: 31,
    carbsG: 0,
    fatG: 3.6,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 74,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Salmon Fillet",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 208,
    proteinG: 26,
    carbsG: 0,
    fatG: 12,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 59,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Ground Beef (90% lean)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 176,
    proteinG: 25,
    carbsG: 0,
    fatG: 10,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 75,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Whole Egg",
    brand: null,
    servingSizeG: 50,
    servingSizeUnit: "g (1 large egg)",
    caloriesPer100g: 143,
    proteinG: 13,
    carbsG: 1,
    fatG: 10,
    fiberG: 0,
    sugarG: 1,
    sodiumMg: 124,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Greek Yogurt (Plain, Nonfat)",
    brand: null,
    servingSizeG: 170,
    servingSizeUnit: "g (1 container)",
    caloriesPer100g: 59,
    proteinG: 10,
    carbsG: 3.6,
    fatG: 0.4,
    fiberG: 0,
    sugarG: 3.2,
    sodiumMg: 36,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Tuna (Canned in Water)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 116,
    proteinG: 26,
    carbsG: 0,
    fatG: 0.8,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 247,
    source: "user" as const,
    verified: true,
  },

  // Carbs
  {
    name: "Brown Rice (Cooked)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 111,
    proteinG: 2.6,
    carbsG: 23,
    fatG: 0.9,
    fiberG: 1.8,
    sugarG: 0.4,
    sodiumMg: 5,
    source: "user" as const,
    verified: true,
  },
  {
    name: "White Rice (Cooked)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 130,
    proteinG: 2.7,
    carbsG: 28,
    fatG: 0.3,
    fiberG: 0.4,
    sugarG: 0.1,
    sodiumMg: 1,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Quinoa (Cooked)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 120,
    proteinG: 4.4,
    carbsG: 21,
    fatG: 1.9,
    fiberG: 2.8,
    sugarG: 0.9,
    sodiumMg: 7,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Sweet Potato (Baked)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 90,
    proteinG: 2,
    carbsG: 21,
    fatG: 0.2,
    fiberG: 3.3,
    sugarG: 6.5,
    sodiumMg: 36,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Oatmeal (Cooked)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 71,
    proteinG: 2.5,
    carbsG: 12,
    fatG: 1.5,
    fiberG: 1.7,
    sugarG: 0.3,
    sodiumMg: 49,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Whole Wheat Bread",
    brand: null,
    servingSizeG: 28,
    servingSizeUnit: "g (1 slice)",
    caloriesPer100g: 247,
    proteinG: 13,
    carbsG: 41,
    fatG: 3.4,
    fiberG: 6.8,
    sugarG: 5.6,
    sodiumMg: 400,
    source: "user" as const,
    verified: true,
  },

  // Vegetables
  {
    name: "Broccoli (Steamed)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 35,
    proteinG: 2.4,
    carbsG: 7,
    fatG: 0.4,
    fiberG: 3.3,
    sugarG: 1.4,
    sodiumMg: 41,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Spinach (Raw)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 23,
    proteinG: 2.9,
    carbsG: 3.6,
    fatG: 0.4,
    fiberG: 2.2,
    sugarG: 0.4,
    sodiumMg: 79,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Mixed Vegetables (Frozen)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 65,
    proteinG: 2.6,
    carbsG: 13,
    fatG: 0.3,
    fiberG: 3.8,
    sugarG: 4.5,
    sodiumMg: 43,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Bell Pepper (Raw)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 26,
    proteinG: 0.9,
    carbsG: 6,
    fatG: 0.3,
    fiberG: 1.7,
    sugarG: 4.2,
    sodiumMg: 2,
    source: "user" as const,
    verified: true,
  },

  // Fruits
  {
    name: "Banana",
    brand: null,
    servingSizeG: 120,
    servingSizeUnit: "g (1 medium)",
    caloriesPer100g: 89,
    proteinG: 1.1,
    carbsG: 23,
    fatG: 0.3,
    fiberG: 2.6,
    sugarG: 12,
    sodiumMg: 1,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Apple",
    brand: null,
    servingSizeG: 182,
    servingSizeUnit: "g (1 medium)",
    caloriesPer100g: 52,
    proteinG: 0.3,
    carbsG: 14,
    fatG: 0.2,
    fiberG: 2.4,
    sugarG: 10,
    sodiumMg: 1,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Blueberries",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 57,
    proteinG: 0.7,
    carbsG: 14,
    fatG: 0.3,
    fiberG: 2.4,
    sugarG: 10,
    sodiumMg: 1,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Strawberries",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 32,
    proteinG: 0.7,
    carbsG: 7.7,
    fatG: 0.3,
    fiberG: 2,
    sugarG: 4.9,
    sodiumMg: 1,
    source: "user" as const,
    verified: true,
  },

  // Fats & Nuts
  {
    name: "Almonds",
    brand: null,
    servingSizeG: 28,
    servingSizeUnit: "g (1 oz)",
    caloriesPer100g: 579,
    proteinG: 21,
    carbsG: 22,
    fatG: 50,
    fiberG: 12,
    sugarG: 4.4,
    sodiumMg: 1,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Peanut Butter",
    brand: null,
    servingSizeG: 32,
    servingSizeUnit: "g (2 tbsp)",
    caloriesPer100g: 588,
    proteinG: 25,
    carbsG: 20,
    fatG: 50,
    fiberG: 8,
    sugarG: 9,
    sodiumMg: 476,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Avocado",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 160,
    proteinG: 2,
    carbsG: 8.5,
    fatG: 15,
    fiberG: 6.7,
    sugarG: 0.7,
    sodiumMg: 7,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Olive Oil",
    brand: null,
    servingSizeG: 14,
    servingSizeUnit: "g (1 tbsp)",
    caloriesPer100g: 884,
    proteinG: 0,
    carbsG: 0,
    fatG: 100,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 2,
    source: "user" as const,
    verified: true,
  },

  // Dairy
  {
    name: "Whole Milk",
    brand: null,
    servingSizeG: 244,
    servingSizeUnit: "g (1 cup)",
    caloriesPer100g: 61,
    proteinG: 3.2,
    carbsG: 4.8,
    fatG: 3.3,
    fiberG: 0,
    sugarG: 5.1,
    sodiumMg: 43,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Cheddar Cheese",
    brand: null,
    servingSizeG: 28,
    servingSizeUnit: "g (1 oz)",
    caloriesPer100g: 403,
    proteinG: 25,
    carbsG: 1.3,
    fatG: 33,
    fiberG: 0,
    sugarG: 0.5,
    sodiumMg: 621,
    source: "user" as const,
    verified: true,
  },

  // Other
  {
    name: "Protein Powder (Whey)",
    brand: null,
    servingSizeG: 30,
    servingSizeUnit: "g (1 scoop)",
    caloriesPer100g: 400,
    proteinG: 80,
    carbsG: 6.7,
    fatG: 6.7,
    fiberG: 0,
    sugarG: 3.3,
    sodiumMg: 333,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Pasta (Cooked)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 131,
    proteinG: 5,
    carbsG: 25,
    fatG: 1.1,
    fiberG: 1.8,
    sugarG: 0.6,
    sodiumMg: 1,
    source: "user" as const,
    verified: true,
  },
  {
    name: "Black Beans (Cooked)",
    brand: null,
    servingSizeG: 100,
    servingSizeUnit: "g",
    caloriesPer100g: 132,
    proteinG: 8.9,
    carbsG: 24,
    fatG: 0.5,
    fiberG: 8.7,
    sugarG: 0.3,
    sodiumMg: 2,
    source: "user" as const,
    verified: true,
  },
];

// Curated exercise library with MET values
// MET (Metabolic Equivalent of Task) values
// Achievement definitions for gamification system
// Preset fasting protocols
const fastingProtocols = [
  {
    name: "16:8",
    fastingMinutes: 960, // 16 hours
    eatingMinutes: 480, // 8 hours
    isPreset: true,
  },
  {
    name: "18:6",
    fastingMinutes: 1080, // 18 hours
    eatingMinutes: 360, // 6 hours
    isPreset: true,
  },
  {
    name: "20:4",
    fastingMinutes: 1200, // 20 hours
    eatingMinutes: 240, // 4 hours
    isPreset: true,
  },
  {
    name: "OMAD (23:1)",
    fastingMinutes: 1380, // 23 hours
    eatingMinutes: 60, // 1 hour
    isPreset: true,
  },
];

const achievementDefinitions = [
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
    description: "Maintain a 7-day logging streak",
    icon: "flame",
    category: "streaks",
    requirement: { type: "streak", target: 7, metric: "logging" },
    points: 25,
  },
  {
    key: "streak_30",
    name: "Monthly Master",
    description: "Maintain a 30-day logging streak",
    icon: "trophy",
    category: "streaks",
    requirement: { type: "streak", target: 30, metric: "logging" },
    points: 100,
  },
  {
    key: "streak_100",
    name: "Centurion Logger",
    description: "Maintain a 100-day logging streak",
    icon: "crown",
    category: "streaks",
    requirement: { type: "streak", target: 100, metric: "logging" },
    points: 500,
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
    key: "calorie_goal_30",
    name: "Precision Eater",
    description: "Hit your calorie goal 30 days in a row",
    icon: "crosshair",
    category: "goals",
    requirement: { type: "streak", target: 30, metric: "calorie" },
    points: 200,
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
    key: "exercise_streak_7",
    name: "Fitness Fanatic",
    description: "Exercise 7 days in a row",
    icon: "zap",
    category: "exercise",
    requirement: { type: "streak", target: 7, metric: "exercise" },
    points: 50,
  },
  {
    key: "exercise_streak_30",
    name: "Iron Will",
    description: "Exercise 30 days in a row",
    icon: "medal",
    category: "exercise",
    requirement: { type: "streak", target: 30, metric: "exercise" },
    points: 200,
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
    key: "water_goal_30",
    name: "Hydration Hero",
    description: "Hit your water goal 30 days in a row",
    icon: "waves",
    category: "goals",
    requirement: { type: "streak", target: 30, metric: "water" },
    points: 100,
  },
  {
    key: "meals_50",
    name: "Food Logger",
    description: "Log 50 meals",
    icon: "utensils-crossed",
    category: "logging",
    requirement: { type: "count", target: 50, metric: "meals" },
    points: 25,
  },
  {
    key: "meals_100",
    name: "Centurion Chef",
    description: "Log 100 meals",
    icon: "chef-hat",
    category: "logging",
    requirement: { type: "count", target: 100, metric: "meals" },
    points: 75,
  },
  {
    key: "meals_500",
    name: "Nutrition Master",
    description: "Log 500 meals",
    icon: "award",
    category: "logging",
    requirement: { type: "count", target: 500, metric: "meals" },
    points: 250,
  },
  {
    key: "workouts_10",
    name: "Gym Goer",
    description: "Complete 10 workouts",
    icon: "activity",
    category: "exercise",
    requirement: { type: "count", target: 10, metric: "workouts" },
    points: 30,
  },
  {
    key: "workouts_50",
    name: "Fitness Enthusiast",
    description: "Complete 50 workouts",
    icon: "heart-pulse",
    category: "exercise",
    requirement: { type: "count", target: 50, metric: "workouts" },
    points: 100,
  },
  {
    key: "workouts_100",
    name: "Workout Warrior",
    description: "Complete 100 workouts",
    icon: "swords",
    category: "exercise",
    requirement: { type: "count", target: 100, metric: "workouts" },
    points: 250,
  },
  {
    key: "first_sleep",
    name: "Sleep Tracker",
    description: "Log your first sleep entry",
    icon: "moon",
    category: "logging",
    requirement: { type: "count", target: 1, metric: "sleep" },
    points: 10,
  },
  {
    key: "sleep_7",
    name: "Well Rested",
    description: "Log sleep for 7 days in a row",
    icon: "bed-double",
    category: "streaks",
    requirement: { type: "streak", target: 7, metric: "sleep" },
    points: 25,
  },
  {
    key: "sleep_quality_5",
    name: "Sweet Dreams",
    description: "Log 5-star quality sleep",
    icon: "sparkles",
    category: "goals",
    requirement: { type: "count", target: 1, metric: "perfect_sleep" },
    points: 15,
  },
  {
    key: "weight_logged",
    name: "Scale Starter",
    description: "Log your first weight entry",
    icon: "scale",
    category: "logging",
    requirement: { type: "count", target: 1, metric: "weight" },
    points: 10,
  },
  {
    key: "weight_trend_7",
    name: "Progress Tracker",
    description: "Log weight for 7 consecutive days",
    icon: "trending-down",
    category: "streaks",
    requirement: { type: "streak", target: 7, metric: "weight" },
    points: 25,
  },
  {
    key: "steps_10k",
    name: "10K Steps",
    description: "Hit 10,000 steps in a day",
    icon: "footprints",
    category: "goals",
    requirement: { type: "count", target: 10000, metric: "steps_daily" },
    points: 20,
  },
  {
    key: "early_bird",
    name: "Early Bird",
    description: "Log a meal before 7am",
    icon: "sunrise",
    category: "logging",
    requirement: { type: "count", target: 1, metric: "early_meal" },
    points: 15,
  },
];

const curatedExercises = [
  // Cardio exercises
  {
    name: "Running (6 mph / 10 min mile)",
    category: "cardio" as const,
    muscleGroups: ["legs", "cardiovascular"],
    metValue: 10.0,
    description: "Moderate pace running suitable for general fitness",
    instructions: [
      "Maintain a steady pace of about 6 mph",
      "Keep proper running form with relaxed shoulders",
      "Land midfoot and push off with toes",
      "Breathe rhythmically",
    ],
    equipment: ["running shoes"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Running (8 mph / 7.5 min mile)",
    category: "cardio" as const,
    muscleGroups: ["legs", "cardiovascular"],
    metValue: 13.5,
    description: "Fast pace running for experienced runners",
    instructions: [
      "Maintain a challenging pace of about 8 mph",
      "Focus on breathing and form",
      "Warm up thoroughly before starting",
    ],
    equipment: ["running shoes"],
    difficulty: "advanced" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Walking (3.5 mph, brisk pace)",
    category: "cardio" as const,
    muscleGroups: ["legs", "cardiovascular"],
    metValue: 4.3,
    description: "Brisk walking for general fitness and health",
    instructions: [
      "Walk at a pace where you can talk but not sing",
      "Swing arms naturally",
      "Keep head up and shoulders back",
    ],
    equipment: ["walking shoes"],
    difficulty: "beginner" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Cycling (moderate effort, 12-14 mph)",
    category: "cardio" as const,
    muscleGroups: ["legs", "cardiovascular"],
    metValue: 8.0,
    description: "Moderate intensity cycling on flat terrain",
    instructions: [
      "Maintain steady cadence of 60-80 RPM",
      "Keep core engaged",
      "Adjust seat height for proper leg extension",
    ],
    equipment: ["bicycle", "helmet"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Cycling (vigorous effort, 14-16 mph)",
    category: "cardio" as const,
    muscleGroups: ["legs", "cardiovascular"],
    metValue: 10.0,
    description: "High intensity cycling for advanced fitness",
    instructions: [
      "Maintain higher cadence and speed",
      "Focus on breathing and endurance",
      "Stay hydrated",
    ],
    equipment: ["bicycle", "helmet"],
    difficulty: "advanced" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Swimming (moderate effort)",
    category: "cardio" as const,
    muscleGroups: ["full body", "cardiovascular"],
    metValue: 8.0,
    description: "General lap swimming at moderate pace",
    instructions: [
      "Maintain steady breathing rhythm",
      "Use proper stroke technique",
      "Rest briefly between laps as needed",
    ],
    equipment: ["swimsuit", "goggles"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Rowing Machine (moderate effort)",
    category: "cardio" as const,
    muscleGroups: ["full body", "back", "legs", "cardiovascular"],
    metValue: 7.0,
    description: "Moderate intensity rowing for full body workout",
    instructions: [
      "Drive with legs first, then pull with arms",
      "Keep back straight throughout movement",
      "Return to starting position with control",
    ],
    equipment: ["rowing machine"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Jump Rope",
    category: "cardio" as const,
    muscleGroups: ["legs", "shoulders", "cardiovascular"],
    metValue: 12.3,
    description: "High intensity cardio with jump rope",
    instructions: [
      "Jump on balls of feet",
      "Keep elbows close to body",
      "Use wrists to turn rope",
      "Land softly",
    ],
    equipment: ["jump rope"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Elliptical Trainer (moderate effort)",
    category: "cardio" as const,
    muscleGroups: ["legs", "cardiovascular"],
    metValue: 5.0,
    description: "Low impact cardio on elliptical machine",
    instructions: [
      "Maintain upright posture",
      "Use handles for upper body engagement",
      "Keep feet flat on pedals",
    ],
    equipment: ["elliptical machine"],
    difficulty: "beginner" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Stair Climbing",
    category: "cardio" as const,
    muscleGroups: ["legs", "glutes", "cardiovascular"],
    metValue: 8.8,
    description: "Climbing stairs for cardio and leg strength",
    instructions: [
      "Use full foot on each step",
      "Maintain steady pace",
      "Use handrail for balance if needed",
    ],
    equipment: ["stairs"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },

  // Strength training exercises
  {
    name: "Bench Press",
    category: "strength" as const,
    muscleGroups: ["chest", "triceps", "shoulders"],
    metValue: 6.0,
    description: "Classic chest exercise with barbell or dumbbells",
    instructions: [
      "Lie flat on bench with feet on floor",
      "Lower bar to chest with control",
      "Press up explosively",
      "Keep shoulder blades retracted",
    ],
    equipment: ["barbell", "bench", "weights"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Squats",
    category: "strength" as const,
    muscleGroups: ["legs", "glutes", "core"],
    metValue: 5.0,
    description: "Fundamental lower body compound exercise",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower hips back and down",
      "Keep chest up and knees tracking over toes",
      "Drive through heels to stand",
    ],
    equipment: ["barbell", "squat rack"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Deadlifts",
    category: "strength" as const,
    muscleGroups: ["back", "legs", "glutes", "core"],
    metValue: 6.0,
    description: "Full body compound lift focusing on posterior chain",
    instructions: [
      "Stand with feet hip-width apart",
      "Grip bar just outside legs",
      "Keep back straight, lift by extending hips and knees",
      "Lower with control",
    ],
    equipment: ["barbell", "weights"],
    difficulty: "advanced" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Pull-ups",
    category: "strength" as const,
    muscleGroups: ["back", "biceps", "shoulders"],
    metValue: 8.0,
    description: "Bodyweight exercise for back and arm strength",
    instructions: [
      "Hang from bar with overhand grip",
      "Pull body up until chin clears bar",
      "Lower with control",
      "Avoid swinging",
    ],
    equipment: ["pull-up bar"],
    difficulty: "advanced" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Push-ups",
    category: "strength" as const,
    muscleGroups: ["chest", "triceps", "shoulders", "core"],
    metValue: 3.8,
    description: "Classic bodyweight exercise for upper body",
    instructions: [
      "Start in plank position",
      "Lower body until chest nearly touches floor",
      "Push back up to starting position",
      "Keep core tight throughout",
    ],
    equipment: [],
    difficulty: "beginner" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Shoulder Press",
    category: "strength" as const,
    muscleGroups: ["shoulders", "triceps"],
    metValue: 6.0,
    description: "Overhead pressing for shoulder development",
    instructions: [
      "Start with weights at shoulder height",
      "Press overhead until arms fully extended",
      "Lower with control",
      "Keep core engaged",
    ],
    equipment: ["dumbbells or barbell"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Bicep Curls",
    category: "strength" as const,
    muscleGroups: ["biceps"],
    metValue: 3.0,
    description: "Isolation exercise for bicep development",
    instructions: [
      "Stand with dumbbells at sides",
      "Curl weights up to shoulders",
      "Keep elbows stationary",
      "Lower with control",
    ],
    equipment: ["dumbbells"],
    difficulty: "beginner" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Lunges",
    category: "strength" as const,
    muscleGroups: ["legs", "glutes"],
    metValue: 4.0,
    description: "Single leg exercise for lower body strength and balance",
    instructions: [
      "Step forward into lunge position",
      "Lower back knee toward ground",
      "Push through front heel to return",
      "Alternate legs",
    ],
    equipment: ["optional: dumbbells"],
    difficulty: "beginner" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Plank",
    category: "strength" as const,
    muscleGroups: ["core", "shoulders"],
    metValue: 3.8,
    description: "Isometric core strengthening exercise",
    instructions: [
      "Hold forearm plank position",
      "Keep body in straight line",
      "Engage core and glutes",
      "Breathe steadily",
    ],
    equipment: [],
    difficulty: "beginner" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Dumbbell Rows",
    category: "strength" as const,
    muscleGroups: ["back", "biceps"],
    metValue: 4.5,
    description: "Back exercise for strength and muscle development",
    instructions: [
      "Bend at hips with one hand on bench",
      "Pull dumbbell to hip",
      "Squeeze shoulder blade",
      "Lower with control",
    ],
    equipment: ["dumbbells", "bench"],
    difficulty: "beginner" as const,
    source: "verified" as const,
    verified: true,
  },

  // Flexibility exercises
  {
    name: "Yoga (Hatha)",
    category: "flexibility" as const,
    muscleGroups: ["full body"],
    metValue: 2.5,
    description: "Gentle yoga practice for flexibility and relaxation",
    instructions: [
      "Follow instructor or routine",
      "Focus on breath and form",
      "Hold poses for recommended duration",
      "Listen to your body",
    ],
    equipment: ["yoga mat"],
    difficulty: "beginner" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Yoga (Vinyasa)",
    category: "flexibility" as const,
    muscleGroups: ["full body"],
    metValue: 4.0,
    description: "Dynamic flowing yoga practice",
    instructions: [
      "Flow between poses with breath",
      "Maintain proper alignment",
      "Build heat and flexibility",
    ],
    equipment: ["yoga mat"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Stretching (general)",
    category: "flexibility" as const,
    muscleGroups: ["full body"],
    metValue: 2.3,
    description: "General stretching routine for flexibility",
    instructions: [
      "Hold each stretch 15-30 seconds",
      "Breathe deeply",
      "Never bounce",
      "Stretch to mild tension, not pain",
    ],
    equipment: [],
    difficulty: "beginner" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Pilates",
    category: "flexibility" as const,
    muscleGroups: ["core", "full body"],
    metValue: 3.0,
    description: "Core-focused exercise system for strength and flexibility",
    instructions: [
      "Focus on controlled movements",
      "Engage core throughout",
      "Coordinate breath with movement",
    ],
    equipment: ["mat", "optional: reformer"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },

  // Sports activities
  {
    name: "Basketball (game)",
    category: "sports" as const,
    muscleGroups: ["full body", "cardiovascular"],
    metValue: 8.0,
    description: "Playing basketball game or pickup",
    instructions: [
      "Warm up before playing",
      "Stay hydrated",
      "Use proper form for shooting and dribbling",
    ],
    equipment: ["basketball", "court"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Soccer (game)",
    category: "sports" as const,
    muscleGroups: ["legs", "cardiovascular"],
    metValue: 10.0,
    description: "Playing soccer match or practice",
    instructions: [
      "Warm up thoroughly",
      "Focus on ball control and positioning",
      "Stay hydrated throughout",
    ],
    equipment: ["soccer ball", "cleats", "shin guards"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Tennis (singles)",
    category: "sports" as const,
    muscleGroups: ["full body", "cardiovascular"],
    metValue: 8.0,
    description: "Playing singles tennis match",
    instructions: [
      "Warm up before playing",
      "Focus on footwork and positioning",
      "Use proper stroke technique",
    ],
    equipment: ["tennis racket", "tennis balls", "court"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
  {
    name: "Hiking (moderate terrain)",
    category: "sports" as const,
    muscleGroups: ["legs", "cardiovascular"],
    metValue: 6.0,
    description: "Hiking on moderate trails with some elevation",
    instructions: [
      "Wear proper hiking boots",
      "Bring water and snacks",
      "Use trekking poles if needed",
      "Watch footing on uneven terrain",
    ],
    equipment: ["hiking boots", "backpack"],
    difficulty: "intermediate" as const,
    source: "verified" as const,
    verified: true,
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Check if foods already exist
  const existingFoodCount = await prisma.foodItem.count();
  if (existingFoodCount === 0) {
    // Insert all foods
    console.log(`📦 Inserting ${commonFoods.length} common foods...`);

    for (const food of commonFoods) {
      await prisma.foodItem.create({
        data: food,
      });
    }

    console.log(`✅ Added ${commonFoods.length} food items to the database.`);
  } else {
    console.log(
      `⚠️  Database already has ${existingFoodCount} food items. Skipping food seed.`
    );
  }

  // Check if exercises already exist
  const existingExerciseCount = await prisma.exercise.count();
  if (existingExerciseCount === 0) {
    // Insert all exercises
    console.log(`📦 Inserting ${curatedExercises.length} curated exercises...`);

    for (const exercise of curatedExercises) {
      await prisma.exercise.create({
        data: exercise,
      });
    }

    console.log(
      `✅ Added ${curatedExercises.length} exercises to the database.`
    );
  } else {
    console.log(
      `⚠️  Database already has ${existingExerciseCount} exercises. Skipping exercise seed.`
    );
  }

  // Check if achievements already exist
  const existingAchievementCount = await prisma.achievement.count();
  if (existingAchievementCount === 0) {
    // Insert all achievements
    console.log(
      `📦 Inserting ${achievementDefinitions.length} achievement definitions...`
    );

    for (const achievement of achievementDefinitions) {
      await prisma.achievement.create({
        data: achievement,
      });
    }

    console.log(
      `✅ Added ${achievementDefinitions.length} achievements to the database.`
    );
  } else {
    console.log(
      `⚠️  Database already has ${existingAchievementCount} achievements. Skipping achievement seed.`
    );
  }

  // Check if fasting protocols already exist
  const existingProtocolCount = await prisma.fastingProtocol.count();
  if (existingProtocolCount === 0) {
    // Insert all fasting protocols
    console.log(`📦 Inserting ${fastingProtocols.length} fasting protocols...`);

    for (const protocol of fastingProtocols) {
      await prisma.fastingProtocol.create({
        data: protocol,
      });
    }

    console.log(
      `✅ Added ${fastingProtocols.length} fasting protocols to the database.`
    );
  } else {
    console.log(
      `⚠️  Database already has ${existingProtocolCount} fasting protocols. Skipping protocol seed.`
    );
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
