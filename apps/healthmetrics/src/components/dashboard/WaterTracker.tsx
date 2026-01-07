import { useEffect, useState } from "react";
import { Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WaterGlass } from "./WaterGlass";
import type { WaterIntake } from "@/types";

export interface WaterTrackerProps {
  data: WaterIntake;
  onUpdate?: (current: number) => void;
  isLoading?: boolean;
}

export function WaterTracker({ data, onUpdate, isLoading }: WaterTrackerProps) {
  const [current, setCurrent] = useState(data.current);

  useEffect(() => {
    setCurrent(data.current);
  }, [data.current]);

  const handleGlassClick = (index: number) => {
    const newCurrent = index + 1 === current ? index : index + 1;
    setCurrent(newCurrent);
    onUpdate?.(newCurrent);
  };

  const percentage = Math.round((current / data.goal) * 100);

  // Loading state - show skeleton
  if (isLoading) {
    return (
      <section className="dashboard-water-section">
        <h2 className="dashboard-water-heading">Water Intake</h2>
        <Card variant="supporting">
          <CardHeader>
            <div className="dashboard-water-header">
              <Skeleton className="skeleton-lg" />
              <Skeleton className="skeleton-value-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="dashboard-water-glass-grid">
              {/* Show 8 skeleton glasses (default goal) */}
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="skeleton-water-glass" />
              ))}
            </div>
            <div className="dashboard-water-progress">
              <Skeleton className="skeleton-text-line" />
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="dashboard-water-section">
      <h2 className="dashboard-water-heading">Water Intake</h2>
      <Card variant="supporting" className="dashboard-card-stretch">
        <CardHeader>
          <div className="dashboard-water-header">
            <CardTitle className="dashboard-water-title">
              <Droplets className="dashboard-water-title-icon" />
              Daily Hydration
            </CardTitle>
            <div className="dashboard-water-stats">
              <span className="dashboard-water-stats-current">{current}</span>
              <span className="dashboard-water-stats-goal"> / {data.goal}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Glass Grid */}
          <div className="dashboard-water-glass-grid">
            {Array.from({ length: data.goal }).map((_, index) => (
              <WaterGlass
                key={index}
                index={index}
                filled={index < current}
                onClick={() => handleGlassClick(index)}
              />
            ))}
          </div>

          {/* Progress Text */}
          <div className="dashboard-water-progress">
            <p className="dashboard-water-progress-text">
              {percentage >= 100 ? (
                <span className="dashboard-water-progress-success">
                  Great job! You&apos;ve reached your daily goal!
                </span>
              ) : percentage >= 50 ? (
                <span>You're {percentage}% there! Keep going!</span>
              ) : (
                <span>
                  {data.goal - current} more{" "}
                  {data.goal - current === 1 ? "glass" : "glasses"} to go
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
