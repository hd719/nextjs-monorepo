import { useState, useEffect } from "react";
import type { OnboardingStepData, NutritionGoals } from "@/types";
import { GOAL_OPTIONS, ONBOARDING_LIMITS } from "@/constants/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface GoalsStepProps {
  data: OnboardingStepData;
  calculatedGoals: NutritionGoals | null;
  isCalculating: boolean;
  onNext: (data: OnboardingStepData) => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

/**
 * Step 3: Calculated Goals
 * Shows calculated calorie/macro goals with option to adjust
 */
export function GoalsStep({
  data,
  calculatedGoals,
  isCalculating,
  onNext,
  onBack,
  onSkip,
  isLoading,
}: GoalsStepProps) {
  // Initialize from calculated goals or existing data
  const [calories, setCalories] = useState(
    data.dailyCalorieGoal || calculatedGoals?.dailyCalorieGoal || 2000
  );
  const [protein, setProtein] = useState(
    data.dailyProteinGoalG || calculatedGoals?.dailyProteinGoalG || 150
  );
  const [carbs, setCarbs] = useState(
    data.dailyCarbGoalG || calculatedGoals?.dailyCarbGoalG || 200
  );
  const [fat, setFat] = useState(
    data.dailyFatGoalG || calculatedGoals?.dailyFatGoalG || 65
  );
  // Convert stored lbs to display units if metric (whole numbers)
  const initialTargetWeight = data.targetWeightLbs
    ? data.unitsPreference === "metric"
      ? Math.round(data.targetWeightLbs / 2.20462).toString()
      : Math.round(data.targetWeightLbs).toString()
    : "";
  const [targetWeight, setTargetWeight] = useState(initialTargetWeight);

  // Update when calculated goals arrive with smooth transition
  useEffect(() => {
    if (calculatedGoals && !data.dailyCalorieGoal) {
      const updateGoals = () => {
        setCalories(calculatedGoals.dailyCalorieGoal);
        setProtein(calculatedGoals.dailyProteinGoalG);
        setCarbs(calculatedGoals.dailyCarbGoalG);
        setFat(calculatedGoals.dailyFatGoalG);
      };

      if (document.startViewTransition) {
        document.startViewTransition(updateGoals);
      } else {
        updateGoals();
      }
    }
  }, [calculatedGoals, data.dailyCalorieGoal]);

  const goalLabel =
    GOAL_OPTIONS.find((g) => g.value === data.goalType)?.label || "your goal";

  const isMetric = data.unitsPreference === "metric";
  const weightUnit = isMetric ? "kg" : "lbs";

  const handleContinue = () => {
    // Convert kg to lbs if metric, since we store in lbs
    const targetWeightLbs = targetWeight
      ? isMetric
        ? parseFloat(targetWeight) * 2.20462
        : parseFloat(targetWeight)
      : undefined;

    onNext({
      dailyCalorieGoal: calories,
      dailyProteinGoalG: protein,
      dailyCarbGoalG: carbs,
      dailyFatGoalG: fat,
      targetWeightLbs,
    });
  };

  if (isCalculating) {
    return (
      <div className="onboarding-step">
        <div className="onboarding-loading">
          <Loader2 className="onboarding-loading-icon" />
          <p className="onboarding-loading-text">
            Calculating your personalized goals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-step">
      {/* Header */}
      <div className="onboarding-step-header">
        <h1 className="onboarding-step-title">Your Daily Goals</h1>
        <p className="onboarding-step-subtitle">
          Based on your measurements and goal to{" "}
          <strong>{goalLabel.toLowerCase()}</strong>
        </p>
      </div>

      {/* Calorie Goal - Hero */}
      <div className="onboarding-calorie-hero">
        <span className="onboarding-calorie-label">Daily Calorie Goal</span>
        <div className="onboarding-calorie-value">
          <Input
            type="number"
            min={ONBOARDING_LIMITS.calories.min}
            max={ONBOARDING_LIMITS.calories.max}
            step={50}
            value={calories}
            onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
            className="onboarding-calorie-input"
          />
          <span className="onboarding-calorie-unit">cal</span>
        </div>
        {calculatedGoals && (
          <span className="onboarding-calorie-note">
            Recommended: {calculatedGoals.dailyCalorieGoal} cal
          </span>
        )}
      </div>

      {/* Macros */}
      <div className="onboarding-macros-section">
        <h3 className="onboarding-macros-title">Daily Macros</h3>
        <div className="onboarding-macros-grid">
          <div className="onboarding-macro-field">
            <Label>Protein</Label>
            <div className="onboarding-macro-input-wrapper">
              <Input
                type="number"
                min={30}
                max={300}
                value={protein}
                onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                className="onboarding-macro-input"
              />
              <span className="onboarding-macro-unit">g</span>
            </div>
          </div>
          <div className="onboarding-macro-field">
            <Label>Carbs</Label>
            <div className="onboarding-macro-input-wrapper">
              <Input
                type="number"
                min={50}
                max={500}
                value={carbs}
                onChange={(e) => setCarbs(parseInt(e.target.value) || 0)}
                className="onboarding-macro-input"
              />
              <span className="onboarding-macro-unit">g</span>
            </div>
          </div>
          <div className="onboarding-macro-field">
            <Label>Fat</Label>
            <div className="onboarding-macro-input-wrapper">
              <Input
                type="number"
                min={20}
                max={200}
                value={fat}
                onChange={(e) => setFat(parseInt(e.target.value) || 0)}
                className="onboarding-macro-input"
              />
              <span className="onboarding-macro-unit">g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Weight (optional) */}
      <div className="onboarding-target-weight">
        <Label>Target Weight (optional)</Label>
        <div className="onboarding-weight-field">
          <Input
            type="number"
            min={isMetric ? 20 : 50}
            max={isMetric ? 270 : 600}
            step={1}
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            placeholder={`Enter your goal weight in ${weightUnit}`}
            className="onboarding-input"
          />
          <span className="onboarding-unit">{weightUnit}</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="onboarding-nav">
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <div className="onboarding-nav-right">
          <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
            Skip for now
          </Button>
          <Button onClick={handleContinue} disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
