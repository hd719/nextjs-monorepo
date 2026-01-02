import { useState } from "react";
import { Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaterGlass } from "./WaterGlass";
import type { WaterIntake } from "@/types/nutrition";
import styles from "./WaterTracker.module.css";

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
    <section className={styles.section}>
      <h2 className={styles.heading}>Water Intake</h2>
      <Card>
        <CardHeader>
          <div className={styles.header}>
            <CardTitle className={styles.title}>
              <Droplets className={styles.titleIcon} />
              Daily Hydration
            </CardTitle>
            <div className={styles.stats}>
              <span className={styles.statsCurrent}>{current}</span>
              <span className={styles.statsGoal}> / {data.goal}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Glass Grid */}
          <div className={styles.glassGrid}>
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
          <div className={styles.progress}>
            <p className={styles.progressText}>
              {percentage >= 100 ? (
                <span className={styles.progressSuccess}>
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
