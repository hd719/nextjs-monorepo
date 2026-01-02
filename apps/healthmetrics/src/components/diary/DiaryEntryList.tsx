import { Coffee, Sandwich, UtensilsCrossed, Cookie } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DiaryEntryWithFood } from "@/server/diary";
import styles from "./DiaryEntryList.module.css";

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
      <div className={styles.container}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className={styles.loadingCard}>
            <div className={styles.loadingTitle}></div>
            <div className={styles.loadingList}>
              <div className={styles.loadingItem}></div>
              <div className={`${styles.loadingItem} w-3/4`}></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className={styles.emptyCard}>
        <UtensilsCrossed className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No entries yet</h3>
        <p className={styles.emptyDescription}>
          Click "Add Food" to log your first meal
        </p>
      </Card>
    );
  }

  const groupedEntries = groupEntriesByMeal(entries);

  return (
    <div className={styles.container}>
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
          <Card key={mealType} className={styles.mealCard}>
            {/* Meal Header */}
            <div className={styles.mealHeader}>
              <div className={styles.mealHeaderLeft}>
                <Icon className={styles.mealIcon} />
                <h3 className={styles.mealLabel}>{label}</h3>
              </div>
              <div className={styles.mealCalories}>
                {mealTotals.calories} cal
              </div>
            </div>

            {/* Entries */}
            <div className={styles.entryList}>
              {mealEntries.map((entry) => (
                <div key={entry.id} className={styles.entry}>
                  <div className={styles.entryContent}>
                    <p className={styles.entryName}>{entry.foodItem.name}</p>
                    {entry.foodItem.brand && (
                      <p className={styles.entryBrand}>
                        {entry.foodItem.brand}
                      </p>
                    )}
                    <p className={styles.entryQuantity}>
                      {entry.quantityG}g
                      {entry.servings && entry.servings !== 1 && (
                        <span> ({entry.servings} servings)</span>
                      )}
                    </p>
                    {entry.notes && (
                      <p className={styles.entryNotes}>{entry.notes}</p>
                    )}
                  </div>

                  <div className={styles.entryNutrition}>
                    <p className={styles.entryCalories}>{entry.calories}</p>
                    <p className={styles.entryUnit}>kcal</p>
                    <div className={styles.entryMacros}>
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
              <div className={styles.mealTotals}>
                <div className={styles.totalsRow}>
                  <span className={styles.totalsLabel}>Meal Total</span>
                  <div className={styles.totalsValues}>
                    <div>{mealTotals.calories} kcal</div>
                    <div className={styles.totalsMacros}>
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
