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
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2">
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">{label}</h3>
          </div>
          <div className="text-sm font-medium">
            {meal.totalCalories}{" "}
            <span className="text-muted-foreground">cal</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Food items list */}
        <div className="space-y-1">
          {meal.foods.map((food) => (
            <FoodItem key={food.id} food={food} />
          ))}
        </div>

        {/* Add food button */}
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-accent"
          size="sm"
        >
          + Add food
        </Button>
      </CardContent>
    </Card>
  );
}
