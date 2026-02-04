import { useState } from "react";
import { format, parse, subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Plus,
  Copy,
  ScanBarcode,
} from "lucide-react";
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
import { useToast, ToastContainer } from "@/components/ui/toast";
import { DiaryEntryList } from "./DiaryEntryList";
import { AddFoodDialog } from "./AddFoodDialog";
import { FastingWarningBanner } from "./FastingWarningBanner";
import { ScannerDialog } from "@/components/scanner";
import {
  useDiaryDay,
  useDiaryTotals,
  useCopyDiaryDay,
  useActiveFast,
  useExerciseSummary,
} from "@/hooks";
import { DEFAULT_NUTRITION_GOALS } from "@/constants/defaults";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/utils/time-helpers";
import { ROUTES } from "@/constants/routes";
import { Link } from "@tanstack/react-router";

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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { toasts, toast, removeToast } = useToast();
  const { data: entries = [], isLoading: isEntriesLoading } = useDiaryDay(
    userId,
    date
  );
  const { data: totals, isLoading: isTotalsLoading } = useDiaryTotals(
    userId,
    date
  );
  const { data: exerciseSummary, isLoading: isExerciseLoading } =
    useExerciseSummary(userId, date);
  const { data: activeFast } = useActiveFast(userId);
  const copyDiaryMutation = useCopyDiaryDay();

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

  const handleScanSuccess = () => {
    setIsScannerOpen(false);
  };

  // Copy yesterday's meals to today
  const handleCopyYesterday = async () => {
    const yesterday = format(
      subDays(parse(date, "yyyy-MM-dd", new Date()), 1),
      "yyyy-MM-dd"
    );
    try {
      const result = await copyDiaryMutation.mutateAsync({
        userId,
        sourceDate: yesterday,
        targetDate: date,
      });
      if (result.copiedCount > 0) {
        toast.success(
          "Meals Copied",
          `Copied ${result.copiedCount} ${result.copiedCount === 1 ? "entry" : "entries"} from yesterday`
        );
      } else {
        toast.info("No Meals", "No meals found from yesterday to copy");
      }
    } catch {
      toast.error("Copy Failed", "Failed to copy meals from yesterday");
    }
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
      {/* Fasting Warning Banner - shows when user has an active fast */}
      <FastingWarningBanner userId={userId} />

      {/* Hero Card: Nutrition Summary (shared component) */}
      <NutritionSummary
        title="Daily Totals"
        data={nutritionData}
        isLoading={isPending}
        headerAction={DatePicker}
      />

      <section className="diary-exercise-section">
        <div className="diary-exercise-header">
          <h2 className="diary-exercise-title">Exercise</h2>
          <Link to={ROUTES.EXERCISE} className="diary-exercise-link">
            View workouts
          </Link>
        </div>
        <Card variant="supporting" className="diary-exercise-card">
          <CardContent className="diary-exercise-content">
            {isExerciseLoading ? (
              <div className="diary-exercise-loading">Loading exercise…</div>
            ) : !exerciseSummary ||
                (exerciseSummary.exercisesCompleted === 0 &&
                  exerciseSummary.totalMinutes === 0 &&
                  exerciseSummary.caloriesBurned === 0) ? (
              <div className="diary-exercise-empty">
                <p className="diary-exercise-empty-title">
                  No workouts logged
                </p>
                <p className="diary-exercise-empty-subtitle">
                  Log a workout or connect WHOOP to import activity.
                </p>
              </div>
            ) : (
              <div className="diary-exercise-grid">
                <div className="diary-exercise-stat">
                  <div className="diary-exercise-stat-value">
                    {exerciseSummary.exercisesCompleted}
                  </div>
                  <div className="diary-exercise-stat-label">workouts</div>
                </div>
                <div className="diary-exercise-stat">
                  <div className="diary-exercise-stat-value">
                    {formatDuration(exerciseSummary.totalMinutes)}
                  </div>
                  <div className="diary-exercise-stat-label">duration</div>
                </div>
                <div className="diary-exercise-stat">
                  <div className="diary-exercise-stat-value">
                    {exerciseSummary.caloriesBurned}
                  </div>
                  <div className="diary-exercise-stat-label">calories</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

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
        <div className="diary-day-actions">
          <Button
            variant="outline"
            onClick={handleCopyYesterday}
            disabled={copyDiaryMutation.isPending}
          >
            <Copy className="diary-day-add-icon" />
            {copyDiaryMutation.isPending ? "Copying..." : "Copy Yesterday"}
          </Button>
          <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
            <ScanBarcode className="diary-day-add-icon" />
            Scan Barcode
          </Button>
          <Button onClick={() => setIsAddFoodOpen(true)}>
            <Plus className="diary-day-add-icon" />
            Add Food
          </Button>
        </div>
      </div>

      {/* Diary Entries List */}
      <DiaryEntryList
        entries={entries}
        isLoading={isPending}
        onAddFood={() => setIsAddFoodOpen(true)}
      />

      {/* Add Food Dialog */}
      <AddFoodDialog
        open={isAddFoodOpen}
        onOpenChange={setIsAddFoodOpen}
        userId={userId}
        date={date}
        onSuccess={handleEntryCreated}
        activeFast={activeFast}
      />

      {/* Barcode Scanner Dialog */}
      <ScannerDialog
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        userId={userId}
        date={date}
        onSuccess={handleScanSuccess}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
