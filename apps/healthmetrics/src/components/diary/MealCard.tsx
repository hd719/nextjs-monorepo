import { Sunrise, Sun, Moon, Coffee, Utensils } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodItem } from "./FoodItem";
import type { MealEntry } from "@/types/nutrition";
import { ROUTES } from "@/constants/routes";

export interface MealCardProps {
  meal: MealEntry;
  isLoading?: boolean;
  clickable?: boolean;
}

const mealIcons = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
  snack: Coffee,
  other: Utensils,
};

const mealLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  other: "Other",
};

export function MealCard({
  meal,
  isLoading,
  clickable = false,
}: MealCardProps) {
  const Icon = mealIcons[meal.type];
  const label = mealLabels[meal.type];

  if (isLoading) {
    return (
      <Card variant="supporting">
        <CardHeader className="diary-meal-header">
          <div className="diary-meal-header-content">
            <div className="diary-meal-header-left">
              <Skeleton className="skeleton-icon" />
              <Skeleton className="skeleton-title" />
            </div>
            <Skeleton className="skeleton-unit" />
          </div>
        </CardHeader>
        <CardContent className="diary-meal-loading-content">
          <div className="diary-meal-loading-food-list">
            <Skeleton className="skeleton-text-line" />
            <Skeleton className="skeleton-text-line" />
            <Skeleton className="skeleton-text-line-short" />
          </div>
          <Skeleton className="skeleton-value" />
        </CardContent>
      </Card>
    );
  }

  const cardContent = (
    <>
      <CardHeader className="diary-meal-header">
        <div className="diary-meal-header-content">
          <div className="diary-meal-header-left">
            <Icon className="diary-meal-icon" aria-hidden="true" />
            <h3 className="diary-meal-title">{label}</h3>
          </div>
          <div className="diary-meal-total-calories">
            <span className="diary-meal-calories-value">
              {meal.totalCalories}
            </span>{" "}
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

        {/* Add food button - only show when not clickable */}
        {!clickable && (
          <Button variant="ghost" className="diary-meal-add-button" size="sm">
            + Add food
          </Button>
        )}
      </CardContent>
    </>
  );

  if (clickable) {
    return (
      <Link to={ROUTES.DIARY} className="diary-meal-card-link">
        <Card
          variant="supporting"
          className="card-interactive diary-meal-card-clickable"
        >
          {cardContent}
        </Card>
      </Link>
    );
  }

  return <Card variant="supporting">{cardContent}</Card>;
}
