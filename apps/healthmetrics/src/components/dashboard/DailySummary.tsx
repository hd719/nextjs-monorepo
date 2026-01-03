import { Calendar } from "lucide-react";
import { MetricCard } from "./MetricCard";
import type { DailySummary as DailySummaryType } from "@/types/nutrition";

export interface DailySummaryProps {
  data: DailySummaryType;
}

export function DailySummary({ data }: DailySummaryProps) {
  return (
    <section className="dashboard-summary-section">
      {/* Header with date */}
      <div className="dashboard-summary-header">
        <h2 className="dashboard-summary-heading">Today's Summary</h2>
        <div className="dashboard-summary-date">
          <Calendar className="dashboard-summary-date-icon" />
          <span>{data.date}</span>
        </div>
      </div>

      {/* Metric cards grid */}
      <div className="dashboard-summary-grid">
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
