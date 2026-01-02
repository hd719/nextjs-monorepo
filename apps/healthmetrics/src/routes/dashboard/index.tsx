import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { DailySummary } from "@/components/dashboard/DailySummary";
import { ExerciseSummary } from "@/components/dashboard/ExerciseSummary";
import { WaterTracker } from "@/components/dashboard/WaterTracker";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TodaysDiary } from "@/components/dashboard/TodaysDiary";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { fetchUser } from "@/server/auth";
import { getDailyTotals } from "@/server/diary";
import { getUserProfile } from "@/server/profile";
import {
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
  // Use loader to fetch dashboard data with automatic loading states
  loader: async ({ context }) => {
    const today = new Date().toISOString().split("T")[0];
    const userId = context.user?.id;

    if (!userId) {
      return { totals: null, profile: null };
    }

    try {
      // Fetch totals and profile in parallel
      const [totals, profile] = await Promise.all([
        getDailyTotals({ data: { userId, date: today } }),
        getUserProfile({ data: { userId } }),
      ]);
      return { totals, profile };
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      return { totals: null, profile: null };
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { totals, profile } = Route.useLoaderData();

  // Use user's goals from profile, or fall back to defaults
  const goals = {
    calories: profile?.dailyCalorieGoal || 2000,
    protein: profile?.dailyProteinGoalG || 150,
    carbs: profile?.dailyCarbGoalG || 200,
    fat: profile?.dailyFatGoalG || 65,
  };

  // Build daily summary from real data
  const dailySummary = {
    date: new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    calories: {
      consumed: totals?.calories || 0,
      goal: goals.calories,
    },
    protein: {
      consumed: totals?.protein || 0,
      goal: goals.protein,
    },
    carbs: {
      consumed: totals?.carbs || 0,
      goal: goals.carbs,
    },
    fat: {
      consumed: totals?.fat || 0,
      goal: goals.fat,
    },
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Daily Summary - Now using real data from diary entries */}
        <DailySummary data={dailySummary} />

        {/* Exercise Summary */}
        <ExerciseSummary data={mockExerciseSummary} isLoading={false} />

        {/* Water Tracker */}
        <WaterTracker data={mockWaterIntake} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Today's Diary */}
        <TodaysDiary meals={mockMealEntries} />

        {/* Recent Activity */}
        <RecentActivity activities={mockActivities} isLoading={false} />
      </div>
    </AppLayout>
  );
}
