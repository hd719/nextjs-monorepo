/**
 * Sleep-related utility functions
 */

import type { SleepData, SleepCardData } from "@/types";

/**
 * Transform SleepData from the API into SleepCardData for the dashboard
 * Handles null values and the hasEntry flag
 */
export function toSleepCardData(
  data: SleepData | null | undefined
): SleepCardData | null {
  if (!data || !data.hasEntry) {
    return null;
  }

  return {
    hoursSlept: Number(data.hoursSlept ?? 0),
    quality: data.quality ?? 0,
    bedtime: data.bedtime ?? "",
    wakeTime: data.wakeTime ?? "",
    hasEntry: true,
  };
}
