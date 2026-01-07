import { useState } from "react";
import { Footprints, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import type { StepCount } from "@/types";

export interface StepTrackerProps {
  data: StepCount;
  onAddSteps?: (steps: number) => void;
  isLoading?: boolean;
}

// Common step increments for quick add
const STEP_INCREMENTS = [500, 1000, 2500, 5000];

export function StepTracker({ data, onAddSteps, isLoading }: StepTrackerProps) {
  const [customSteps, setCustomSteps] = useState("");

  const percentage = Math.min(
    Math.round((data.current / data.goal) * 100),
    100
  );

  const handleAddSteps = (steps: number) => {
    if (steps > 0) {
      onAddSteps?.(steps);
    }
  };

  const handleCustomAdd = () => {
    const steps = parseInt(customSteps, 10);
    if (!isNaN(steps) && steps > 0) {
      handleAddSteps(steps);
      setCustomSteps("");
    }
  };

  // Loading state - show skeleton
  if (isLoading) {
    return (
      <section className="dashboard-steps-section">
        <h2 className="dashboard-steps-heading">Step Tracking</h2>
        <Card variant="supporting">
          <CardHeader>
            <div className="dashboard-steps-header">
              <Skeleton className="skeleton-lg" />
              <Skeleton className="skeleton-value-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="skeleton-progress-bar" />
            <div className="dashboard-steps-actions">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="skeleton-button" />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="dashboard-steps-section">
      <h2 className="dashboard-steps-heading">Step Tracking</h2>
      <Card variant="supporting">
        <CardHeader>
          <div className="dashboard-steps-header">
            <CardTitle className="dashboard-steps-title">
              <Footprints className="dashboard-steps-title-icon" />
              Daily Steps
            </CardTitle>
            <div className="dashboard-steps-stats">
              <span className="dashboard-steps-stats-current">
                {data.current.toLocaleString()}
              </span>
              <span className="dashboard-steps-stats-goal">
                {" "}
                / {data.goal.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="dashboard-steps-progress">
            <ProgressBar
              value={data.current}
              max={data.goal}
              label={`${percentage}%`}
              ariaLabel={`Steps progress: ${data.current.toLocaleString()} of ${data.goal.toLocaleString()} steps`}
            />
          </div>

          {/* Quick Add Buttons */}
          <div className="dashboard-steps-quick-add">
            <span className="dashboard-steps-quick-add-label">Quick add:</span>
            <div className="dashboard-steps-quick-add-buttons">
              {STEP_INCREMENTS.map((increment) => (
                <Button
                  key={increment}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSteps(increment)}
                  className="dashboard-steps-quick-add-button"
                >
                  <Plus className="dashboard-steps-quick-add-icon" />
                  {increment.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div className="dashboard-steps-custom-add">
            <Input
              type="number"
              placeholder="Custom steps..."
              value={customSteps}
              onChange={(e) => setCustomSteps(e.target.value)}
              className="dashboard-steps-custom-input"
              min="1"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCustomAdd}
              disabled={!customSteps || parseInt(customSteps, 10) <= 0}
            >
              Add Steps
            </Button>
          </div>

          {/* Progress Text */}
          <div className="dashboard-steps-message">
            <p className="dashboard-steps-message-text">
              {percentage >= 100 ? (
                <span className="dashboard-steps-message-success">
                  Amazing! You&apos;ve reached your daily goal! 🎉
                </span>
              ) : percentage >= 75 ? (
                <span>
                  Almost there! Just{" "}
                  {(data.goal - data.current).toLocaleString()} more steps!
                </span>
              ) : percentage >= 50 ? (
                <span>
                  Great progress! You&apos;re {percentage}% of the way there!
                </span>
              ) : (
                <span>
                  Keep moving! {(data.goal - data.current).toLocaleString()}{" "}
                  steps to go.
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
