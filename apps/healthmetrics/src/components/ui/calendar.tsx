import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/utils/cn";
import { buttonVariants } from "@/components/ui/button";

/**
 * Calendar component built on react-day-picker with Tailwind styling
 *
 * Uses pure Tailwind classes (no defaultClassNames merge) for reliable styling.
 * Supports dropdown mode for year/month selection.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 rounded-md relative", className)}
      style={{ backgroundColor: "var(--popover)" }}
      classNames={{
        // Container structure
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",

        // Caption - contains month/year dropdowns or label
        month_caption: "flex justify-center items-center h-7 gap-1",
        caption_label: "text-sm font-medium",

        // Dropdown mode styles
        dropdowns: "flex items-center gap-2",
        dropdown:
          "appearance-none bg-transparent border border-input rounded-md px-2 py-1 text-sm font-medium cursor-pointer hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
        months_dropdown:
          "appearance-none bg-transparent border border-input rounded-md px-2 py-1 text-sm font-medium cursor-pointer hover:bg-accent",
        years_dropdown:
          "appearance-none bg-transparent border border-input rounded-md px-2 py-1 text-sm font-medium cursor-pointer hover:bg-accent",

        // Navigation - positioned to appear on the same row as caption
        nav: "flex items-center gap-1 absolute left-3 right-3 top-3 h-7 justify-between pointer-events-none",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground pointer-events-auto"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground pointer-events-auto"
        ),

        // Calendar grid
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",

        // Day cells
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
        ),

        // Day states
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today:
          "[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:font-semibold",
        outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",

        // Range selection
        range_start: "day-range-start",
        range_end: "day-range-end",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon =
            orientation === "left" ? ChevronLeftIcon : ChevronRightIcon;
          return <Icon className="h-4 w-4" />;
        },
        DayButton: ({ day, modifiers, className, ...props }) => {
          const isToday = modifiers.today;
          const isSelected = modifiers.selected;

          return (
            <button
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-9 w-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground",
                isToday &&
                  !isSelected &&
                  "bg-accent text-accent-foreground font-semibold",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
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
