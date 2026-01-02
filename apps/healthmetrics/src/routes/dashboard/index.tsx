import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { DailySummary } from "@/components/dashboard/DailySummary";
import { ExerciseSummary } from "@/components/dashboard/ExerciseSummary";
import { WaterTracker } from "@/components/dashboard/WaterTracker";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TodaysDiary } from "@/components/dashboard/TodaysDiary";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { fetchUser } from "@/server/auth";
import {
  mockDailySummary,
  mockExerciseSummary,
  mockWaterIntake,
  mockMealEntries,
  mockActivities,
} from "@/data/mockData";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async () => {
    const user = await fetchUser();

    if (!user) {
      throw redirect({ to: "/" });
    }

    return { user };
  },
  component: DashboardPage,
});

function DashboardPage() {
  // Mock loading state - set to true to test loading skeletons
  const [isLoading] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Daily Summary */}
        <DailySummary data={mockDailySummary} />

        {/* Exercise Summary */}
        <ExerciseSummary data={mockExerciseSummary} isLoading={isLoading} />

        {/* Water Tracker */}
        <WaterTracker data={mockWaterIntake} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Today's Diary */}
        <TodaysDiary meals={mockMealEntries} />

        {/* Recent Activity */}
        <RecentActivity activities={mockActivities} isLoading={isLoading} />
      </div>
    </AppLayout>
  );
}
