import { Coffee, Sandwich, UtensilsCrossed, Cookie } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DiaryEntryWithFood } from "@/types/diary";

export interface DiaryEntryListProps {
  entries: DiaryEntryWithFood[];
  isLoading: boolean;
}

// Group entries by meal type
function groupEntriesByMeal(entries: DiaryEntryWithFood[]) {
  const grouped: Record<string, DiaryEntryWithFood[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
    other: [],
  };

  entries.forEach((entry) => {
    const mealType = entry.mealType.toLowerCase();
    if (grouped[mealType]) {
      grouped[mealType].push(entry);
    } else {
      grouped.other.push(entry);
    }
  });

  return grouped;
}

// Get icon and label for meal type
function getMealInfo(mealType: string) {
  switch (mealType) {
    case "breakfast":
      return { icon: Coffee, label: "Breakfast" };
    case "lunch":
      return { icon: Sandwich, label: "Lunch" };
    case "dinner":
      return { icon: UtensilsCrossed, label: "Dinner" };
    case "snack":
      return { icon: Cookie, label: "Snacks" };
    default:
      return { icon: UtensilsCrossed, label: "Other" };
  }
}

export function DiaryEntryList({ entries, isLoading }: DiaryEntryListProps) {
  if (isLoading) {
    return (
      <div className="diary-entry-list-container animate-fade-slide-in animate-stagger-1">
        {[...Array(3)].map((_, i) => (
          <Card
            key={i}
            variant="supporting"
            className="diary-entry-loading-card"
          >
            <div className="diary-entry-loading-title"></div>
            <div className="diary-entry-loading-list">
              <div className="diary-entry-loading-item"></div>
              <div className="diary-entry-loading-item diary-entry-loading-item-short"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="animate-fade-slide-in animate-stagger-1">
        <EmptyState
          icon={UtensilsCrossed}
          title="No entries yet"
          description="Click 'Add Food' to log your first meal"
        />
      </div>
    );
  }

  const groupedEntries = groupEntriesByMeal(entries);

  return (
    <div className="diary-entry-list-container animate-fade-slide-in animate-stagger-1">
      {Object.entries(groupedEntries).map(([mealType, mealEntries]) => {
        if (mealEntries.length === 0) return null;

        const { icon: Icon, label } = getMealInfo(mealType);

        // Calculate meal totals
        const mealTotals = mealEntries.reduce(
          (acc, entry) => ({
            calories: acc.calories + entry.calories,
            protein: acc.protein + entry.protein,
            carbs: acc.carbs + entry.carbs,
            fat: acc.fat + entry.fat,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        return (
          <Card
            key={mealType}
            variant="supporting"
            className="diary-entry-meal-card"
          >
            {/* Meal Header */}
            <div className="diary-entry-meal-header">
              <div className="diary-entry-meal-header-left">
                <Icon className="diary-entry-meal-icon" aria-hidden="true" />
                <h3 className="diary-entry-meal-label">{label}</h3>
              </div>
              <div className="diary-entry-meal-calories">
                <span className="diary-entry-meal-calories-value">
                  {mealTotals.calories}
                </span>{" "}
                cal
              </div>
            </div>

            {/* Entries */}
            <div className="diary-entry-list">
              {mealEntries.map((entry) => (
                <div key={entry.id} className="diary-entry row-hover">
                  <div className="diary-entry-content">
                    <p className="diary-entry-name">{entry.foodItem.name}</p>
                    {entry.foodItem.brand && (
                      <p className="diary-entry-brand">
                        {entry.foodItem.brand}
                      </p>
                    )}
                    <p className="diary-entry-quantity">
                      {entry.quantityG}g
                      {entry.servings && entry.servings !== 1 && (
                        <span> ({entry.servings} servings)</span>
                      )}
                    </p>
                    {entry.notes && (
                      <p className="diary-entry-notes">{entry.notes}</p>
                    )}
                  </div>

                  <div className="diary-entry-nutrition">
                    <p className="diary-entry-calories">{entry.calories}</p>
                    <p className="diary-entry-unit">kcal</p>
                    <div className="diary-entry-macros">
                      <div>P: {entry.protein}g</div>
                      <div>C: {entry.carbs}g</div>
                      <div>F: {entry.fat}g</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Meal Totals */}
            {mealEntries.length > 1 && (
              <div className="diary-entry-meal-totals">
                <div className="diary-entry-totals-row">
                  <span className="diary-entry-totals-label">Meal Total</span>
                  <div className="diary-entry-totals-values">
                    <div>{mealTotals.calories} kcal</div>
                    <div className="diary-entry-totals-macros">
                      P: {mealTotals.protein.toFixed(1)}g • C:{" "}
                      {mealTotals.carbs.toFixed(1)}g • F:{" "}
                      {mealTotals.fat.toFixed(1)}g
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
