import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout";
import { DiaryDayView } from "@/components/diary";
import { fetchUser } from "@/server/auth";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/diary/")({
  beforeLoad: async () => {
    const user = await fetchUser();

    if (!user) {
      throw redirect({ to: ROUTES.HOME });
    }

    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    return { user, date: today };
  },
  component: DiaryPage,
});

function DiaryPage() {
  const { user, date } = Route.useRouteContext();

  // Default to today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(date);

  return (
    <AppLayout>
      <div className="diary-page-layout">
        {/* Page Header */}
        <div className="diary-page-header animate-fade-slide-in">
          <div>
            <h1 className="diary-page-title">Food Diary</h1>
            <p className="diary-page-subtitle">
              Track your meals and nutrition intake
            </p>
          </div>
        </div>

        <DiaryDayView
          userId={user.id}
          date={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>
    </AppLayout>
  );
}
