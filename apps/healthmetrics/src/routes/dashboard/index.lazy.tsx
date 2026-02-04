import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout";
import {
  AchievementsCard,
  DailySummary,
  ExerciseSummary,
  FastingCard,
  ProfileCompletion,
  WaterTracker,
  QuickActions,
  ProgressActivityPlaceholder,
  SleepCard,
  StreaksCard,
  TodaysDiary,
  RecentActivity,
} from "@/components/dashboard";
import { DevTools } from "@/components/dev";
import { useToast, ToastContainer } from "@/components/ui/toast";
import {
  useProfile,
  useDiaryTotals,
  useExerciseSummary,
  useDashboardMeals,
  useRecentActivity,
  useWaterIntake,
  useUpdateWaterIntake,
  useStepCount,
  useWeightTrend,
  useSleepEntry,
  useStreaks,
  useAchievementSummary,
} from "@/hooks";
import {
  mockWaterIntake,
  mockMealEntries,
  mockActivities,
  mockSleepCardData,
  mockStreaks,
  mockAchievementSummary,
} from "@/data";
import { formatDateKey, resolveTimezone, toSleepCardData } from "@/utils";
import { getWhoopIntegrationStatus } from "@/server/integrations";

export const Route = createLazyFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const { toasts, toast, removeToast } = useToast();
  const { data: profile } = useProfile(user.id);
  const timezone = resolveTimezone(profile?.timezone);
  const today = formatDateKey(new Date(), timezone);
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
  // Mock data toggle for development/testing
  const useMockDashboard = import.meta.env.VITE_USE_MOCK_DASHBOARD === "true";

  // Sleep, streaks, and achievements data
  const { data: sleepEntry, isLoading: isSleepLoading } = useSleepEntry(
    user.id,
    today
  );
  const { data: streaks, isLoading: isStreaksLoading } = useStreaks(user.id);
  const { data: achievementSummary, isLoading: isAchievementsLoading } =
    useAchievementSummary(user.id);
  const whoopStatusQuery = useQuery({
    queryKey: ["whoop-integration-status"],
    queryFn: async () => getWhoopIntegrationStatus(),
    enabled: !useMockDashboard,
  });

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

  // Resolve data sources based on mock toggle
  const waterData = useMockDashboard
    ? mockWaterIntake
    : (waterIntake ?? { current: 0, goal: 8, date: today });
  const mealData = useMockDashboard ? mockMealEntries : meals;
  const activityData = useMockDashboard ? mockActivities : activities;

  // Resolve sleep/streaks/achievements data based on mock toggle
  const sleepData = useMockDashboard
    ? mockSleepCardData
    : toSleepCardData(sleepEntry);
  const streaksData = useMockDashboard ? mockStreaks : streaks;
  const achievementsData = useMockDashboard
    ? mockAchievementSummary
    : achievementSummary;

  // Disable loading states and handlers when using mock data
  const waterLoading = useMockDashboard ? false : isWaterLoading;
  const mealsLoading = useMockDashboard ? false : isMealsLoading;
  const activitiesLoading = useMockDashboard ? false : isActivitiesLoading;
  const sleepLoading = useMockDashboard ? false : isSleepLoading;
  const streaksLoading = useMockDashboard ? false : isStreaksLoading;
  const achievementsLoading = useMockDashboard ? false : isAchievementsLoading;
  const waterUpdateHandler = useMockDashboard ? undefined : handleWaterUpdate;

  const whoopStatus = whoopStatusQuery.data?.status;
  const sleepSourceTone = whoopStatusQuery.isLoading
    ? "loading"
    : whoopStatus === "connected"
      ? "whoop"
      : "manual";
  const sleepSourceLabel = whoopStatusQuery.isLoading
    ? "Checking..."
    : whoopStatus === "connected"
      ? "WHOOP"
      : "Manual";
  const showSleepSource = !useMockDashboard;

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

        {/* Row 2: Sleep | Fasting | Streaks | Achievements */}
        <div className="dashboard-grid-row-4 animate-fade-slide-in animate-stagger-2">
          <SleepCard
            data={sleepData}
            isLoading={sleepLoading}
            sourceLabel={showSleepSource ? sleepSourceLabel : undefined}
            sourceTone={showSleepSource ? sleepSourceTone : undefined}
          />
          <FastingCard userId={user.id} />
          <StreaksCard data={streaksData ?? null} isLoading={streaksLoading} />
          <AchievementsCard
            data={achievementsData ?? null}
            isLoading={achievementsLoading}
          />
        </div>

        {/* Row 3: Your Progress | Today's Diary */}
        <div className="dashboard-grid-row animate-fade-slide-in animate-stagger-3">
          <ProgressActivityPlaceholder
            stepData={stepCount}
            weightData={weightTrend}
            isWeightLoading={isWeightLoading}
          />
          <TodaysDiary meals={mealData} isLoading={mealsLoading} />
        </div>

        {/* Row 4: Quick Actions (full width) */}
        <div className="animate-fade-slide-in animate-stagger-4">
          <QuickActions />
        </div>

        {/* Row 5: Recent Activity (full width) */}
        <div className="animate-fade-slide-in animate-stagger-5">
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
