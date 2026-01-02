import { type UserProfile } from "@/server/profile";
import { type UpdateUserProfileInput } from "@/lib/validation";

/**
 * Helper function to format dates for display
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

/**
 * Convert kg to lbs with proper formatting
 */
export function kgToLbs(kg: number | null | undefined): string {
  if (!kg) return "";
  return (kg * 2.20462).toFixed(1);
}

/**
 * Convert cm to inches with proper formatting
 */
export function cmToInches(cm: number | null | undefined): string {
  if (!cm) return "";
  return (cm / 2.54).toFixed(1);
}

/**
 * Initialize form default values from user profile data
 */
export function getDefaultFormValues(initialData: UserProfile) {
  return {
    displayName: initialData.displayName || "",
    dateOfBirth: initialData.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: initialData.gender?.toLowerCase() || "",
    heightInches: cmToInches(initialData.heightCm),
    currentWeightLbs: kgToLbs(initialData.currentWeightKg),
    targetWeightLbs: kgToLbs(initialData.targetWeightKg),
    activityLevel: initialData.activityLevel || "moderately_active",
    goalType: initialData.goalType || "maintain_weight",
    timezone:
      initialData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    dailyCalorieGoal: initialData.dailyCalorieGoal?.toString() || "2000",
    dailyProteinGoalG: initialData.dailyProteinGoalG?.toString() || "150",
    dailyCarbGoalG: initialData.dailyCarbGoalG?.toString() || "200",
    dailyFatGoalG: initialData.dailyFatGoalG?.toString() || "65",
  };
}

/**
 * Build the updates object for profile submission
 * Handles type transformations from form strings to proper types
 */
export function buildProfileUpdates(
  formValues: ReturnType<typeof getDefaultFormValues>,
  avatarUrl: string
): UpdateUserProfileInput {
  // Type-safe conversion helper for enum values
  const toEnumValue = <T extends string>(
    value: string | undefined,
    validValues: readonly T[]
  ): T | undefined => {
    if (!value || value === "") return undefined;
    return validValues.includes(value as T) ? (value as T) : undefined;
  };

  return {
    displayName: formValues.displayName || undefined,
    avatarUrl: avatarUrl || undefined,
    timezone: formValues.timezone || undefined,
    dateOfBirth: formValues.dateOfBirth || undefined,
    gender: toEnumValue(formValues.gender, [
      "male",
      "female",
      "other",
    ] as const),
    heightInches: formValues.heightInches
      ? parseFloat(formValues.heightInches)
      : undefined,
    currentWeightLbs: formValues.currentWeightLbs
      ? parseFloat(formValues.currentWeightLbs)
      : undefined,
    targetWeightLbs: formValues.targetWeightLbs
      ? parseFloat(formValues.targetWeightLbs)
      : undefined,
    dailyCalorieGoal: parseInt(formValues.dailyCalorieGoal) || undefined,
    dailyProteinGoalG: parseInt(formValues.dailyProteinGoalG) || undefined,
    dailyCarbGoalG: parseInt(formValues.dailyCarbGoalG) || undefined,
    dailyFatGoalG: parseInt(formValues.dailyFatGoalG) || undefined,
    activityLevel: toEnumValue(formValues.activityLevel, [
      "sedentary",
      "lightly_active",
      "moderately_active",
      "very_active",
      "extremely_active",
    ] as const),
    goalType: toEnumValue(formValues.goalType, [
      "lose_weight",
      "maintain_weight",
      "gain_weight",
      "build_muscle",
    ] as const),
  };
}

/**
 * Validate avatar file for upload
 * Returns error message if invalid, null if valid
 */
export function validateAvatarFile(file: File): string | null {
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return "Avatar image must be less than 2MB";
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return "Avatar must be an image file";
  }

  return null;
}

/**
 * Convert file to base64 string for preview
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Calculate macro breakdown percentages
 */
export function calculateMacroBreakdown(
  protein: string,
  carbs: string,
  fat: string,
  calories: string
) {
  const proteinCals = parseInt(protein) * 4 || 0;
  const carbCals = parseInt(carbs) * 4 || 0;
  const fatCals = parseInt(fat) * 9 || 0;
  const totalCals = parseInt(calories) || 2000;

  return {
    proteinCals,
    carbCals,
    fatCals,
    totalCals,
    proteinPercent: Math.round((proteinCals / totalCals) * 100),
    carbPercent: Math.round((carbCals / totalCals) * 100),
    fatPercent: Math.round((fatCals / totalCals) * 100),
  };
}
