import type { FoodItem as FoodItemType } from "@/types/nutrition";

export interface FoodItemProps {
  food: FoodItemType;
}

export function FoodItem({ food }: FoodItemProps) {
  return (
    <div className="flex items-center justify-between py-2 hover:bg-accent/5 rounded-md px-2 -mx-2 transition-colors group">
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm">{food.name}</span>
          <span className="text-xs text-muted-foreground">
            ({food.quantity})
          </span>
        </div>
      </div>
      <div className="text-sm font-medium">
        {food.calories}{" "}
        <span className="text-muted-foreground text-xs">cal</span>
      </div>
    </div>
  );
}
