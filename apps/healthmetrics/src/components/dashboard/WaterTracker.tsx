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
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Water Intake</h2>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-accent" />
              Daily Hydration
            </CardTitle>
            <div className="text-sm font-medium">
              <span className="text-2xl font-bold text-accent">{current}</span>
              <span className="text-muted-foreground"> / {data.goal}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Glass Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
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
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {percentage >= 100 ? (
                <span className="text-accent font-medium">
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
