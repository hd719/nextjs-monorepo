import { Calendar } from "lucide-react";
import { MetricCard } from "./MetricCard";
import type { DailySummary as DailySummaryType } from "@/types/nutrition";
import styles from "./DailySummary.module.css";

export interface DailySummaryProps {
  data: DailySummaryType;
}

export function DailySummary({ data }: DailySummaryProps) {
  return (
    <section className={styles.section}>
      {/* Header with date */}
      <div className={styles.header}>
        <h2 className={styles.heading}>Today's Summary</h2>
        <div className={styles.date}>
          <Calendar className={styles.dateIcon} />
          <span>{data.date}</span>
        </div>
      </div>

      {/* Metric cards grid */}
      <div className={styles.grid}>
        <MetricCard
          label="Calories"
          consumed={data.calories.consumed}
          goal={data.calories.goal}
          unit="kcal"
        />
        <MetricCard
          label="Protein"
          consumed={data.protein.consumed}
          goal={data.protein.goal}
          unit="grams"
        />
        <MetricCard
          label="Carbs"
          consumed={data.carbs.consumed}
          goal={data.carbs.goal}
          unit="grams"
        />
        <MetricCard
          label="Fat"
          consumed={data.fat.consumed}
          goal={data.fat.goal}
          unit="grams"
        />
      </div>
    </section>
  );
}
