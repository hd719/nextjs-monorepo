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
    <div className="diary-day-container">
      {/* Date Selector */}
      <Card className="diary-day-date-card">
        <div className="diary-day-date-content">
          <div className="diary-day-date-display">
            <Calendar className="diary-day-date-icon" />
            <span className="diary-day-date-text">{displayDate}</span>
          </div>
          <Input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="diary-day-date-input"
          />
        </div>
      </Card>

      {/* Daily Totals Summary */}
      <Card className="diary-day-totals-card">
        <h2 className="diary-day-totals-title">Today's Nutrition</h2>
        {isPending ? (
          <div className="diary-day-totals-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="diary-day-loading-item">
                <div className="diary-day-loading-label"></div>
                <div className="diary-day-loading-value"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="diary-day-totals-grid">
            <div className="diary-day-total-item">
              <p className="diary-day-total-label">Calories</p>
              <p className="diary-day-total-value">{totals?.calories || 0}</p>
              <p className="diary-day-total-unit">kcal</p>
            </div>
            <div className="diary-day-total-item">
              <p className="diary-day-total-label">Protein</p>
              <p className="diary-day-total-value">{totals?.protein || 0}</p>
              <p className="diary-day-total-unit">g</p>
            </div>
            <div className="diary-day-total-item">
              <p className="diary-day-total-label">Carbs</p>
              <p className="diary-day-total-value">{totals?.carbs || 0}</p>
              <p className="diary-day-total-unit">g</p>
            </div>
            <div className="diary-day-total-item">
              <p className="diary-day-total-label">Fat</p>
              <p className="diary-day-total-value">{totals?.fat || 0}</p>
              <p className="diary-day-total-unit">g</p>
            </div>
          </div>
        )}
        {totals && totals.entryCount > 0 && (
          <p className="diary-day-entry-count">
            {totals.entryCount} {totals.entryCount === 1 ? "entry" : "entries"}{" "}
            logged today
          </p>
        )}
      </Card>

      {/* Add Food Button */}
      <div className="diary-day-meals-header">
        <h2 className="diary-day-meals-title">Meals</h2>
        <Button onClick={() => setIsAddFoodOpen(true)}>
          <Plus className="diary-day-add-icon" />
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
