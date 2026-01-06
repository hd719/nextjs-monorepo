import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout";
import {
  DailySummary,
  ExerciseSummary,
  WaterTracker,
  QuickActions,
  ProgressActivityPlaceholder,
  TodaysDiary,
  RecentActivity,
} from "@/components/dashboard";
import { fetchUser } from "@/server/auth";
import { ROUTES } from "@/constants/routes";
import { useProfile } from "@/hooks/useProfile";
import { useDiaryTotals } from "@/hooks/useDiary";
import { useExerciseSummary } from "@/hooks/useExercise";
import {
  useDashboardMeals,
  useRecentActivity,
  useWaterIntake,
} from "@/hooks/useDashboard";
import {
  mockWaterIntake,
  mockMealEntries,
  mockActivities,
} from "@/data/mockData";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async () => {
    const user = await fetchUser();

    if (!user) {
      throw redirect({ to: ROUTES.HOME });
    }

    return { user };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useProfile(user.id);
  const timezone = profile?.timezone || "UTC";
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: timezone,
  });
  const displayDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: timezone,
  });
  const { data: totals, isLoading: isTotalsLoading } = useDiaryTotals(
    user.id,
    today
  );
  const { data: exerciseSummary, isLoading: isExerciseSummaryLoading } =
    useExerciseSummary(user.id, today);
  const { data: meals = [], isLoading: isMealsLoading } = useDashboardMeals(
    user.id,
    today
  );
  const { data: waterIntake, isLoading: isWaterLoading } = useWaterIntake(
    user.id,
    today
  );
  const { data: activities = [], isLoading: isActivitiesLoading } =
    useRecentActivity(user.id, 10);

  const useMockDashboard = import.meta.env.VITE_USE_MOCK_DASHBOARD === "true";
  const waterData = useMockDashboard
    ? mockWaterIntake
    : (waterIntake ?? {
        current: 0,
        goal: 8,
        date: today,
      });
  const mealData = useMockDashboard ? mockMealEntries : meals;
  const activityData = useMockDashboard ? mockActivities : activities;

  // Use user's goals from profile, or fall back to defaults
  const goals = {
    calories: profile?.dailyCalorieGoal || 2000,
    protein: profile?.dailyProteinGoalG || 150,
    carbs: profile?.dailyCarbGoalG || 200,
    fat: profile?.dailyFatGoalG || 65,
  };

  // Build daily summary from real data
  const dailySummary = {
    date: displayDate,
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
      <div className="dashboard-layout">
        {/* Page Header */}
        <div className="dashboard-page-header animate-fade-slide-in">
          <div>
            <h1 className="dashboard-page-title">Dashboard</h1>
            <p className="dashboard-page-subtitle">
              Your daily health and nutrition overview
            </p>
          </div>
        </div>

        {/* Hero: Daily Summary */}
        <DailySummary data={dailySummary} isLoading={isTotalsLoading} />

        {/* Row 1: ExerciseSummary | WaterTracker */}
        <div className="dashboard-grid-row animate-fade-slide-in animate-stagger-1">
          <ExerciseSummary
            data={exerciseSummary ?? null}
            isLoading={isExerciseSummaryLoading}
          />
          <WaterTracker
            data={waterData}
            isLoading={useMockDashboard ? false : isWaterLoading}
          />
        </div>

        {/* Row 2: QuickActions + Progress Activity | TodaysDiary */}
        <div className="dashboard-grid-row animate-fade-slide-in animate-stagger-2">
          <div className="dashboard-left-stack">
            <QuickActions />
            <ProgressActivityPlaceholder />
          </div>
          <TodaysDiary
            meals={mealData}
            isLoading={useMockDashboard ? false : isMealsLoading}
          />
        </div>

        {/* Row 3: RecentActivity (full width) */}
        <div className="animate-fade-slide-in animate-stagger-3">
          <RecentActivity
            activities={activityData}
            isLoading={useMockDashboard ? false : isActivitiesLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
}
