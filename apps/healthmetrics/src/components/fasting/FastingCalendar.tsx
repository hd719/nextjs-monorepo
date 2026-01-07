import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFastingCalendar } from "@/hooks";
import { cn } from "@/utils";
import type { FastingCalendarDay } from "@/types";

interface FastingCalendarProps {
  userId: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getMonthString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function FastingCalendar({ userId }: FastingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const monthString = useMemo(() => getMonthString(currentDate), [currentDate]);

  const { data: calendarData, isLoading } = useFastingCalendar(
    userId,
    monthString
  );

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create grid with leading empty cells
    const grid: (FastingCalendarDay | null)[] = [];

    // Add empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      grid.push(null);
    }

    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = calendarData?.find((d) => d.date === dateStr);

      grid.push(
        dayData || {
          date: dateStr,
          hasFast: false,
        }
      );
    }

    return grid;
  }, [currentDate, calendarData]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Check if we're viewing current month
  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  // Calculate stats for current view
  const monthStats = useMemo(() => {
    if (!calendarData) return { completed: 0, total: 0 };
    const completed = calendarData.filter((d) => d.completedAtTarget).length;
    const total = calendarData.filter((d) => d.hasFast).length;
    return { completed, total };
  }, [calendarData]);

  return (
    <Card variant="supporting" className="fasting-calendar-card">
      <CardHeader className="fasting-calendar-header">
        <div className="fasting-calendar-nav">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="fasting-calendar-nav-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="fasting-calendar-title">
            {formatMonthYear(currentDate)}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="fasting-calendar-nav-btn"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        {!isCurrentMonth && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="fasting-calendar-today-btn"
          >
            Today
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="fasting-calendar-loading">
            <Loader2 className="fasting-calendar-loading-icon" />
          </div>
        ) : (
          <>
            {/* Weekday headers */}
            <div className="fasting-calendar-weekdays">
              {WEEKDAYS.map((day) => (
                <div key={day} className="fasting-calendar-weekday">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="fasting-calendar-grid">
              {calendarGrid.map((day, index) => (
                <CalendarDay key={index} day={day} />
              ))}
            </div>

            {/* Legend */}
            <div className="fasting-calendar-legend">
              <div className="fasting-calendar-legend-item">
                <div className="fasting-calendar-legend-dot fasting-calendar-legend-complete" />
                <span>Completed</span>
              </div>
              <div className="fasting-calendar-legend-item">
                <div className="fasting-calendar-legend-dot fasting-calendar-legend-partial" />
                <span>Ended Early</span>
              </div>
              <div className="fasting-calendar-legend-item">
                <div className="fasting-calendar-legend-dot fasting-calendar-legend-none" />
                <span>No Fast</span>
              </div>
            </div>

            {/* Month summary */}
            {monthStats.total > 0 && (
              <div className="fasting-calendar-summary">
                <span className="fasting-calendar-summary-value">
                  {monthStats.completed}
                </span>
                <span className="fasting-calendar-summary-label">
                  {" "}
                  of {monthStats.total} fasts completed at target
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface CalendarDayProps {
  day: FastingCalendarDay | null;
}

function CalendarDay({ day }: CalendarDayProps) {
  if (!day) {
    return <div className="fasting-calendar-day fasting-calendar-day-empty" />;
  }

  const dayNum = parseInt(day.date.split("-")[2], 10);
  const isToday = day.date === new Date().toISOString().split("T")[0];

  // Determine the styling based on fasting status
  let statusClass = "fasting-calendar-day-none";
  if (day.hasFast) {
    statusClass = day.completedAtTarget
      ? "fasting-calendar-day-complete"
      : "fasting-calendar-day-partial";
  }

  // Format duration if available
  const durationText = day.durationMin
    ? `${Math.floor(day.durationMin / 60)}h ${day.durationMin % 60}m`
    : null;

  return (
    <div
      className={cn(
        "fasting-calendar-day",
        statusClass,
        isToday && "fasting-calendar-day-today"
      )}
      title={
        day.hasFast
          ? `${day.completedAtTarget ? "Completed" : "Ended early"}${durationText ? ` - ${durationText}` : ""}`
          : undefined
      }
    >
      <span className="fasting-calendar-day-num">{dayNum}</span>
      {day.hasFast && <div className="fasting-calendar-day-indicator" />}
    </div>
  );
}
