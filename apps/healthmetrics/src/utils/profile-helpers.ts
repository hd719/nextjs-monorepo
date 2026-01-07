import type { UserProfile } from "@/types/profile";

/**
 * Calculate profile completion percentage
 * Returns a value between 0 and 100
 */
export function calculateProfileCompletion(profile: UserProfile | null): {
  percentage: number;
  missingFields: string[];
} {
  if (!profile) {
    return { percentage: 0, missingFields: [] };
  }

  // Define fields to check with their display names
  const fieldsToCheck: Array<{ key: keyof UserProfile; label: string }> = [
    { key: "displayName", label: "Display name" },
    { key: "avatarUrl", label: "Profile photo" },
    { key: "dateOfBirth", label: "Date of birth" },
    { key: "gender", label: "Gender" },
    { key: "heightCm", label: "Height" },
    { key: "currentWeightLbs", label: "Current weight" },
    { key: "targetWeightLbs", label: "Target weight" },
    { key: "activityLevel", label: "Activity level" },
    { key: "goalType", label: "Goal type" },
    { key: "dailyCalorieGoal", label: "Calorie goal" },
  ];

  const missingFields: string[] = [];
  let completedCount = 0;

  for (const field of fieldsToCheck) {
    const value = profile[field.key];
    // Consider field complete if it's not null/undefined and not empty string
    if (value !== null && value !== undefined && value !== "") {
      completedCount++;
    } else {
      missingFields.push(field.label);
    }
  }

  const percentage = Math.round((completedCount / fieldsToCheck.length) * 100);
  return { percentage, missingFields };
}
import { type UpdateUserProfileInput } from "@/utils/validation";

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

export function kgToLbs(kg: number | null | undefined): string {
  if (!kg) return "";
  return (kg * 2.20462).toFixed(1);
}

export function cmToInches(cm: number | null | undefined): string {
  if (!cm) return "";
  return (cm / 2.54).toFixed(1);
}

export function getDefaultFormValues(initialData: UserProfile) {
  return {
    displayName: initialData.displayName || "",
    dateOfBirth: initialData.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: initialData.gender?.toLowerCase() || "",
    heightInches: cmToInches(initialData.heightCm),
    currentWeightLbs: initialData.currentWeightLbs?.toString() || "",
    targetWeightLbs: initialData.targetWeightLbs?.toString() || "",
    activityLevel: initialData.activityLevel || "moderately_active",
    goalType: initialData.goalType || "maintain_weight",
    timezone:
      initialData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    dailyCalorieGoal: initialData.dailyCalorieGoal?.toString() || "2000",
    dailyProteinGoalG: initialData.dailyProteinGoalG?.toString() || "150",
    dailyCarbGoalG: initialData.dailyCarbGoalG?.toString() || "200",
    dailyFatGoalG: initialData.dailyFatGoalG?.toString() || "65",
    dailyWaterGoal: initialData.dailyWaterGoal?.toString() || "8",
    dailyStepGoal: initialData.dailyStepGoal?.toString() || "10000",
  };
}

export function buildProfileUpdates(
  formValues: ReturnType<typeof getDefaultFormValues>,
  avatarUrl: string
): UpdateUserProfileInput {
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
    dailyWaterGoal: parseInt(formValues.dailyWaterGoal) || undefined,
    dailyStepGoal: parseInt(formValues.dailyStepGoal) || undefined,
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

export function validateAvatarFile(file: File): string | null {
  if (file.size > 2 * 1024 * 1024) {
    return "Avatar image must be less than 2MB";
  }

  if (!file.type.startsWith("image/")) {
    return "Avatar must be an image file";
  }

  return null;
}

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
