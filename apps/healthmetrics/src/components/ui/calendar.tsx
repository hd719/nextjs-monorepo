import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/utils/cn";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("calendar-root", className)}
      classNames={{
        // Container structure
        months: "calendar-months",
        month: "calendar-month",

        // Caption - contains month/year dropdowns or label
        month_caption: "calendar-month-caption",
        caption_label: "calendar-caption-label",

        // Dropdown mode styles
        dropdowns: "calendar-dropdowns",
        dropdown: "calendar-dropdown",
        months_dropdown: "calendar-dropdown",
        years_dropdown: "calendar-dropdown",

        // Navigation
        nav: "calendar-nav",
        button_previous: "calendar-nav-button",
        button_next: "calendar-nav-button",

        // Calendar grid
        month_grid: "calendar-grid",
        weekdays: "calendar-weekdays",
        weekday: "calendar-weekday",
        week: "calendar-week",

        // Day cells
        day: "calendar-day",
        day_button: "calendar-day-button",

        // Day states
        selected: "calendar-day-selected",
        today: "calendar-day-today",
        outside: "calendar-day-outside",
        disabled: "calendar-day-disabled",
        hidden: "calendar-day-hidden",

        // Range selection
        range_start: "calendar-range-start",
        range_end: "calendar-range-end",
        range_middle: "calendar-range-middle",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon =
            orientation === "left" ? ChevronLeftIcon : ChevronRightIcon;
          return <Icon aria-hidden="true" />;
        },
        DayButton: ({ modifiers, className, ...props }) => {
          const isToday = modifiers.today;
          const isSelected = modifiers.selected;

          return (
            <button
              className={cn(
                "calendar-day-button",
                isToday && !isSelected && "calendar-day-today-btn",
                isSelected && "calendar-day-selected-btn",
                className
              )}
              {...props}
            />
          );
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
