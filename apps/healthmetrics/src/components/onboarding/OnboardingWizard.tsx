import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { useOnboardingWizard } from "@/hooks/useOnboarding";
import { useGoalCalculation } from "@/hooks/useGoalCalculation";
import { ONBOARDING_TOTAL_STEPS, ROUTES } from "@/constants";
import type { OnboardingStepData } from "@/types/onboarding";
import { ONBOARDING_CONTENT_STEPS } from "@/constants/onboarding";
import { WelcomeStep } from "./steps/WelcomeStep";
import { MeasurementsStep } from "./steps/MeasurementsStep";
import { GoalsStep } from "./steps/GoalsStep";
import { PreferencesStep } from "./steps/PreferencesStep";
import { CompleteStep } from "./steps/CompleteStep";

interface OnboardingWizardProps {
  userId: string;
  userName?: string;
}

/**
 * Main onboarding wizard container
 * Manages step navigation and data persistence
 */
export function OnboardingWizard({ userId, userName }: OnboardingWizardProps) {
  const navigate = useNavigate();
  const {
    state,
    isLoading,
    saveStep,
    isSaving,
    complete,
    isCompleting,
    skip,
    isSkipping,
  } = useOnboardingWizard(userId);

  // Local step state (1-indexed for display)
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<OnboardingStepData>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Goal calculation hook - returns { goals, isCalculating, error, calculate }
  const {
    goals: calculatedGoals,
    isCalculating,
    calculate: calculateGoals,
  } = useGoalCalculation();

  // Initialize from server state ONLY ONCE on first load
  // After that, we manage state locally to prevent flash/revert issues
  useEffect(() => {
    if (state && !isInitialized) {
      // Resume from where user left off, but at least step 1
      const resumeStep = Math.max(1, state.currentStep);
      setCurrentStep(resumeStep);
      setStepData(state.data);
      setIsInitialized(true);

      // If already completed, redirect to dashboard
      if (state.completed) {
        navigate({ to: ROUTES.DASHBOARD });
      }
    }
  }, [state, navigate, isInitialized]);

  // Handle step navigation
  const handleNext = async (data: OnboardingStepData) => {
    // Merge new data with existing
    const newData = { ...stepData, ...data };
    setStepData(newData);

    // Calculate the next step
    const nextStep =
      currentStep < ONBOARDING_TOTAL_STEPS ? currentStep + 1 : currentStep;

    // Save to server with NEXT step number so user resumes at correct place
    await saveStep(nextStep, data);

    // Calculate goals after measurements step (step 2)
    if (currentStep === 2) {
      calculateGoals(newData);
    }

    // Move to next step locally
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await skip();
    navigate({ to: ROUTES.DASHBOARD });
  };

  const handleComplete = async () => {
    await complete();
    navigate({ to: ROUTES.DASHBOARD });
  };

  // Show loading state while fetching initial state
  if (isLoading) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-loading">
          <Activity className="onboarding-loading-icon" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      {/* Logo */}
      <div className="onboarding-logo">
        <Activity className="onboarding-logo-icon" />
        <span className="onboarding-logo-text">HealthMetrics</span>
      </div>

      {/* Simple step counter */}
      {currentStep < ONBOARDING_TOTAL_STEPS && (
        <span className="onboarding-step-counter">
          Step {currentStep} of {ONBOARDING_CONTENT_STEPS}
        </span>
      )}

      {/* Step content */}
      <div className="onboarding-content">
        {currentStep === 1 && (
          <WelcomeStep
            data={stepData}
            userName={userName}
            onNext={handleNext}
            onSkip={handleSkip}
            isLoading={isSaving || isSkipping}
          />
        )}

        {currentStep === 2 && (
          <MeasurementsStep
            data={stepData}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            isLoading={isSaving || isSkipping}
          />
        )}

        {currentStep === 3 && (
          <GoalsStep
            data={stepData}
            calculatedGoals={calculatedGoals}
            isCalculating={isCalculating}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            isLoading={isSaving || isSkipping}
          />
        )}

        {currentStep === 4 && (
          <PreferencesStep
            data={stepData}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            isLoading={isSaving || isSkipping}
          />
        )}

        {currentStep === 5 && (
          <CompleteStep
            data={stepData}
            onComplete={handleComplete}
            isCompleting={isCompleting}
          />
        )}
      </div>
    </div>
  );
}
