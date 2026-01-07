import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/types/profile";
import { useUpdateProfile } from "@/hooks/useProfile";
import { ProfileAvatar } from "./ProfileAvatar";
import {
  formatDate,
  getDefaultFormValues,
  buildProfileUpdates,
  validateAvatarFile,
  fileToBase64,
  calculateMacroBreakdown,
} from "@/utils/profile-helpers";
import {
  displayNameValidator,
  heightValidator,
  weightValidator,
  calorieGoalValidator,
  proteinGoalValidator,
  carbGoalValidator,
  fatGoalValidator,
} from "@/utils/profile-validators";

export interface ProfileFormProps {
  userId: string;
  initialData: UserProfile;
}

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const updateProfileMutation = useUpdateProfile();

  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || "");
  const [avatarPreview, setAvatarPreview] = useState(
    initialData.avatarUrl || ""
  );

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: getDefaultFormValues(initialData),
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      setErrorMessage(null);

      try {
        // Build updates object with proper transformations
        const updates = buildProfileUpdates(value, avatarUrl);

        await updateProfileMutation.mutateAsync({
          userId,
          updates,
        });

        setSuccessMessage("Profile updated successfully!");
      } catch (error) {
        console.error("Failed to update profile:", error);
        setErrorMessage("Failed to update profile. Please try again.");
      }
    },
  });

  // Handle avatar file upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate the file
    const validationError = validateAvatarFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // Convert to base64 for preview
    try {
      const base64 = await fileToBase64(file);
      setAvatarPreview(base64);
      setAvatarUrl(base64);
    } catch (error) {
      setErrorMessage("Failed to process avatar image");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="profile-form"
    >
      {/* Success Message */}
      {successMessage && (
        <div className="profile-form-success-message">
          <p className="profile-form-success-text">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="profile-form-error-message">
          <p className="profile-form-error-text">{errorMessage}</p>
        </div>
      )}

      {/* Hero Section: Avatar + Personal Information */}
      <Card
        variant="hero"
        className="profile-hero-section animate-fade-slide-in"
      >
        <div className="profile-hero-layout">
          {/* Avatar Column */}
          <div className="profile-hero-avatar">
            <ProfileAvatar
              avatarPreview={avatarPreview}
              onAvatarChange={handleAvatarChange}
            />
          </div>

          {/* Personal Information Column */}
          <div className="profile-hero-info">
            <h2 className="profile-form-section-heading">
              Personal Information
            </h2>
            <div className="profile-form-field-grid">
              {/* Email (read-only) */}
              <div className="profile-form-email-field">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={initialData.email || ""}
                  disabled
                  className="profile-form-read-only-input"
                />
                <p className="profile-form-helper-text">
                  Email cannot be changed here. Contact support if needed.
                </p>
              </div>

              {/* Display Name */}
              <form.Field
                name="displayName"
                validators={{ onChange: displayNameValidator }}
              >
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Display Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Your name"
                    />
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <p className="profile-form-error-text">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              {/* Date of Birth */}
              <form.Field name="dateOfBirth">
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Date of Birth</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                )}
              </form.Field>

              {/* Gender */}
              <form.Field name="gender">
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Gender</Label>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="profile-form-select-input"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
              </form.Field>

              {/* Height */}
              <form.Field
                name="heightInches"
                validators={{ onChange: heightValidator }}
              >
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Height</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="36"
                      max="96"
                      step="0.5"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="67"
                    />
                    {field.state.value && !field.state.meta.errors.length && (
                      <p className="profile-form-height-display">
                        {Math.floor(parseFloat(field.state.value) / 12)}'{" "}
                        {Math.round(parseFloat(field.state.value) % 12)}"
                      </p>
                    )}
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <p className="profile-form-error-text">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              {/* Current Weight */}
              <form.Field
                name="currentWeightLbs"
                validators={{ onChange: weightValidator }}
              >
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Current Weight (lbs)</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="50"
                      max="1000"
                      step="0.1"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="150"
                    />
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <p className="profile-form-error-text">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              {/* Target Weight */}
              <form.Field
                name="targetWeightLbs"
                validators={{ onChange: weightValidator }}
              >
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Target Weight (lbs)</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="50"
                      max="1000"
                      step="0.1"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="145"
                    />
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <p className="profile-form-error-text">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              {/* Activity Level */}
              <form.Field name="activityLevel">
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Activity Level</Label>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="profile-form-select-input"
                    >
                      <option value="sedentary">
                        Sedentary (little or no exercise)
                      </option>
                      <option value="lightly_active">
                        Lightly Active (1-3 days/week)
                      </option>
                      <option value="moderately_active">
                        Moderately Active (3-5 days/week)
                      </option>
                      <option value="very_active">
                        Very Active (6-7 days/week)
                      </option>
                      <option value="extremely_active">
                        Extremely Active (physical job + exercise)
                      </option>
                    </select>
                  </div>
                )}
              </form.Field>

              {/* Goal Type */}
              <form.Field name="goalType">
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Goal</Label>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="profile-form-select-input"
                    >
                      <option value="lose_weight">Lose Weight</option>
                      <option value="maintain_weight">Maintain Weight</option>
                      <option value="gain_weight">Gain Weight</option>
                      <option value="build_muscle">Build Muscle</option>
                    </select>
                  </div>
                )}
              </form.Field>
            </div>
          </div>
        </div>
      </Card>

      {/* Supporting Sections Grid */}
      <div className="profile-supporting-grid animate-fade-slide-in animate-stagger-1">
        {/* Account Settings Section */}
        <Card variant="supporting" className="profile-form-section">
          <h2 className="profile-form-section-heading">Account Settings</h2>
          <div className="profile-form-field-grid">
            {/* Timezone */}
            <form.Field name="timezone">
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Timezone</Label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="profile-form-select-input"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">
                      Pacific Time (PT)
                    </option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  </select>
                </div>
              )}
            </form.Field>

            {/* Account Created (read-only) */}
            <div>
              <Label htmlFor="createdAt">Account Created</Label>
              <Input
                id="createdAt"
                type="text"
                value={formatDate(initialData.createdAt)}
                disabled
                className="profile-form-read-only-input"
              />
            </div>

            {/* Last Updated (read-only) */}
            <div>
              <Label htmlFor="updatedAt">Last Updated</Label>
              <Input
                id="updatedAt"
                type="text"
                value={formatDate(initialData.updatedAt)}
                disabled
                className="profile-form-read-only-input"
              />
            </div>

            {/* Admin Status (read-only) */}
            {initialData.isAdmin && (
              <div className="profile-form-email-field">
                <Label htmlFor="isAdmin">Account Type</Label>
                <Input
                  id="isAdmin"
                  type="text"
                  value="Administrator"
                  disabled
                  className="profile-form-read-only-input"
                />
                <p className="profile-form-helper-text">
                  You have administrator privileges.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Daily Nutrition Goals Section */}
        <Card variant="supporting" className="profile-form-section">
          <h2 className="profile-form-section-heading">
            Daily Nutrition Goals
          </h2>
          <p className="profile-form-section-description">
            Set your daily targets for calories and macronutrients. These will
            be shown on your dashboard.
          </p>

          <div className="profile-form-field-grid">
            {/* Daily Calorie Goal */}
            <form.Field
              name="dailyCalorieGoal"
              validators={{ onChange: calorieGoalValidator }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Calories Goal (kcal)</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="500"
                    max="10000"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors &&
                    field.state.meta.errors.length > 0 && (
                      <p className="profile-form-error-text">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                </div>
              )}
            </form.Field>

            {/* Daily Protein Goal */}
            <form.Field
              name="dailyProteinGoalG"
              validators={{ onChange: proteinGoalValidator }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Protein Goal (grams)</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0"
                    max="500"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors &&
                    field.state.meta.errors.length > 0 && (
                      <p className="profile-form-error-text">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                </div>
              )}
            </form.Field>

            {/* Daily Carb Goal */}
            <form.Field
              name="dailyCarbGoalG"
              validators={{ onChange: carbGoalValidator }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Carbs Goal (grams)</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0"
                    max="1000"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors &&
                    field.state.meta.errors.length > 0 && (
                      <p className="profile-form-error-text">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                </div>
              )}
            </form.Field>

            {/* Daily Fat Goal */}
            <form.Field
              name="dailyFatGoalG"
              validators={{ onChange: fatGoalValidator }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Fat Goal (grams)</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0"
                    max="300"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors &&
                    field.state.meta.errors.length > 0 && (
                      <p className="profile-form-error-text">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Macro Breakdown Display */}
          <form.Subscribe
            selector={(state) => [
              state.values.dailyCalorieGoal,
              state.values.dailyProteinGoalG,
              state.values.dailyCarbGoalG,
              state.values.dailyFatGoalG,
            ]}
          >
            {([calories, protein, carbs, fat]) => {
              const breakdown = calculateMacroBreakdown(
                protein,
                carbs,
                fat,
                calories
              );

              return (
                <div className="profile-form-macro-container">
                  <p className="profile-form-macro-title">Macro Breakdown:</p>
                  <div className="profile-form-macro-list">
                    <div>
                      Protein: {breakdown.proteinCals.toLocaleString()} kcal (
                      {breakdown.proteinPercent}%)
                    </div>
                    <div>
                      Carbs: {breakdown.carbCals.toLocaleString()} kcal (
                      {breakdown.carbPercent}%)
                    </div>
                    <div>
                      Fat: {breakdown.fatCals.toLocaleString()} kcal (
                      {breakdown.fatPercent}%)
                    </div>
                  </div>
                </div>
              );
            }}
          </form.Subscribe>
        </Card>
      </div>

      {/* Submit Button */}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <div className="profile-form-submit-container">
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="profile-form-button-icon" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
