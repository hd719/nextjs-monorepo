import { useState } from "react";
import { GOAL_OPTIONS } from "@/constants/onboarding";
import type { OnboardingGoalType, OnboardingStepData } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface WelcomeStepProps {
  data: OnboardingStepData;
  userName?: string;
  onNext: (data: OnboardingStepData) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

/**
 * Step 1: Welcome & Goal Selection
 * User selects their primary health goal
 */
export function WelcomeStep({
  data,
  userName,
  onNext,
  onSkip,
  isLoading,
}: WelcomeStepProps) {
  const [selectedGoal, setSelectedGoal] = useState<
    OnboardingGoalType | undefined
  >(data.goalType);

  const handleContinue = () => {
    if (selectedGoal) {
      onNext({ goalType: selectedGoal });
    }
  };

  return (
    <div className="onboarding-step">
      {/* Header */}
      <div className="onboarding-step-header">
        <h1 className="onboarding-step-title">
          Welcome{userName ? `, ${userName}` : ""}!
        </h1>
        <p className="onboarding-step-subtitle">
          Let's personalize your experience. What's your main goal?
        </p>
      </div>

      {/* Goal Cards */}
      <div className="onboarding-goal-grid">
        {GOAL_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedGoal(option.value)}
              className={cn(
                "onboarding-goal-card",
                selectedGoal === option.value && "onboarding-goal-card-selected"
              )}
            >
              <Icon className="onboarding-goal-icon" />
              <div className="onboarding-goal-text">
                <span className="onboarding-goal-label">{option.label}</span>
                <span className="onboarding-goal-description">
                  {option.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="onboarding-nav">
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          disabled={isLoading}
        >
          Skip for now
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!selectedGoal || isLoading}
        >
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
