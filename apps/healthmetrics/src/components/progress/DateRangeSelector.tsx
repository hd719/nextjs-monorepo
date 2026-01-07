import type { DateRange } from "@/types";
import { DATE_RANGE_OPTIONS } from "@/constants/progress";
import { cn } from "@/utils/cn";

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangeSelector({
  value,
  onChange,
  className,
}: DateRangeSelectorProps) {
  return (
    <div
      className={cn("progress-date-range-selector", className)}
      role="group"
      aria-label="Select time period"
    >
      {DATE_RANGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "progress-date-range-btn",
            value === option.value && "progress-date-range-btn-active"
          )}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
