import { UtensilsCrossed } from "lucide-react";
import { MealCard } from "@/components/diary/MealCard";
import { EmptyState } from "@/components/ui/empty-state";
import type { MealEntry } from "@/types/nutrition";

export interface TodaysDiaryProps {
  meals: MealEntry[];
}

export function TodaysDiary({ meals }: TodaysDiaryProps) {
  return (
    <section className="dashboard-diary-section">
      <h2 className="dashboard-diary-heading">Today's Diary</h2>

      {/* Meal cards */}
      <div className="dashboard-diary-meals-list">
        {meals.length > 0 ? (
          meals.map((meal) => <MealCard key={meal.id} meal={meal} />)
        ) : (
          <EmptyState
            icon={UtensilsCrossed}
            title="No meals logged yet today"
            description="Start tracking your nutrition by logging your first meal"
            action={{
              label: "Add Your First Meal",
              onClick: () => console.log("Add meal clicked"),
            }}
          />
        )}
      </div>
    </section>
  );
}
