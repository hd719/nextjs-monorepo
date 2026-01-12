import { UtensilsCrossed } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { MealCard } from "@/components/diary/MealCard";
import { EmptyState } from "@/components/ui/empty-state";
import type { MealEntry } from "@/types";
import { ROUTES } from "@/constants/routes";

export interface TodaysDiaryProps {
  meals: MealEntry[];
  isLoading?: boolean;
}

export function TodaysDiary({ meals, isLoading }: TodaysDiaryProps) {
  const navigate = useNavigate();

  // Loading state - show skeleton cards
  if (isLoading) {
    return (
      <section className="dashboard-diary-section">
        <h2 className="dashboard-diary-heading">Today&apos;s Diary</h2>
        <Card variant="supporting" className="dashboard-diary-card">
          <div className="dashboard-diary-meals-list">
            {/* Show 2 skeleton meal cards */}
            {[1, 2].map((i) => (
              <MealCard
                key={`skeleton-${i}`}
                meal={{
                  id: `skeleton-${i}`,
                  type: "breakfast",
                  foods: [],
                  totalCalories: 0,
                }}
                isLoading
              />
            ))}
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="dashboard-diary-section">
      <h2 className="dashboard-diary-heading">Today&apos;s Diary</h2>

      <Card variant="supporting" className="dashboard-diary-card">
        {/* Meal cards */}
        <div className="dashboard-diary-meals-list">
          {meals.length > 0 ? (
            meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} clickable />
            ))
          ) : (
            <EmptyState
              icon={UtensilsCrossed}
              title="No meals logged yet today"
              description="Start tracking your nutrition by logging your first meal"
              action={{
                label: "Add Your First Meal",
                onClick: () => navigate({ to: ROUTES.DIARY }),
              }}
              framed={false}
            />
          )}
        </div>
      </Card>
    </section>
  );
}
