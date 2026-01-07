import { useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout";
import { DiaryDayView } from "@/components/diary";

export const Route = createLazyFileRoute("/diary/")({
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
