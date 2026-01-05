import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";

export interface NutritionMetric {
  consumed: number;
  goal: number;
}

export interface NutritionData {
  calories: NutritionMetric;
  protein: NutritionMetric;
  carbs: NutritionMetric;
  fat: NutritionMetric;
}

export interface NutritionSummaryProps {
  title: string;
  data: NutritionData;
  headerAction?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

/**
 * Individual metric card component
 */
function MetricCard({
  label,
  consumed,
  goal,
  unit,
  isLoading,
}: {
  label: string;
  consumed: number;
  goal: number;
  unit: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="nutrition-metric-card">
          <div className="nutrition-metric-loading">
            <Skeleton className="skeleton-label" />
            <div className="nutrition-metric-loading-values">
              <Skeleton className="skeleton-value" />
              <Skeleton className="skeleton-unit" />
            </div>
            <Skeleton className="skeleton-progress" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="nutrition-metric-card">
        <div className="nutrition-metric-content">
          <h3 className="nutrition-metric-label">{label}</h3>
          <div className="nutrition-metric-values">
            <div className="nutrition-metric-consumed">
              {consumed.toLocaleString()}
              <span className="nutrition-metric-goal">
                {" "}
                / {goal.toLocaleString()}
              </span>
            </div>
            <p className="nutrition-metric-unit">{unit}</p>
          </div>
          <ProgressBar value={consumed} max={goal} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * NutritionSummary - Hero card with nutrition metrics grid
 */
export function NutritionSummary({
  title,
  data,
  headerAction,
  isLoading = false,
  className,
}: NutritionSummaryProps) {
  return (
    <Card
      variant="hero"
      className={`nutrition-summary-card animate-fade-slide-in ${className || ""}`}
    >
      <section className="nutrition-summary-section">
        {/* Header */}
        <div className="nutrition-summary-header">
          <h2 className="nutrition-summary-title">{title}</h2>
          {headerAction && (
            <div className="nutrition-summary-action">{headerAction}</div>
          )}
        </div>

        {/* Metric cards grid */}
        <div className="nutrition-summary-grid">
          <MetricCard
            label="Calories"
            consumed={data.calories.consumed}
            goal={data.calories.goal}
            unit="kcal"
            isLoading={isLoading}
          />
          <MetricCard
            label="Protein"
            consumed={data.protein.consumed}
            goal={data.protein.goal}
            unit="grams"
            isLoading={isLoading}
          />
          <MetricCard
            label="Carbs"
            consumed={data.carbs.consumed}
            goal={data.carbs.goal}
            unit="grams"
            isLoading={isLoading}
          />
          <MetricCard
            label="Fat"
            consumed={data.fat.consumed}
            goal={data.fat.goal}
            unit="grams"
            isLoading={isLoading}
          />
        </div>
      </section>
    </Card>
  );
}
