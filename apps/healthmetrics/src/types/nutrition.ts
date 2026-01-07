import type { MealType } from "@/constants/defaults";

// Daily summary types
export interface DailySummary {
  date: string;
  calories: { consumed: number; goal: number };
  protein: { consumed: number; goal: number };
  carbs: { consumed: number; goal: number };
  fat: { consumed: number; goal: number };
}

// Diary entry types
export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  id: string;
  type: MealType;
  foods: FoodItem[];
  totalCalories: number;
}

// Activity types
export interface Activity {
  id: string;
  type: "exercise" | "weight" | "goal";
  description: string;
  timestamp: string;
  timeAgo: string; // Pre-formatted time ago string for SSR consistency
  calories?: number;
  duration?: string;
}

// Simplified user profile for UI display (mock data)
// For full user profile, use types/profile.ts
export interface UserDisplayProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbGoal: number;
  dailyFatGoal: number;
}

// Water intake type
export interface WaterIntake {
  current: number;
  goal: number;
  date: string;
}
