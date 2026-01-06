import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Flame,
  Target,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

interface ProgressSummaryProps {
  data: {
    weightChange: number;
    avgDailyCalories: number;
    goalAdherencePercent: number;
    currentStreak: number;
    periodDays: number;
  };
  isLoading?: boolean;
}

/**
 * AnimatedNumber - Counts up from 0 to target value
 * Uses requestAnimationFrame for smooth 60fps animation
 */
function AnimatedNumber({
  value,
  duration = 1500,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime.current) {
        startTime.current = timestamp;
      }

      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      // Ease out quad for smooth deceleration
      const easedProgress = progress * (2 - progress);
      const currentValue = startValue + easedProgress * (value - startValue);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

/**
 * StatCard - Individual stat display with icon and trend
 */
function StatCard({
  icon: Icon,
  value,
  unit,
  label,
  trend,
  isPositive,
  isNegative,
  animate = true,
  decimals = 0,
  prefix = "",
}: {
  icon: React.ElementType;
  value: number;
  unit?: string;
  label: string;
  trend?: { value: number; isUp: boolean };
  isPositive?: boolean;
  isNegative?: boolean;
  animate?: boolean;
  decimals?: number;
  prefix?: string;
}) {
  const trendText = trend
    ? `, ${trend.isUp ? "up" : "down"} ${trend.value}% from last week`
    : "";

  return (
    <div
      className="progress-summary-stat"
      role="group"
      aria-label={`${label}: ${prefix}${value.toFixed(decimals)}${unit ? ` ${unit}` : ""}${trendText}`}
    >
      <Icon className="progress-stat-icon" aria-hidden="true" />
      <div
        className={cn(
          "progress-summary-stat-value",
          isPositive && "progress-summary-stat-value-positive",
          isNegative && "progress-summary-stat-value-negative"
        )}
      >
        {animate ? (
          <AnimatedNumber
            value={Math.abs(value)}
            decimals={decimals}
            prefix={value < 0 ? "-" : prefix}
          />
        ) : (
          <>
            {prefix}
            {value.toFixed(decimals)}
          </>
        )}
        {unit && <span className="progress-summary-stat-unit"> {unit}</span>}
      </div>
      <div className="progress-summary-stat-label">{label}</div>
      {trend && (
        <div className="progress-summary-stat-trend">
          {trend.isUp ? (
            <TrendingUp className="progress-summary-stat-trend-icon" />
          ) : (
            <TrendingDown className="progress-summary-stat-trend-icon" />
          )}
          <span>{trend.value}%</span>
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton for ProgressSummary
 */
function ProgressSummarySkeleton() {
  return (
    <Card variant="hero" className="animate-fade-slide-in">
      <CardContent className="progress-chart-card">
        <div className="progress-summary-header">
          <Skeleton className="progress-skeleton-header-title" />
          <Skeleton className="progress-skeleton-header-period" />
        </div>
        <div className="progress-summary-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="progress-loading-stat">
              <Skeleton className="progress-skeleton-stat-icon" />
              <Skeleton className="progress-skeleton-stat-value" />
              <Skeleton className="progress-skeleton-stat-label" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgressSummary({ data, isLoading }: ProgressSummaryProps) {
  if (isLoading) {
    return <ProgressSummarySkeleton />;
  }

  const {
    weightChange,
    avgDailyCalories,
    goalAdherencePercent,
    currentStreak,
    periodDays,
  } = data;

  // Determine if weight change is positive progress (losing weight = positive for most users)
  const isWeightLoss = weightChange < 0;

  return (
    <Card variant="hero" className="animate-fade-slide-in">
      <CardContent className="progress-chart-card">
        <div className="progress-summary-section">
          <div className="progress-summary-header">
            <h2 className="progress-summary-title">
              <TrendingUp
                className="progress-summary-title-icon"
                aria-hidden="true"
              />
              Your Progress
            </h2>
            <span className="progress-summary-period">
              Last {periodDays} Days
            </span>
          </div>

          <div className="progress-summary-grid">
            <StatCard
              icon={Scale}
              value={weightChange}
              unit="lbs"
              label={isWeightLoss ? "lost" : "gained"}
              isPositive={isWeightLoss}
              isNegative={!isWeightLoss}
              decimals={1}
              prefix={weightChange > 0 ? "+" : ""}
            />

            <StatCard
              icon={Flame}
              value={avgDailyCalories}
              unit="cal"
              label="avg/day"
            />

            <StatCard
              icon={Target}
              value={goalAdherencePercent}
              unit="%"
              label="on goal days"
            />

            <StatCard
              icon={Calendar}
              value={currentStreak}
              label="day streak"
              trend={{ value: 12, isUp: true }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
