import { useState, useEffect, useTransition } from "react";
import { Calendar, Plus } from "lucide-react";
import {
  getDiaryDay,
  getDailyTotals,
  type DiaryEntryWithFood,
  type DailyTotals,
} from "@/server/diary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DiaryEntryList } from "./DiaryEntryList";
import { AddFoodDialog } from "./AddFoodDialog";
import styles from "./DiaryDayView.module.css";

export interface DiaryDayViewProps {
  userId: string;
  date: string; // YYYY-MM-DD format
  onDateChange: (date: string) => void;
  initialEntries?: DiaryEntryWithFood[];
  initialTotals?: DailyTotals | null;
}

export function DiaryDayView({
  userId,
  date,
  onDateChange,
  initialEntries = [],
  initialTotals = null,
}: DiaryDayViewProps) {
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [entries, setEntries] = useState(initialEntries);
  const [totals, setTotals] = useState(initialTotals);
  const [isPending, startTransition] = useTransition();

  // Fetch data when date changes - using startTransition for better UX
  useEffect(() => {
    startTransition(async () => {
      try {
        const [entriesData, totalsData] = await Promise.all([
          getDiaryDay({ data: { userId, date } }),
          getDailyTotals({ data: { userId, date } }),
        ]);
        setEntries(entriesData);
        setTotals(totalsData);
      } catch (error) {
        console.error("Failed to fetch diary data:", error);
      }
    });
  }, [userId, date]);

  // Format date for display
  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Handle successful entry creation - refetch data
  const handleEntryCreated = () => {
    setIsAddFoodOpen(false);
    // Refetch data with transition for smooth loading state
    startTransition(async () => {
      try {
        const [entriesData, totalsData] = await Promise.all([
          getDiaryDay({ data: { userId, date } }),
          getDailyTotals({ data: { userId, date } }),
        ]);
        setEntries(entriesData);
        setTotals(totalsData);
      } catch (error) {
        console.error("Failed to refresh diary data:", error);
      }
    });
  };

  return (
    <div className={styles.container}>
      {/* Date Selector */}
      <Card className={styles.dateCard}>
        <div className={styles.dateContent}>
          <div className={styles.dateDisplay}>
            <Calendar className={styles.dateIcon} />
            <span className={styles.dateText}>{displayDate}</span>
          </div>
          <Input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </Card>

      {/* Daily Totals Summary */}
      <Card className={styles.totalsCard}>
        <h2 className={styles.totalsTitle}>Today's Nutrition</h2>
        {isPending ? (
          <div className={styles.totalsGrid}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.loadingItem}>
                <div className={styles.loadingLabel}></div>
                <div className={styles.loadingValue}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.totalsGrid}>
            <div className={styles.totalItem}>
              <p className={styles.totalLabel}>Calories</p>
              <p className={styles.totalValue}>{totals?.calories || 0}</p>
              <p className={styles.totalUnit}>kcal</p>
            </div>
            <div className={styles.totalItem}>
              <p className={styles.totalLabel}>Protein</p>
              <p className={styles.totalValue}>{totals?.protein || 0}</p>
              <p className={styles.totalUnit}>g</p>
            </div>
            <div className={styles.totalItem}>
              <p className={styles.totalLabel}>Carbs</p>
              <p className={styles.totalValue}>{totals?.carbs || 0}</p>
              <p className={styles.totalUnit}>g</p>
            </div>
            <div className={styles.totalItem}>
              <p className={styles.totalLabel}>Fat</p>
              <p className={styles.totalValue}>{totals?.fat || 0}</p>
              <p className={styles.totalUnit}>g</p>
            </div>
          </div>
        )}
        {totals && totals.entryCount > 0 && (
          <p className={styles.entryCount}>
            {totals.entryCount} {totals.entryCount === 1 ? "entry" : "entries"}{" "}
            logged today
          </p>
        )}
      </Card>

      {/* Add Food Button */}
      <div className={styles.mealsHeader}>
        <h2 className={styles.mealsTitle}>Meals</h2>
        <Button onClick={() => setIsAddFoodOpen(true)}>
          <Plus className={styles.addIcon} />
          Add Food
        </Button>
      </div>

      {/* Diary Entries List */}
      <DiaryEntryList entries={entries} isLoading={isPending} />

      {/* Add Food Dialog */}
      <AddFoodDialog
        open={isAddFoodOpen}
        onOpenChange={setIsAddFoodOpen}
        userId={userId}
        date={date}
        onSuccess={handleEntryCreated}
      />
    </div>
  );
}
