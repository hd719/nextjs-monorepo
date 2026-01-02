import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./ProfileForm.module.css";

interface FormData {
  displayName: string;
  dateOfBirth: string;
  gender: string;
  heightInches: string;
  currentWeightLbs: string;
  targetWeightLbs: string;
  activityLevel: string;
  goalType: string;
}

interface ProfilePersonalInfoProps {
  email: string | null;
  formData: FormData;
  onFieldChange: (field: keyof FormData, value: string) => void;
}

export function ProfilePersonalInfo({
  email,
  formData,
  onFieldChange,
}: ProfilePersonalInfoProps) {
  return (
    <Card className={styles.formSection}>
      <h2 className={styles.sectionHeading}>Personal Information</h2>
      <div className={styles.fieldGrid}>
        {/* Email (read-only) */}
        <div className={styles.emailField}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email || ""}
            disabled
            className={styles.readOnlyInput}
          />
          <p className={styles.helperText}>
            Email cannot be changed here. Contact support if needed.
          </p>
        </div>

        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            type="text"
            value={formData.displayName}
            onChange={(e) => onFieldChange("displayName", e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => onFieldChange("dateOfBirth", e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div>
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => onFieldChange("gender", e.target.value)}
            className={styles.selectInput}
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <Label htmlFor="heightInches">Height</Label>
          <Input
            id="heightInches"
            type="number"
            min="36"
            max="96"
            step="0.5"
            value={formData.heightInches}
            onChange={(e) => onFieldChange("heightInches", e.target.value)}
            placeholder="67"
          />
          {formData.heightInches && (
            <p className={styles.heightDisplay}>
              {Math.floor(parseFloat(formData.heightInches) / 12)}'{" "}
              {Math.round(parseFloat(formData.heightInches) % 12)}"
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="currentWeightLbs">Current Weight (lbs)</Label>
          <Input
            id="currentWeightLbs"
            type="number"
            min="50"
            max="1000"
            step="0.1"
            value={formData.currentWeightLbs}
            onChange={(e) => onFieldChange("currentWeightLbs", e.target.value)}
            placeholder="150"
          />
        </div>

        <div>
          <Label htmlFor="targetWeightLbs">Target Weight (lbs)</Label>
          <Input
            id="targetWeightLbs"
            type="number"
            min="50"
            max="1000"
            step="0.1"
            value={formData.targetWeightLbs}
            onChange={(e) => onFieldChange("targetWeightLbs", e.target.value)}
            placeholder="145"
          />
        </div>

        <div>
          <Label htmlFor="activityLevel">Activity Level</Label>
          <select
            id="activityLevel"
            value={formData.activityLevel}
            onChange={(e) => onFieldChange("activityLevel", e.target.value)}
            className={styles.selectInput}
          >
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="lightly_active">
              Lightly Active (1-3 days/week)
            </option>
            <option value="moderately_active">
              Moderately Active (3-5 days/week)
            </option>
            <option value="very_active">Very Active (6-7 days/week)</option>
            <option value="extremely_active">
              Extremely Active (physical job + exercise)
            </option>
          </select>
        </div>

        <div>
          <Label htmlFor="goalType">Goal</Label>
          <select
            id="goalType"
            value={formData.goalType}
            onChange={(e) => onFieldChange("goalType", e.target.value)}
            className={styles.selectInput}
          >
            <option value="lose_weight">Lose Weight</option>
            <option value="maintain_weight">Maintain Weight</option>
            <option value="gain_weight">Gain Weight</option>
            <option value="build_muscle">Build Muscle</option>
          </select>
        </div>
      </div>
    </Card>
  );
}
