import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Lock } from "lucide-react";
import { ACTIVITY_LEVEL_OPTIONS, GENDER_OPTIONS } from "@/constants/onboarding";
import type {
  OnboardingStepData,
  Gender,
  ActivityLevel,
  UnitsPreference,
} from "@/types";
import { feetInchesToCm, cmToFeetInches, lbsToKg, kgToLbs } from "@/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/cn";

const UNITS_OPTIONS: Array<{ value: UnitsPreference; label: string }> = [
  { value: "imperial", label: "Imperial (lbs, ft)" },
  { value: "metric", label: "Metric (kg, cm)" },
];

interface MeasurementsStepProps {
  data: OnboardingStepData;
  onNext: (data: OnboardingStepData) => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

/**
 * Step 2: Basic Measurements
 * Collects height, weight, DOB, gender, activity level
 */
export function MeasurementsStep({
  data,
  onNext,
  onBack,
  onSkip,
  isLoading,
}: MeasurementsStepProps) {
  // Units preference - default to imperial
  const [units, setUnits] = useState<UnitsPreference>(
    data.unitsPreference || "imperial"
  );

  // Height state - store in current unit system
  const initialFeetInches = data.heightCm
    ? cmToFeetInches(data.heightCm)
    : { feet: 5, inches: 7 };
  const initialHeightCm = data.heightCm || 170;

  const [heightFeet, setHeightFeet] = useState(initialFeetInches.feet);
  const [heightInches, setHeightInches] = useState(initialFeetInches.inches);
  const [heightCm, setHeightCm] = useState(initialHeightCm.toString());

  const initialWeightLbs = Math.round(data.currentWeightLbs || 150);
  const initialWeightKg = Math.round(lbsToKg(initialWeightLbs));

  const [weightLbs, setWeightLbs] = useState(initialWeightLbs.toString());
  const [weightKg, setWeightKg] = useState(initialWeightKg.toString());

  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
  );
  const [gender, setGender] = useState<Gender | undefined>(data.gender);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>(
    data.activityLevel
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Validation based on units
  const isImperial = units === "imperial";
  const heightValid = isImperial
    ? heightFeet >= 3 &&
      heightFeet <= 8 &&
      heightInches >= 0 &&
      heightInches <= 11
    : parseFloat(heightCm) >= 100 && parseFloat(heightCm) <= 250;
  const weightValid = isImperial
    ? parseFloat(weightLbs) >= 50 && parseFloat(weightLbs) <= 600
    : parseFloat(weightKg) >= 25 && parseFloat(weightKg) <= 275;

  const isValid =
    heightValid && weightValid && dateOfBirth && gender && activityLevel;

  const handleContinue = () => {
    if (!isValid || !dateOfBirth) return;

    // Convert to standard units (cm, lbs) for storage
    const finalHeightCm = isImperial
      ? feetInchesToCm(heightFeet, heightInches)
      : parseFloat(heightCm);
    const finalWeightLbs = isImperial
      ? parseFloat(weightLbs)
      : kgToLbs(parseFloat(weightKg));

    onNext({
      heightCm: finalHeightCm,
      currentWeightLbs: finalWeightLbs,
      dateOfBirth: format(dateOfBirth, "yyyy-MM-dd"),
      gender,
      activityLevel,
      unitsPreference: units,
    });
  };

  return (
    <div className="onboarding-step">
      {/* Header */}
      <div className="onboarding-step-header">
        <h1 className="onboarding-step-title">Tell us about yourself</h1>
        <p className="onboarding-step-subtitle">
          This helps us calculate your personalized goals
        </p>
      </div>

      {/* Form */}
      <div className="onboarding-form">
        {/* Measurement Units - First! */}
        <div className="onboarding-field-group">
          <Label>Measurement Units</Label>
          <div className="onboarding-radio-group">
            {UNITS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setUnits(option.value)}
                className={cn(
                  "onboarding-radio-button",
                  units === option.value && "onboarding-radio-button-selected"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Height - Different inputs based on units */}
        <div className="onboarding-field-group">
          <Label>Height</Label>
          {isImperial ? (
            <div className="onboarding-height-inputs">
              <div className="onboarding-height-field">
                <Input
                  type="number"
                  min={3}
                  max={8}
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(parseInt(e.target.value) || 0)}
                  className="onboarding-input"
                />
                <span className="onboarding-unit">ft</span>
              </div>
              <div className="onboarding-height-field">
                <Input
                  type="number"
                  min={0}
                  max={11}
                  value={heightInches}
                  onChange={(e) =>
                    setHeightInches(parseInt(e.target.value) || 0)
                  }
                  className="onboarding-input"
                />
                <span className="onboarding-unit">in</span>
              </div>
            </div>
          ) : (
            <div className="onboarding-weight-field">
              <Input
                type="number"
                min={100}
                max={250}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="170"
                className="onboarding-input"
              />
              <span className="onboarding-unit">cm</span>
            </div>
          )}
        </div>

        {/* Weight - Different inputs based on units */}
        <div className="onboarding-field-group">
          <Label>Current Weight</Label>
          <div className="onboarding-weight-field">
            {isImperial ? (
              <>
                <Input
                  type="number"
                  min={50}
                  max={600}
                  step={1}
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  placeholder="150"
                  className="onboarding-input"
                />
                <span className="onboarding-unit">lbs</span>
              </>
            ) : (
              <>
                <Input
                  type="number"
                  min={25}
                  max={275}
                  step={1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="70"
                  className="onboarding-input"
                />
                <span className="onboarding-unit">kg</span>
              </>
            )}
          </div>
        </div>

        {/* Date of Birth */}
        <div className="onboarding-field-group">
          <Label>Date of Birth</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateOfBirth && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth
                  ? format(dateOfBirth, "PPP")
                  : "Select your birth date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateOfBirth}
                onSelect={(date) => {
                  setDateOfBirth(date);
                  setCalendarOpen(false);
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                defaultMonth={dateOfBirth || new Date(1990, 0)}
                captionLayout="dropdown"
                fromYear={1920}
                toYear={new Date().getFullYear()}
                classNames={{
                  caption_label: "hidden",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Gender */}
        <div className="onboarding-field-group">
          <Label>Gender</Label>
          <div className="onboarding-radio-group">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGender(option.value)}
                className={cn(
                  "onboarding-radio-button",
                  gender === option.value && "onboarding-radio-button-selected"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div className="onboarding-field-group">
          <Label>Activity Level</Label>
          <div className="onboarding-activity-grid">
            {ACTIVITY_LEVEL_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setActivityLevel(option.value)}
                className={cn(
                  "onboarding-activity-card",
                  activityLevel === option.value &&
                    "onboarding-activity-card-selected"
                )}
              >
                <span className="onboarding-activity-label">
                  {option.label}
                </span>
                <span className="onboarding-activity-description">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy note */}
      <p className="onboarding-privacy-note flex items-center justify-center gap-2">
        <Lock className="w-4 h-4 shrink-0" />
        <span>
          We use this information only to calculate your personalized goals
        </span>
      </p>

      {/* Navigation */}
      <div className="onboarding-nav">
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <div className="onboarding-nav-right">
          <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
            Skip for now
          </Button>
          <Button onClick={handleContinue} disabled={!isValid || isLoading}>
            {isLoading ? "Calculating..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
