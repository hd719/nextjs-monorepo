import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { DiaryDayView } from "@/components/diary/DiaryDayView";
import { fetchUser } from "@/server/auth";
import { getDiaryDay, getDailyTotals } from "@/server/diary";

export const Route = createFileRoute("/diary/")({
  beforeLoad: async () => {
    const user = await fetchUser();

    if (!user) {
      throw redirect({ to: "/" });
    }

    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    // Fetch initial data in parallel
    const [entries, totals] = await Promise.all([
      getDiaryDay({ data: { userId: user.id, date: today } }),
      getDailyTotals({ data: { userId: user.id, date: today } }),
    ]);

    return { user, entries, totals, date: today };
  },
  component: DiaryPage,
});

function DiaryPage() {
  const { user, entries, totals, date } = Route.useRouteContext();

  // Default to today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(date);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Food Diary</h1>
        </div>

        <DiaryDayView
          userId={user.id}
          date={selectedDate}
          onDateChange={setSelectedDate}
          initialEntries={entries}
          initialTotals={totals}
        />
      </div>
    </AppLayout>
  );
}
