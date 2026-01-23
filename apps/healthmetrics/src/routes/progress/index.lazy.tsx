/**
 * Progress Page Component (Lazy Loaded)
 *
 * Analytics dashboard showing health progress over time.
 * This component is lazy-loaded to defer the Recharts bundle
 * until the user navigates to /progress.
 *
 * Features:
 * - At-a-glance summary metrics
 * - Weight trend chart
 * - Calorie intake visualization
 * - Macro breakdown donut
 * - Exercise activity heatmap
 * - Weekly comparison table
 * - Streaks and achievements
 * - AI-powered insights
 */

import { useMemo, useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout";
import { mockProgressData, filterByDateRange } from "@/data";
import type { DateRange } from "@/types";
import {
  ProgressSummary,
  DateRangeSelector,
  WeightTrendChart,
  CalorieIntakeChart,
  MacroBreakdown,
  ExerciseHeatmap,
  WeeklyComparison,
  StreaksProgressCard,
  AchievementsProgressCard,
  InsightsPanel,
  SleepProgressCard,
  FastingProgressCard,
} from "@/components/progress";
import { useSleepAverage, useSleepHistory } from "@/hooks";
import { DEFAULT_SLEEP_GOAL } from "@/types/sleep";
import { getWhoopIntegrationStatus } from "@/server/integrations";

export const Route = createLazyFileRoute("/progress/")({
  component: ProgressPage,
});

function ProgressPage() {
  const { user } = Route.useRouteContext();
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const { data: sleepHistory = [] } = useSleepHistory(user.id, 7);
  const { data: sleepAverage } = useSleepAverage(user.id, 7);
  const useMockProgress = import.meta.env.VITE_USE_MOCK_DASHBOARD === "true";
  const whoopStatusQuery = useQuery({
    queryKey: ["whoop-integration-status"],
    queryFn: async () => getWhoopIntegrationStatus(),
  });

  // In production, these would be fetched based on dateRange
  // For now, use mock data with filtering
  const weightData = filterByDateRange(
    mockProgressData.weightHistory,
    dateRange
  );
  const calorieData = filterByDateRange(
    mockProgressData.calorieHistory,
    dateRange
  );

  const { sleepData, sleepIsEmpty } = useMemo(() => {
    if (useMockProgress) {
      return { sleepData: mockProgressData.sleepData, sleepIsEmpty: false };
    }

    if (!sleepHistory.length) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const weeklyData = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        return {
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          hours: 0,
        };
      });

      return {
        sleepData: {
          avgHours: 0,
          goalHours: DEFAULT_SLEEP_GOAL,
          quality: 0,
          weeklyData,
        },
        sleepIsEmpty: true,
      };
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const entriesByDate = new Map(
      sleepHistory.map((entry) => [entry.date, entry])
    );

    const weeklyData = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const key = date.toISOString().split("T")[0];
      const entry = entriesByDate.get(key);
      const hours = entry ? entry.hoursSlept : 0;
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        hours: Number(hours.toFixed(1)),
      };
    });

    const avgHours =
      sleepAverage?.averageHours ??
      weeklyData.reduce((sum, day) => sum + day.hours, 0) / weeklyData.length;
    const avgQuality = sleepAverage?.averageQuality ?? null;
    const qualityPercent = avgQuality
      ? Math.round((avgQuality / 5) * 100)
      : 0;

    return {
      sleepIsEmpty: false,
      sleepData: {
        avgHours: Number(avgHours.toFixed(1)),
        goalHours: DEFAULT_SLEEP_GOAL,
        quality: qualityPercent,
        weeklyData,
      },
    };
  }, [sleepHistory, sleepAverage, useMockProgress]);

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

  return (
    <AppLayout>
      <div className="progress-page-layout">
        {/* Page Header with Date Range Selector */}
        <div className="progress-page-header">
          <h1 className="progress-page-title">Progress</h1>
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

        {/* Hero: At-a-Glance Summary */}
        <ProgressSummary data={mockProgressData.summary} />

        {/* Row 1: Weight Trend | Calorie Intake */}
        <div className="progress-charts-grid animate-fade-slide-in animate-stagger-1">
          <WeightTrendChart
            data={weightData}
            goalWeight={mockProgressData.weightGoal}
            currentWeight={weightData[weightData.length - 1]?.weight}
          />
          <CalorieIntakeChart data={calorieData} />
        </div>

        {/* Row 2: Macros + Sleep (stacked) | Weekly Comparison */}
        <div className="progress-charts-grid animate-fade-slide-in animate-stagger-2">
          <div className="progress-left-column-stack">
            <MacroBreakdown data={mockProgressData.macroAverages} />
            <SleepProgressCard
              data={sleepData}
              sourceLabel={sleepSourceLabel}
              sourceTone={sleepSourceTone}
              isEmpty={sleepIsEmpty}
            />
          </div>
          <WeeklyComparison data={mockProgressData.comparison} />
        </div>

        {/* Row 2.5: Fasting Progress */}
        <div className="animate-fade-slide-in animate-stagger-2">
          <FastingProgressCard userId={user.id} />
        </div>

        {/* Row 3: Streaks & Achievements | AI Insights */}
        <div className="progress-charts-grid animate-fade-slide-in animate-stagger-3">
          <div className="progress-left-column-stack">
            <StreaksProgressCard data={mockProgressData.streaks} />
            <AchievementsProgressCard
              achievements={mockProgressData.achievements}
              milestones={mockProgressData.milestones}
            />
          </div>
          <InsightsPanel insights={mockProgressData.insights} />
        </div>

        {/* Row 4: Exercise Heatmap (Full Width) */}
        <div className="animate-fade-slide-in animate-stagger-4">
          <ExerciseHeatmap
            data={mockProgressData.exerciseHistory}
            summary={mockProgressData.exerciseSummary}
          />
        </div>
      </div>
    </AppLayout>
  );
}
