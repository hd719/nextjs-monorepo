import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import {
  Moon,
  Scale,
  Footprints,
  Trophy,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Star,
  Flame,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardProgressData } from "@/data/progressMockData";
import type { StepCount } from "@/types/nutrition";

// Weight trend data shape from hook
export interface WeightTrendData {
  entries: Array<{
    id: string;
    date: Date;
    weightLbs: number;
  }>;
  change: number;
  goalWeight: number | null;
}

// Map achievement titles to their icons (icons can't be stored in data files)
const achievementIcons: Record<string, LucideIcon> = {
  "7-Day Streak": Flame,
  "10K Steps": Footprints,
  "Sleep Goal Hit": Moon,
};

// Build achievements with icons from centralized data
const achievements = {
  recent: dashboardProgressData.achievements.recentTitles.map((title, i) => ({
    title,
    icon: achievementIcons[title] || Trophy,
    date: dashboardProgressData.achievements.recentDates[i],
  })),
  totalEarned: dashboardProgressData.achievements.totalEarned,
  nextUp: dashboardProgressData.achievements.nextUp,
};

// Re-export mock data for sleep (still using mock)
const { sleep, weight: mockWeight, steps: mockSteps } = dashboardProgressData;

export interface ProgressActivityPlaceholderProps {
  stepData?: StepCount;
  weightData?: WeightTrendData;
  isWeightLoading?: boolean;
}

/**
 * Mini bar chart for weekly data
 */
