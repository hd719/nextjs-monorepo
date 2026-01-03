import { useState } from "react";
import { Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaterGlass } from "./WaterGlass";
import type { WaterIntake } from "@/types/nutrition";

export interface WaterTrackerProps {
  data: WaterIntake;
  onUpdate?: (current: number) => void;
}

export function WaterTracker({ data, onUpdate }: WaterTrackerProps) {
  const [current, setCurrent] = useState(data.current);

  const handleGlassClick = (index: number) => {
    const newCurrent = index + 1 === current ? index : index + 1;
    setCurrent(newCurrent);
    onUpdate?.(newCurrent);
  };

  const percentage = Math.round((current / data.goal) * 100);

  return (
    <section className="dashboard-water-section">
      <h2 className="dashboard-water-heading">Water Intake</h2>
      <Card>
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
                  🎉 Great job! You've reached your daily goal!
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
