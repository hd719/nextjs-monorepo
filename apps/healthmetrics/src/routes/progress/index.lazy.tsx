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

import { useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
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

export const Route = createLazyFileRoute("/progress/")({
  component: ProgressPage,
});

function ProgressPage() {
  const { user } = Route.useRouteContext();
  const [dateRange, setDateRange] = useState<DateRange>("30d");

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
            <SleepProgressCard data={mockProgressData.sleepData} />
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
