import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
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
import type { DailySummary as DailySummaryType } from "@/types";
import { ROUTES } from "@/constants/routes";

export interface DailySummaryProps {
  data: DailySummaryType;
  isLoading?: boolean;
}

export function DailySummary({ data, isLoading = false }: DailySummaryProps) {
  const navigate = useNavigate();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const nutritionData: NutritionData = {
    calories: data.calories,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fat,
  };

  // Handle date selection - navigate to diary with selected date
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      setIsCalendarOpen(false);
      // Navigate to diary page with the selected date
      navigate({ to: ROUTES.DIARY, search: { date: dateStr } });
    }
  };

  // Date picker component for the header action
  const DatePicker = (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="nutrition-summary-date-button focus-ring"
          aria-label="Select date to view diary"
        >
          <CalendarIcon
            className="nutrition-summary-date-button-icon"
            aria-hidden="true"
          />
          <span className="nutrition-summary-date-button-text">
            {data.date}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-calendar" align="end">
        <Calendar
          mode="single"
          selected={new Date()}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <NutritionSummary
      title="Today's Summary"
      data={nutritionData}
      isLoading={isLoading}
      headerAction={DatePicker}
    />
  );
}
