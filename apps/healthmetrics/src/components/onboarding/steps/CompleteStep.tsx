import { Link } from "@tanstack/react-router";
import type { OnboardingStepData } from "@/types/onboarding";
import { GOAL_OPTIONS } from "@/constants/onboarding";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Utensils,
  Dumbbell,
  LayoutDashboard,
  PartyPopper,
} from "lucide-react";

interface CompleteStepProps {
  data: OnboardingStepData;
  onComplete: () => void;
  isCompleting: boolean;
}

/**
 * Step 5: Completion
 * Success message with summary and quick actions
 */
export function CompleteStep({
  data,
  onComplete,
  isCompleting,
}: CompleteStepProps) {
  const goalOption = GOAL_OPTIONS.find((g) => g.value === data.goalType);
  const isMetric = data.unitsPreference === "metric";

  // Format target weight based on units preference (whole numbers)
  const formatTargetWeight = (weightLbs: number): string => {
    if (isMetric) {
      // Convert lbs to kg and round to whole number
      return Math.round(weightLbs / 2.20462).toString();
    }
    // Round lbs to whole number
    return Math.round(weightLbs).toString();
  };

  return (
    <div className="onboarding-step onboarding-complete-step">
      {/* Success Animation */}
      <div className="onboarding-complete-animation">
        <div className="onboarding-complete-checkmark">
          <CheckCircle className="onboarding-complete-icon" />
        </div>
      </div>

      {/* Header */}
      <div className="onboarding-step-header">
        <h1 className="onboarding-step-title flex items-center justify-center gap-2">
          You're All Set! <PartyPopper className="w-7 h-7" />
        </h1>
        <p className="onboarding-step-subtitle">
          Your personalized plan is ready. Let's start your journey!
        </p>
      </div>

      {/* Summary Card */}
      <div className="onboarding-summary-card">
        <h3 className="onboarding-summary-title">Your Plan</h3>
        <div className="onboarding-summary-items">
          {goalOption && (
            <div className="onboarding-summary-item">
              <span className="onboarding-summary-label">Goal</span>
              <span className="onboarding-summary-value onboarding-summary-goal">
                <goalOption.icon className="onboarding-summary-goal-icon" />
                {goalOption.label}
              </span>
            </div>
          )}
          {data.dailyCalorieGoal && (
            <div className="onboarding-summary-item">
              <span className="onboarding-summary-label">Daily Calories</span>
              <span className="onboarding-summary-value">
                {data.dailyCalorieGoal.toLocaleString()} cal
              </span>
            </div>
          )}
          {data.targetWeightLbs && (
            <div className="onboarding-summary-item">
              <span className="onboarding-summary-label">Target Weight</span>
              <span className="onboarding-summary-value">
                {formatTargetWeight(data.targetWeightLbs)}{" "}
                {isMetric ? "kg" : "lbs"}
              </span>
            </div>
          )}
          {data.dailyStepGoal && (
            <div className="onboarding-summary-item">
              <span className="onboarding-summary-label">Daily Steps</span>
              <span className="onboarding-summary-value">
                {data.dailyStepGoal.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="onboarding-actions">
        <h3 className="onboarding-actions-title">
          What would you like to do first?
        </h3>
        <div className="onboarding-action-buttons">
          <Button
            asChild
            variant="outline"
            className="onboarding-action-button"
            onClick={onComplete}
          >
            <Link to={ROUTES.DIARY}>
              <Utensils className="onboarding-action-icon" />
              <span>Log your first meal</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="onboarding-action-button"
            onClick={onComplete}
          >
            <Link to={ROUTES.EXERCISE}>
              <Dumbbell className="onboarding-action-icon" />
              <span>Log a workout</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="onboarding-action-button"
            onClick={onComplete}
          >
            <Link to={ROUTES.DASHBOARD}>
              <LayoutDashboard className="onboarding-action-icon" />
              <span>Explore dashboard</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Alternative: Just go to dashboard */}
      <Button
        variant="link"
        onClick={onComplete}
        disabled={isCompleting}
        className="onboarding-complete-link"
      >
        {isCompleting ? "Finishing up..." : "Go to Dashboard"}
      </Button>
    </div>
  );
}
