import { Sunrise, Sun, Moon, Coffee } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodItem } from "./FoodItem";
import type { MealEntry } from "@/types/nutrition";
import styles from "./MealCard.module.css";

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
        <CardHeader className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent className={styles.loadingContent}>
          <div className={styles.loadingFoodList}>
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
      <CardHeader className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Icon className={styles.icon} />
            <h3 className={styles.title}>{label}</h3>
          </div>
          <div className={styles.totalCalories}>
            {meal.totalCalories}{" "}
            <span className={styles.caloriesUnit}>cal</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className={styles.content}>
        {/* Food items list */}
        <div className={styles.foodList}>
          {meal.foods.map((food) => (
            <FoodItem key={food.id} food={food} />
          ))}
        </div>

        {/* Add food button */}
        <Button variant="ghost" className={styles.addButton} size="sm">
          + Add food
        </Button>
      </CardContent>
    </Card>
  );
}
