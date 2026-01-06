import { useState } from "react";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  NutritionSummary,
  type NutritionData,
} from "@/components/ui/nutrition-summary";
import { DiaryEntryList } from "./DiaryEntryList";
import { AddFoodDialog } from "./AddFoodDialog";
import { useDiaryDay, useDiaryTotals } from "@/hooks/useDiary";
import { DEFAULT_NUTRITION_GOALS } from "@/constants/defaults";

export interface DiaryDayViewProps {
  userId: string;
  date: string; // YYYY-MM-DD format
  onDateChange: (date: string) => void;
}

export function DiaryDayView({
  userId,
  date,
  onDateChange,
}: DiaryDayViewProps) {
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { data: entries = [], isLoading: isEntriesLoading } = useDiaryDay(
    userId,
    date
  );
  const { data: totals, isLoading: isTotalsLoading } = useDiaryTotals(
    userId,
    date
  );

  // Format date for display
  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleEntryCreated = () => {
    setIsAddFoodOpen(false);
  };

  const isPending = isEntriesLoading || isTotalsLoading;

  // Transform totals to NutritionData format
  const nutritionData: NutritionData = {
    calories: {
      consumed: totals?.calories || 0,
      goal: DEFAULT_NUTRITION_GOALS.calories,
    },
    protein: {
      consumed: totals?.protein || 0,
      goal: DEFAULT_NUTRITION_GOALS.protein,
    },
    carbs: {
      consumed: totals?.carbs || 0,
      goal: DEFAULT_NUTRITION_GOALS.carbs,
    },
    fat: {
      consumed: totals?.fat || 0,
      goal: DEFAULT_NUTRITION_GOALS.fat,
    },
  };

  // Date picker component for the header action
  const DatePicker = (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="nutrition-summary-date-button focus-ring"
          aria-label="Select date"
        >
          <CalendarIcon
            className="nutrition-summary-date-button-icon"
            aria-hidden="true"
          />
          <span className="nutrition-summary-date-button-text">
            {displayDate}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-calendar" align="end">
        <Calendar
          mode="single"
          selected={parse(date, "yyyy-MM-dd", new Date())}
          onSelect={(newDate) => {
            if (newDate) {
              onDateChange(format(newDate, "yyyy-MM-dd"));
              setIsCalendarOpen(false);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="diary-day-container">
      {/* Hero Card: Nutrition Summary (shared component) */}
      <NutritionSummary
        title="Daily Totals"
        data={nutritionData}
        isLoading={isPending}
        headerAction={DatePicker}
      />

      {/* Entry count info */}
      {totals && totals.entryCount > 0 && (
        <p className="diary-entry-count">
          {totals.entryCount} {totals.entryCount === 1 ? "entry" : "entries"}{" "}
          logged today
        </p>
      )}

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
