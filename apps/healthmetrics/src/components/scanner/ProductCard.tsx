"use client";

import type { LucideIcon } from "lucide-react";
import { Package, Minus, Plus, Sunrise, Sun, Moon, Apple } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductCardProps } from "@/types";
import type { MealType } from "@/constants";

const MEAL_OPTIONS: { type: MealType; label: string; Icon: LucideIcon }[] = [
  { type: "breakfast", label: "Breakfast", Icon: Sunrise },
  { type: "lunch", label: "Lunch", Icon: Sun },
  { type: "dinner", label: "Dinner", Icon: Moon },
  { type: "snack", label: "Snack", Icon: Apple },
];

export function ProductCard({
  product,
  servings,
  onServingsChange,
  mealType,
  onMealTypeChange,
  isLoading = false,
}: ProductCardProps) {
  const servingMultiplier = (servings * product.servingSizeG) / 100;
  const nutrition = {
    calories: Math.round(product.caloriesPer100g * servingMultiplier),
    protein: Math.round(product.proteinG * servingMultiplier * 10) / 10,
    carbs: Math.round(product.carbsG * servingMultiplier * 10) / 10,
    fat: Math.round(product.fatG * servingMultiplier * 10) / 10,
    fiber: product.fiberG != null // allow 0 to show as a real value
      ? Math.round(product.fiberG * servingMultiplier * 10) / 10
      : null,
    sugar: product.sugarG != null // allow 0 to show as a real value
      ? Math.round(product.sugarG * servingMultiplier * 10) / 10
      : null,
    sodium: product.sodiumMg != null // allow 0 to show as a real value
      ? Math.round(product.sodiumMg * servingMultiplier)
      : null,
  };

  // Convert optional values to display strings for the UI.
  const fiberDisplay =
    nutrition.fiber != null ? `${nutrition.fiber}g` : "N/A";
  const sugarDisplay =
    nutrition.sugar != null ? `${nutrition.sugar}g` : "N/A";

  const decreaseServings = () => {
    if (servings > 0.5) {
      onServingsChange(Math.round((servings - 0.5) * 10) / 10);
    }
  };

  const increaseServings = () => {
    onServingsChange(Math.round((servings + 0.5) * 10) / 10);
  };

  if (isLoading) {
    return (
      <div className="scanner-product-card">
        <div className="scanner-product-header">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="scanner-product-info">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-1" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-lg mb-4" />
        <Skeleton className="h-14 w-full rounded-lg mb-4" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <article
      className="scanner-product-card"
      aria-label={`Product: ${product.name}`}
    >
      {/* Product header */}
      <header className="scanner-product-header">
        <div className="scanner-product-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <Package
              className="scanner-product-image-placeholder"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="scanner-product-info">
          <h3 className="scanner-product-name">{product.name}</h3>
          {product.brand && (
            <p className="scanner-product-brand">{product.brand}</p>
          )}
          <p className="scanner-product-serving">
            {product.servingSizeG}g per serving
          </p>
        </div>
      </header>

      {/* Nutrition information */}
      <section
        className="scanner-nutrition-grid"
        aria-label="Nutrition facts per serving"
      >
        <div
          className="scanner-nutrition-item"
          role="group"
          aria-label="Calories"
        >
          <div className="scanner-nutrition-value" aria-hidden="true">
            {nutrition.calories}
          </div>
          <div className="scanner-nutrition-label">Calories</div>
          <span className="sr-only">{nutrition.calories} calories</span>
        </div>
        <div
          className="scanner-nutrition-item"
          role="group"
          aria-label="Protein"
        >
          <div className="scanner-nutrition-value" aria-hidden="true">
            {nutrition.protein}g
          </div>
          <div className="scanner-nutrition-label">Protein</div>
          <span className="sr-only">{nutrition.protein} grams protein</span>
        </div>
        <div className="scanner-nutrition-item" role="group" aria-label="Carbs">
          <div className="scanner-nutrition-value" aria-hidden="true">
            {nutrition.carbs}g
          </div>
          <div className="scanner-nutrition-label">Carbs</div>
          <span className="sr-only">{nutrition.carbs} grams carbohydrates</span>
        </div>
        <div className="scanner-nutrition-item" role="group" aria-label="Fat">
          <div className="scanner-nutrition-value" aria-hidden="true">
            {nutrition.fat}g
          </div>
          <div className="scanner-nutrition-label">Fat</div>
          <span className="sr-only">{nutrition.fat} grams fat</span>
        </div>
        {/* Always render fiber; show N/A when the value is unknown */}
        <div className="scanner-nutrition-item" role="group" aria-label="Fiber">
          <div className="scanner-nutrition-value" aria-hidden="true">
            {fiberDisplay}
          </div>
          <div className="scanner-nutrition-label">Fiber</div>
          <span className="sr-only">
            {nutrition.fiber != null ? `${nutrition.fiber} grams fiber` : "Fiber not available"}
          </span>
        </div>
        {/* Always render sugar; show N/A when the value is unknown */}
        <div className="scanner-nutrition-item" role="group" aria-label="Sugar">
          <div className="scanner-nutrition-value" aria-hidden="true">
            {sugarDisplay}
          </div>
          <div className="scanner-nutrition-label">Sugar</div>
          <span className="sr-only">
            {nutrition.sugar != null ? `${nutrition.sugar} grams sugar` : "Sugar not available"}
          </span>
        </div>
      </section>

      {/* Servings control */}
      <div
        className="scanner-servings-control"
        role="group"
        aria-label="Adjust servings"
      >
        <span id="servings-label" className="scanner-servings-label">
          Servings
        </span>
        <div
          className="scanner-servings-buttons"
          role="spinbutton"
          aria-labelledby="servings-label"
          aria-valuenow={servings}
          aria-valuemin={0.5}
        >
          <button
            type="button"
            className="scanner-servings-btn"
            onClick={decreaseServings}
            disabled={servings <= 0.5}
            aria-label={`Decrease servings, currently ${servings}`}
          >
            <Minus className="icon-sm" aria-hidden="true" />
          </button>
          <span className="scanner-servings-value" aria-live="polite">
            {servings}
          </span>
          <button
            type="button"
            className="scanner-servings-btn"
            onClick={increaseServings}
            aria-label={`Increase servings, currently ${servings}`}
          >
            <Plus className="icon-sm" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Meal type selector */}
      <fieldset className="scanner-meal-selector">
        <legend className="scanner-meal-selector-label">Add to meal</legend>
        <div className="scanner-meal-options" role="radiogroup">
          {MEAL_OPTIONS.map(({ type, label, Icon }) => (
            <button
              key={type}
              type="button"
              role="radio"
              className={`scanner-meal-option ${
                mealType === type ? "scanner-meal-option-selected" : ""
              }`}
              onClick={() => onMealTypeChange(type)}
              aria-checked={mealType === type}
            >
              <Icon className="scanner-meal-option-icon" aria-hidden="true" />
              <span className="scanner-meal-option-label">{label}</span>
            </button>
          ))}
        </div>
      </fieldset>
    </article>
  );
}
