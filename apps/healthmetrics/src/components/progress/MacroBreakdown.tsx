import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MacroData } from "@/types/progress";

interface MacroBreakdownProps {
  data: {
    protein: MacroData;
    carbs: MacroData;
    fat: MacroData;
  };
}

// Macro colors matching design system (used by Recharts)
const MACRO_COLORS = {
  protein: "#3b82f6", // Blue
  carbs: "#f59e0b", // Amber
  fat: "#ec4899", // Pink
};

export function MacroBreakdown({ data }: MacroBreakdownProps) {
  const { protein, carbs, fat } = data;

  // Calculate total grams for donut chart
  const totalGrams = protein.current + carbs.current + fat.current;

  // Data for donut chart
  const donutData = [
    { name: "Protein", value: protein.current, color: MACRO_COLORS.protein },
    { name: "Carbs", value: carbs.current, color: MACRO_COLORS.carbs },
    { name: "Fat", value: fat.current, color: MACRO_COLORS.fat },
  ];

  // Calculate percentages
  const proteinPercent = Math.round((protein.current / totalGrams) * 100);
  const carbsPercent = Math.round((carbs.current / totalGrams) * 100);
  const fatPercent = Math.round((fat.current / totalGrams) * 100);

  // Calculate goal adherence percentages (capped at 100%)
  const proteinGoalPercent = Math.min(
    Math.round((protein.current / protein.goal) * 100),
    100
  );
  const carbsGoalPercent = Math.min(
    Math.round((carbs.current / carbs.goal) * 100),
    100
  );
  const fatGoalPercent = Math.min(
    Math.round((fat.current / fat.goal) * 100),
    100
  );

  return (
    <Card variant="supporting">
      <CardContent className="progress-chart-card">
        <div className="progress-chart-header">
          <h3 className="progress-chart-title">
            <Utensils
              className="progress-chart-title-icon"
              aria-hidden="true"
            />
            Macro Breakdown
          </h3>
          <div className="progress-text-subtitle">Weekly Average</div>
        </div>

        <div className="progress-macro-section">
          {/* Donut Chart */}
          <div
            className="progress-macro-donut-container"
            role="img"
            aria-label={`Macro breakdown: Protein ${proteinPercent}% (${protein.current}g of ${protein.goal}g), Carbs ${carbsPercent}% (${carbs.current}g of ${carbs.goal}g), Fat ${fatPercent}% (${fat.current}g of ${fat.goal}g). Total: ${totalGrams}g.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="progress-macro-donut-center">
              <span className="progress-macro-donut-total">{totalGrams}g</span>
              <span className="progress-macro-donut-label">total</span>
            </div>
          </div>

          {/* Progress Bars - widths set via CSS custom property --bar-width */}
          <div className="progress-macro-bars">
            {/* Protein */}
            <div className="progress-macro-bar-item">
              <div className="progress-macro-bar-header">
                <span className="progress-macro-bar-label">
                  Protein ({proteinPercent}%)
                </span>
                <span className="progress-macro-bar-value">
                  {protein.current}g / {protein.goal}g
                </span>
              </div>
              <div
                className="progress-macro-bar-track"
                role="progressbar"
                aria-valuenow={protein.current}
                aria-valuemin={0}
                aria-valuemax={protein.goal}
                aria-label={`Protein intake: ${protein.current}g of ${protein.goal}g goal`}
              >
                <div
                  className="progress-macro-bar-fill progress-macro-protein"
                  style={
                    {
                      "--bar-width": `${proteinGoalPercent}%`,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="progress-macro-bar-item">
              <div className="progress-macro-bar-header">
                <span className="progress-macro-bar-label">
                  Carbs ({carbsPercent}%)
                </span>
                <span className="progress-macro-bar-value">
                  {carbs.current}g / {carbs.goal}g
                </span>
              </div>
              <div
                className="progress-macro-bar-track"
                role="progressbar"
                aria-valuenow={carbs.current}
                aria-valuemin={0}
                aria-valuemax={carbs.goal}
                aria-label={`Carbohydrate intake: ${carbs.current}g of ${carbs.goal}g goal`}
              >
                <div
                  className="progress-macro-bar-fill progress-macro-carbs"
                  style={
                    {
                      "--bar-width": `${carbsGoalPercent}%`,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Fat */}
            <div className="progress-macro-bar-item">
              <div className="progress-macro-bar-header">
                <span className="progress-macro-bar-label">
                  Fat ({fatPercent}%)
                </span>
                <span className="progress-macro-bar-value">
                  {fat.current}g / {fat.goal}g
                </span>
              </div>
              <div
                className="progress-macro-bar-track"
                role="progressbar"
                aria-valuenow={fat.current}
                aria-valuemin={0}
                aria-valuemax={fat.goal}
                aria-label={`Fat intake: ${fat.current}g of ${fat.goal}g goal`}
              >
                <div
                  className="progress-macro-bar-fill progress-macro-fat"
                  style={
                    {
                      "--bar-width": `${fatGoalPercent}%`,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="progress-chart-legend">
          <div className="progress-chart-legend-item">
            <div className="progress-chart-legend-dot progress-legend-dot-protein" />
            <span>Protein</span>
          </div>
          <div className="progress-chart-legend-item">
            <div className="progress-chart-legend-dot progress-legend-dot-carbs" />
            <span>Carbs</span>
          </div>
          <div className="progress-chart-legend-item">
            <div className="progress-chart-legend-dot progress-legend-dot-fat" />
            <span>Fat</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
