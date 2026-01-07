import { createLazyFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout";
import {
  DailySummary,
  ExerciseSummary,
  ProfileCompletion,
  WaterTracker,
  QuickActions,
  ProgressActivityPlaceholder,
  TodaysDiary,
  RecentActivity,
} from "@/components/dashboard";
import { DevTools } from "@/components/dev";
import { useToast, ToastContainer } from "@/components/ui/toast";
import { useProfile } from "@/hooks/useProfile";
import { useDiaryTotals } from "@/hooks/useDiary";
import { useExerciseSummary } from "@/hooks/useExercise";
import {
  useDashboardMeals,
  useRecentActivity,
  useWaterIntake,
  useUpdateWaterIntake,
  useStepCount,
} from "@/hooks/useDashboard";
import { useWeightTrend } from "@/hooks/useWeight";
import {
  mockWaterIntake,
  mockMealEntries,
  mockActivities,
} from "@/data/mockData";

export const Route = createLazyFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const { toasts, toast, removeToast } = useToast();
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
  const { mutate: updateWater } = useUpdateWaterIntake();
  const { data: stepCount } = useStepCount(user.id, today);
  const { data: weightTrend, isLoading: isWeightLoading } = useWeightTrend(
    user.id,
    7
  );
  const { data: activities = [], isLoading: isActivitiesLoading } =
    useRecentActivity(user.id, 10);

  // Handler for water intake updates with toast feedback
  const handleWaterUpdate = (glasses: number) => {
    const previousGlasses = waterIntake?.current ?? 0;
    updateWater(
      { userId: user.id, date: today, glasses },
      {
        onSuccess: () => {
          if (glasses > previousGlasses) {
            toast.success("Water logged!", `${glasses} glasses today`);
          }
        },
      }
    );
  };

  // Mock data toggle for development/testing
  const useMockDashboard = import.meta.env.VITE_USE_MOCK_DASHBOARD === "true";

  // Resolve data sources based on mock toggle
  const waterData = useMockDashboard
    ? mockWaterIntake
    : (waterIntake ?? { current: 0, goal: 8, date: today });
  const mealData = useMockDashboard ? mockMealEntries : meals;
  const activityData = useMockDashboard ? mockActivities : activities;

  // Disable loading states and handlers when using mock data
  const waterLoading = useMockDashboard ? false : isWaterLoading;
  const mealsLoading = useMockDashboard ? false : isMealsLoading;
  const activitiesLoading = useMockDashboard ? false : isActivitiesLoading;
  const waterUpdateHandler = useMockDashboard ? undefined : handleWaterUpdate;

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

        {/* Profile Completion (only shows if incomplete) */}
        <ProfileCompletion profile={profile ?? null} />

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
            onUpdate={waterUpdateHandler}
            isLoading={waterLoading}
          />
        </div>

        {/* Row 2: QuickActions + Progress Activity | TodaysDiary */}
        <div className="dashboard-grid-row animate-fade-slide-in animate-stagger-2">
          <div className="dashboard-left-stack">
            <QuickActions />
            <ProgressActivityPlaceholder
              stepData={stepCount}
              weightData={weightTrend}
              isWeightLoading={isWeightLoading}
            />
          </div>
          <TodaysDiary meals={mealData} isLoading={mealsLoading} />
        </div>

        {/* Row 3: RecentActivity (full width) */}
        <div className="animate-fade-slide-in animate-stagger-3">
          <RecentActivity
            activities={activityData}
            isLoading={activitiesLoading}
          />
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Dev tools (only visible in development) */}
      <DevTools userId={user.id} />
    </AppLayout>
  );
}
