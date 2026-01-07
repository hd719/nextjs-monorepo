import type { FoodItem as FoodItemType } from "@/types";

export interface FoodItemProps {
  food: FoodItemType;
}

export function FoodItem({ food }: FoodItemProps) {
  return (
    <div className="diary-food-item">
      <div className="diary-food-content">
        <div className="diary-food-details">
          <span className="diary-food-name">{food.name}</span>
          <span className="diary-food-quantity">({food.quantity})</span>
        </div>
      </div>
      <div className="diary-food-calories">
        {food.calories} <span className="diary-food-calories-unit">cal</span>
      </div>
    </div>
  );
}
