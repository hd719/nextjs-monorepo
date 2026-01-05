// Nutrition goals (daily targets)
export const DEFAULT_NUTRITION_GOALS = {
  calories: 2000,
  protein: 150, // grams
  carbs: 200, // grams
  fat: 65, // grams
} as const;

// Water intake
export const DEFAULT_WATER_GOAL = 8; // glasses per day

// Meal types
export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

// Profile defaults
export const DEFAULT_TIMEZONE = "UTC";
export const DEFAULT_UNITS_PREFERENCE = "metric" as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SEARCH_LIMIT = 20;

// Activity display
export const DEFAULT_ACTIVITY_LIMIT = 10;

// Date formats
export const DATE_FORMAT_DISPLAY = "en-US";
export const DATE_FORMAT_API = "yyyy-MM-dd";
