import { useState, useEffect } from "react";
import type { OnboardingStepData } from "@/types";
import { ONBOARDING_DEFAULTS, ONBOARDING_LIMITS } from "@/constants/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/utils/cn";

interface PreferencesStepProps {
  data: OnboardingStepData;
  onNext: (data: OnboardingStepData) => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

/**
 * Step 4: Quick Preferences
 * Water goal, step goal, timezone (units already set in measurements step)
 */
export function PreferencesStep({
  data,
  onNext,
  onBack,
  onSkip,
  isLoading,
}: PreferencesStepProps) {
  const [waterGoal, setWaterGoal] = useState(
    data.dailyWaterGoal || ONBOARDING_DEFAULTS.dailyWaterGoal
  );
  const [stepGoal, setStepGoal] = useState(
    data.dailyStepGoal || ONBOARDING_DEFAULTS.dailyStepGoal
  );
  const [timezone, setTimezone] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);

  // Detect browser timezone on mount (must run client-side)
  // Always prefer browser timezone for new onboarding users
  useEffect(() => {
    if (hasInitialized) return;

    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Always use browser timezone - this is a new onboarding session
    setTimezone(browserTimezone || "UTC");
    setHasInitialized(true);
  }, [hasInitialized]);

  const handleContinue = () => {
    onNext({
      dailyWaterGoal: waterGoal,
      dailyStepGoal: stepGoal,
      timezone,
    });
  };

  // Get list of common timezones
  const timezones = Intl.supportedValuesOf("timeZone");

  return (
    <div className="onboarding-step">
      {/* Header */}
      <div className="onboarding-step-header">
        <h1 className="onboarding-step-title">Daily Goals</h1>
        <p className="onboarding-step-subtitle">
          Set your daily targets for water and steps
        </p>
      </div>

      {/* Preferences Form */}
      <div className="onboarding-form">
        {/* Water Goal */}
        <div className="onboarding-field-group">
          <Label>Daily Water Goal</Label>
          {/* Desktop: Slider */}
          <div className="onboarding-slider-container hidden sm:flex">
            <Slider
              min={ONBOARDING_LIMITS.waterGoal.min}
              max={ONBOARDING_LIMITS.waterGoal.max}
              step={1}
              value={[waterGoal]}
              onValueChange={(value: number[]) => setWaterGoal(value[0])}
              className="flex-1"
            />
            <div className="onboarding-slider-value">
              <span className="onboarding-slider-number">{waterGoal}</span>
              <span className="onboarding-slider-unit">glasses</span>
            </div>
          </div>
          {/* Mobile: Input */}
          <div className="onboarding-water-input-container flex sm:hidden">
            <Input
              type="number"
              min={ONBOARDING_LIMITS.waterGoal.min}
              max={ONBOARDING_LIMITS.waterGoal.max}
              value={waterGoal}
              onChange={(e) => setWaterGoal(parseInt(e.target.value) || 1)}
              className="flex-1"
            />
            <span className="onboarding-unit">glasses</span>
          </div>
          <p className="onboarding-field-hint">
            {waterGoal * 8} oz / {((waterGoal * 240) / 1000).toFixed(1)} L
          </p>
        </div>

        {/* Step Goal */}
        <div className="onboarding-field-group">
          <Label>Daily Step Goal</Label>
          <div className="onboarding-step-goal-field">
            <Input
              type="number"
              min={ONBOARDING_LIMITS.stepGoal.min}
              max={ONBOARDING_LIMITS.stepGoal.max}
              step={500}
              value={stepGoal}
              onChange={(e) => setStepGoal(parseInt(e.target.value) || 0)}
              className="onboarding-input"
            />
            <span className="onboarding-unit">steps</span>
          </div>
          <div className="onboarding-step-presets">
            {[5000, 8000, 10000, 12000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setStepGoal(preset)}
                className={cn(
                  "onboarding-preset-button",
                  stepGoal === preset && "onboarding-preset-button-selected"
                )}
              >
                {preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Timezone */}
        <div className="onboarding-field-group">
          <Label>Timezone</Label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="onboarding-select"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
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
