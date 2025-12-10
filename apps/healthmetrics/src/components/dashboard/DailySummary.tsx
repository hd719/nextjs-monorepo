import { Calendar } from "lucide-react";
import { MetricCard } from "./MetricCard";
import type { DailySummary as DailySummaryType } from "@/types/nutrition";

export interface DailySummaryProps {
  data: DailySummaryType;
}

export function DailySummary({ data }: DailySummaryProps) {
  return (
    <section className="space-y-4">
      {/* Header with date */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Today's Summary</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{data.date}</span>
        </div>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