function MiniBarChart({
  data,
  maxValue,
  colorClass,
  ariaLabel,
}: {
  data: number[];
  maxValue: number;
  colorClass: string;
  ariaLabel: string;
}) {
  return (
    <div className="dashboard-mini-chart" role="img" aria-label={ariaLabel}>
      {data.map((value, index) => {
        const height = (value / maxValue) * 100;
        return (
          <div
            key={index}
            className={`dashboard-mini-chart-bar dashboard-bar-${colorClass}`}
            data-height={height}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

/**
 * Progress bar component
 */
function ProgressBar({
  percent,
  colorClass,
  ariaLabel,
}: {
  percent: number;
  colorClass: string;
  ariaLabel: string;
}) {
  return (
    <div
      className="dashboard-progress-bar-track"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className={`dashboard-progress-bar-fill dashboard-bar-${colorClass}`}
        data-width={percent}
        aria-hidden="true"
      />
    </div>
  );
}

export function ProgressActivityPlaceholder({
  stepData,
  weightData,
  isWeightLoading,
}: ProgressActivityPlaceholderProps) {
  // Use real step data if available, fall back to mock data
  const steps = stepData
    ? {
        today: stepData.current,
        goal: stepData.goal,
        percentOfGoal: Math.min(
          100,
          Math.round((stepData.current / stepData.goal) * 100)
        ),
        weeklyAvg: mockSteps.weeklyAvg, // Still mock for weekly average
      }
    : mockSteps;

  // Build weight data from real entries or use mock
  const weight = weightData?.entries?.length
    ? {
        current: weightData.entries[weightData.entries.length - 1].weightLbs,
        change: weightData.change,
        goalWeight: weightData.goalWeight ?? mockWeight.goalWeight,
        weeklyData: weightData.entries.slice(-7).map((e) => e.weightLbs),
      }
    : mockWeight;

  return (
    <section className="dashboard-progress-section">
      <div className="dashboard-progress-header">
        <h2 className="dashboard-progress-heading">Your Progress</h2>
        <Link to={ROUTES.PROGRESS} className="dashboard-progress-view-all">
          View Details
          <ArrowRight className="dashboard-progress-arrow" aria-hidden="true" />
        </Link>
      </div>

      <Card variant="supporting" className="dashboard-progress-card">
        {/* Row 1: Sleep */}
        <div className="dashboard-progress-row">
          <div className="dashboard-progress-row-header">
            <div className="dashboard-progress-row-icon dashboard-icon-indigo">
              <Moon
                className="dashboard-progress-row-icon-inner"
                aria-hidden="true"
              />
            </div>
            <div className="dashboard-progress-row-title">
              <span className="dashboard-progress-row-name">Sleep</span>
              <span className="dashboard-progress-row-subtitle">This Week</span>
            </div>
            <div className="dashboard-progress-row-value">
              <span className="dashboard-progress-row-main">
                {sleep.avgHours}h
              </span>
              <span className="dashboard-progress-row-secondary">
                avg/night
              </span>
            </div>
          </div>
          <div className="dashboard-progress-row-content">
            <MiniBarChart
              data={sleep.weeklyData}
              maxValue={10}
              colorClass="color-indigo"
              ariaLabel={`Weekly sleep chart: averaging ${sleep.avgHours} hours per night over 7 days`}
            />
            <div className="dashboard-progress-row-meta">
              <span className="dashboard-progress-row-meta-item">
                <TrendingUp
                  className="dashboard-trend-icon dashboard-text-color-green"
                  aria-hidden="true"
                />
                Best: {sleep.bestNight}
              </span>
              <span className="dashboard-progress-row-meta-item dashboard-text-color-indigo">
                {sleep.percentOfGoal}% of goal
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Weight Trend */}
        <div className="dashboard-progress-row">
          <div className="dashboard-progress-row-header">
            <div className="dashboard-progress-row-icon dashboard-icon-green">
              <Scale
                className="dashboard-progress-row-icon-inner"
                aria-hidden="true"
              />
            </div>
            <div className="dashboard-progress-row-title">
              <span className="dashboard-progress-row-name">Weight Trend</span>
              <span className="dashboard-progress-row-subtitle">
                Last 7 days
              </span>
            </div>
            {isWeightLoading ? (
              <div className="dashboard-progress-row-value">
                <Skeleton className="skeleton-value-sm" />
              </div>
            ) : (
              <div className="dashboard-progress-row-value">
                <span
                  className={`dashboard-progress-row-main ${
                    weight.change < 0
                      ? "dashboard-text-color-green"
                      : weight.change > 0
                        ? "dashboard-text-color-red"
                        : ""
                  }`}
                >
                  {weight.change > 0 ? "+" : ""}
                  {weight.change} lbs
                </span>
                <span className="dashboard-progress-row-secondary">
                  {weight.current} lbs
                </span>
              </div>
            )}
          </div>
          <div className="dashboard-progress-row-content">
            <MiniBarChart
              data={weight.weeklyData}
              maxValue={180}
              colorClass="color-green"
              ariaLabel={`Weekly weight trend: ${weight.change > 0 ? "+" : ""}${weight.change} lbs, currently ${weight.current} lbs`}
            />
            <div className="dashboard-progress-row-meta">
              <span className="dashboard-progress-row-meta-item">
                <TrendingDown
                  className="dashboard-trend-icon dashboard-text-color-green"
                  aria-hidden="true"
                />
                On track to goal
              </span>
              <span className="dashboard-progress-row-meta-item">
                Goal: {weight.goalWeight} lbs
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Steps */}
        <div className="dashboard-progress-row">
          <div className="dashboard-progress-row-header">
            <div className="dashboard-progress-row-icon dashboard-icon-cyan">
              <Footprints
                className="dashboard-progress-row-icon-inner"
                aria-hidden="true"
              />
            </div>
            <div className="dashboard-progress-row-title">
              <span className="dashboard-progress-row-name">Steps</span>
              <span className="dashboard-progress-row-subtitle">Today</span>
            </div>
            <div className="dashboard-progress-row-value">
              <span className="dashboard-progress-row-main">
                {steps.today.toLocaleString()}
              </span>
              <span className="dashboard-progress-row-secondary">
                / {steps.goal.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="dashboard-progress-row-content">
            <ProgressBar
              percent={steps.percentOfGoal}
              colorClass="color-cyan"
              ariaLabel={`Steps progress: ${steps.today.toLocaleString()} of ${steps.goal.toLocaleString()} steps, ${steps.percentOfGoal}% complete`}
            />
            <div className="dashboard-progress-row-meta">
              <span className="dashboard-progress-row-meta-item">
                <Target className="dashboard-trend-icon" aria-hidden="true" />
                Weekly avg: {steps.weeklyAvg.toLocaleString()}
              </span>
              <span className="dashboard-progress-row-meta-item dashboard-text-color-cyan">
                {steps.percentOfGoal}% complete
              </span>
            </div>
          </div>
        </div>

        {/* Row 4: Achievements */}
        <div className="dashboard-progress-row dashboard-progress-row-last">
          <div className="dashboard-progress-row-header">
            <div className="dashboard-progress-row-icon dashboard-icon-amber">
              <Trophy
                className="dashboard-progress-row-icon-inner"
                aria-hidden="true"
              />
            </div>
            <div className="dashboard-progress-row-title">
              <span className="dashboard-progress-row-name">Achievements</span>
              <span className="dashboard-progress-row-subtitle">
                {achievements.totalEarned} earned
              </span>
            </div>
            <div className="dashboard-progress-row-value">
              <span className="dashboard-progress-row-main">
                {achievements.recent.length}
              </span>
              <span className="dashboard-progress-row-secondary">
                this week
              </span>
            </div>
          </div>
          <div className="dashboard-progress-row-content">
            <div className="dashboard-achievements-list">
              {achievements.recent.map((achievement, index) => {
                const AchievementIcon = achievement.icon;
                return (
                  <div key={index} className="dashboard-achievement-badge">
                    <AchievementIcon
                      className="dashboard-achievement-icon"
                      aria-hidden="true"
                    />
                    <span className="dashboard-achievement-title">
                      {achievement.title}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="dashboard-progress-row-meta">
              <span className="dashboard-progress-row-meta-item">
                <Star
                  className="dashboard-trend-icon dashboard-text-color-amber"
                  aria-hidden="true"
                />
                Next: {achievements.nextUp}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
