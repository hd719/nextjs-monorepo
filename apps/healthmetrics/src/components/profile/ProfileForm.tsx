import { useState, useTransition } from "react";
import { useRouter } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateUserProfile, type UserProfile } from "@/server/profile";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfilePersonalInfo } from "./ProfilePersonalInfo";
import { ProfileAccountSettings } from "./ProfileAccountSettings";
import { ProfileNutritionGoals } from "./ProfileNutritionGoals";
import styles from "./ProfileForm.module.css";

export interface ProfileFormProps {
  userId: string;
  initialData: UserProfile;
}

interface FormData {
  displayName: string;
  dateOfBirth: string;
  gender: string;
  currentWeightLbs: string;
  targetWeightLbs: string;
  dailyCalorieGoal: string;
  dailyProteinGoalG: string;
  dailyCarbGoalG: string;
  dailyFatGoalG: string;
  heightInches: string;
  activityLevel: string;
  goalType: string;
}

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const router = useRouter();

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || "");
  const [avatarPreview, setAvatarPreview] = useState(
    initialData.avatarUrl || ""
  );

  // Auto-detect timezone
  const [timezone, setTimezone] = useState(
    initialData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Form state
  const [formData, setFormData] = useState<FormData>({
    displayName: initialData.displayName || "",
    dateOfBirth: initialData.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: initialData.gender?.toLowerCase() || "",
    currentWeightLbs: initialData.currentWeightKg
      ? (initialData.currentWeightKg * 2.20462).toFixed(1)
      : "",
    targetWeightLbs: initialData.targetWeightKg
      ? (initialData.targetWeightKg * 2.20462).toFixed(1)
      : "",
    dailyCalorieGoal: initialData.dailyCalorieGoal?.toString() || "2000",
    dailyProteinGoalG: initialData.dailyProteinGoalG?.toString() || "150",
    dailyCarbGoalG: initialData.dailyCarbGoalG?.toString() || "200",
    dailyFatGoalG: initialData.dailyFatGoalG?.toString() || "65",
    heightInches: initialData.heightCm
      ? (initialData.heightCm / 2.54).toFixed(1)
      : "",
    activityLevel: initialData.activityLevel || "moderately_active",
    goalType: initialData.goalType || "maintain_weight",
  });

  // Helper to update a single field
  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle avatar file upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Avatar image must be less than 2MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Avatar must be an image file");
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        setAvatarUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const updates: any = {};

        // Field mappings with optional transformations
        const fieldMappings: Record<
          string,
          { value: any; transform?: (v: any) => any; required?: boolean }
        > = {
          displayName: { value: formData.displayName },
          avatarUrl: { value: avatarUrl },
          timezone: { value: timezone, required: true },
          dateOfBirth: { value: formData.dateOfBirth },
          gender: { value: formData.gender },
          heightInches: {
            value: formData.heightInches,
            transform: parseFloat,
          },
          currentWeightLbs: {
            value: formData.currentWeightLbs,
            transform: parseFloat,
          },
          targetWeightLbs: {
            value: formData.targetWeightLbs,
            transform: parseFloat,
          },
          dailyCalorieGoal: {
            value: formData.dailyCalorieGoal,
            transform: parseInt,
          },
          dailyProteinGoalG: {
            value: formData.dailyProteinGoalG,
            transform: parseInt,
          },
          dailyCarbGoalG: {
            value: formData.dailyCarbGoalG,
            transform: parseInt,
          },
          dailyFatGoalG: {
            value: formData.dailyFatGoalG,
            transform: parseInt,
          },
          activityLevel: { value: formData.activityLevel },
          goalType: { value: formData.goalType },
        };

        // Build updates object dynamically
        for (const [key, config] of Object.entries(fieldMappings)) {
          if (config.value || config.required) {
            updates[key] = config.transform
              ? config.transform(config.value)
              : config.value;
          }
        }

        await updateUserProfile({
          data: {
            userId,
            updates,
          },
        });

        setSuccessMessage("Profile updated successfully!");
        router.invalidate();
      } catch (error) {
        console.error("Failed to update profile:", error);
        setErrorMessage("Failed to update profile. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Success Message */}
      {successMessage && (
        <div className={styles.successMessage}>
          <p className={styles.successText}>{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className={styles.errorMessage}>
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}

      {/* Avatar Upload */}
      <ProfileAvatar
        avatarPreview={avatarPreview}
        onAvatarChange={handleAvatarChange}
      />

      {/* Personal Information */}
      <ProfilePersonalInfo
        email={initialData.email}
        formData={formData}
        onFieldChange={updateField}
      />

      {/* Account Settings */}
      <ProfileAccountSettings
        timezone={timezone}
        onTimezoneChange={setTimezone}
        createdAt={initialData.createdAt}
        updatedAt={initialData.updatedAt}
        isAdmin={initialData.isAdmin}
      />

      {/* Daily Nutrition Goals */}
      <ProfileNutritionGoals formData={formData} onFieldChange={updateField} />

      {/* Submit Button */}
      <div className={styles.submitContainer}>
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <>Saving...</>
          ) : (
            <>
              <Save className={styles.buttonIcon} />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
