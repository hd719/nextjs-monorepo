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

export function formatKgToLbs(kg: number | null | undefined): string {
  if (!kg) return "";
  return (kg * 2.20462).toFixed(1);
}

export function cmToInches(cm: number | null | undefined): string {
  if (!cm) return "";
  return (cm / 2.54).toFixed(1);
}

// Convert lbs to kg for display
export function lbsToKgDisplay(lbs: number | null | undefined): string {
  if (!lbs) return "";
  return (lbs / 2.20462).toFixed(1);
}

// Get height value based on units preference (whole numbers only)
function getHeightValue(
  heightCm: number | null | undefined,
  units: string
): string {
  if (!heightCm) return "";
  if (units === "metric") {
    return Math.round(heightCm).toString();
  }
  // Imperial: convert to inches
  return Math.round(heightCm / 2.54).toString();
}

// Get weight value based on units preference (whole numbers only)
function getWeightValue(
  weightLbs: number | null | undefined,
  units: string
): string {
  if (!weightLbs) return "";
  if (units === "metric") {
    // Convert lbs to kg
    return Math.round(weightLbs / 2.20462).toString();
  }
  // Imperial: keep as lbs
  return Math.round(weightLbs).toString();
}

export function getDefaultFormValues(initialData: UserProfile) {
  const units = initialData.unitsPreference || "imperial";

  return {
    displayName: initialData.displayName || "",
    dateOfBirth: initialData.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: initialData.gender?.toLowerCase() || "",
    // Height in user's preferred units (cm or inches)
    height: getHeightValue(initialData.heightCm, units),
    // Weights in user's preferred units (kg or lbs)
    currentWeight: getWeightValue(initialData.currentWeightLbs, units),
    targetWeight: getWeightValue(initialData.targetWeightLbs, units),
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
  avatarKey: string | null,
  unitsPreference: string = "imperial"
): UpdateUserProfileInput {
  const toEnumValue = <T extends string>(
    value: string | undefined,
    validValues: readonly T[]
  ): T | undefined => {
    if (!value || value === "") return undefined;
    return validValues.includes(value as T) ? (value as T) : undefined;
  };

  // Convert height to inches for storage (API expects inches)
  let heightInches: number | undefined;
  if (formValues.height) {
    const heightValue = parseFloat(formValues.height);
    if (unitsPreference === "metric") {
      // Form value is in cm, convert to inches
      heightInches = heightValue / 2.54;
    } else {
      // Form value is already in inches
      heightInches = heightValue;
    }
  }

  // Convert weights to lbs for storage (API expects lbs)
  let currentWeightLbs: number | undefined;
  let targetWeightLbs: number | undefined;

  if (formValues.currentWeight) {
    const weightValue = parseFloat(formValues.currentWeight);
    if (unitsPreference === "metric") {
      // Form value is in kg, convert to lbs
      currentWeightLbs = weightValue * 2.20462;
    } else {
      // Form value is already in lbs
      currentWeightLbs = weightValue;
    }
  }

  if (formValues.targetWeight) {
    const weightValue = parseFloat(formValues.targetWeight);
    if (unitsPreference === "metric") {
      // Form value is in kg, convert to lbs
      targetWeightLbs = weightValue * 2.20462;
    } else {
      // Form value is already in lbs
      targetWeightLbs = weightValue;
    }
  }

  return {
    displayName: formValues.displayName || undefined,
    avatarKey: avatarKey || undefined,
    timezone: formValues.timezone || undefined,
    dateOfBirth: formValues.dateOfBirth || undefined,
    gender: toEnumValue(formValues.gender, [
      "male",
      "female",
      "other",
    ] as const),
    heightInches,
    currentWeightLbs,
    targetWeightLbs,
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

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Avatar must be a JPG, PNG, or WebP image";
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
