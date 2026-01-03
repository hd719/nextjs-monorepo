import { Sunrise, Sun, Moon, Coffee } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodItem } from "./FoodItem";
import type { MealEntry } from "@/types/nutrition";

export interface MealCardProps {
  meal: MealEntry;
  isLoading?: boolean;
}

const mealIcons = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
  snack: Coffee,
};

const mealLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function MealCard({ meal, isLoading }: MealCardProps) {
  const Icon = mealIcons[meal.type];
  const label = mealLabels[meal.type];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="diary-meal-header">
          <div className="diary-meal-header-content">
            <div className="diary-meal-header-left">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent className="diary-meal-loading-content">
          <div className="diary-meal-loading-food-list">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="diary-meal-header">
        <div className="diary-meal-header-content">
          <div className="diary-meal-header-left">
            <Icon className="diary-meal-icon" />
            <h3 className="diary-meal-title">{label}</h3>
          </div>
          <div className="diary-meal-total-calories">
            {meal.totalCalories}{" "}
            <span className="diary-meal-calories-unit">cal</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="diary-meal-content">
        {/* Food items list */}
        <div className="diary-meal-food-list">
          {meal.foods.map((food) => (
            <FoodItem key={food.id} food={food} />
          ))}
        </div>

        {/* Add food button */}
        <Button variant="ghost" className="diary-meal-add-button" size="sm">
          + Add food
        </Button>
      </CardContent>
    </Card>
  );
}
