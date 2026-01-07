/**
 * Fasting Constants
 *
 * Preset protocols, defaults, and configuration for fasting timer.
 * Exported from constants/index.ts barrel.
 */

import type { FastingProtocolOption } from "@/types";

// ============================================================================
// PRESET PROTOCOLS
// ============================================================================

/**
 * Preset fasting protocols
 * These are seeded into the database with isPreset=true
 */
export const FASTING_PRESET_PROTOCOLS: FastingProtocolOption[] = [
  {
    id: "preset-16-8",
    name: "16:8",
    fastingMinutes: 960, // 16 hours
    eatingMinutes: 480, // 8 hours
    isPreset: true,
    description: "16 hours fasting, 8 hours eating",
  },
  {
    id: "preset-18-6",
    name: "18:6",
    fastingMinutes: 1080, // 18 hours
    eatingMinutes: 360, // 6 hours
    isPreset: true,
    description: "18 hours fasting, 6 hours eating",
  },
  {
    id: "preset-20-4",
    name: "20:4",
    fastingMinutes: 1200, // 20 hours
    eatingMinutes: 240, // 4 hours
    isPreset: true,
    description: "20 hours fasting, 4 hours eating",
  },
  {
    id: "preset-omad",
    name: "OMAD",
    fastingMinutes: 1380, // 23 hours
    eatingMinutes: 60, // 1 hour
    isPreset: true,
    description: "One Meal A Day (23:1)",
  },
];

/**
 * Default protocol (16:8)
 */
export const DEFAULT_FASTING_PROTOCOL = FASTING_PRESET_PROTOCOLS[0];

// ============================================================================
// TIMER SETTINGS
// ============================================================================

/**
 * Timer update interval in milliseconds
 */
export const FASTING_TIMER_INTERVAL_MS = 1000;

/**
 * Minimum fast duration to count as completed (in minutes)
 */
export const FASTING_MIN_DURATION_MIN = 1;

/**
 * Default weekly fasting goal
 */
export const DEFAULT_FASTING_GOAL_PER_WEEK = 7;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

/**
 * Progress ring SVG settings
 */
export const FASTING_PROGRESS_RING = {
  size: 240,
  strokeWidth: 12,
  radius: 108, // (size - strokeWidth * 2) / 2
  circumference: 678.58, // 2 * PI * radius
} as const;

/**
 * Status colors (CSS variable names)
 */
export const FASTING_STATUS_COLORS = {
  active: "--success",
  paused: "--warning",
  completing: "--accent",
  completed: "--primary",
  cancelled: "--muted-foreground",
} as const;

// ============================================================================
// HISTORY & STATS
// ============================================================================

/**
 * Default history page size
 */
export const FASTING_HISTORY_PAGE_SIZE = 10;

/**
 * Days to look back for streak calculation
 */
export const FASTING_STREAK_LOOKBACK_DAYS = 365;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format duration in minutes to HH:MM:SS string
 */
export function formatFastingDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Format seconds to HH:MM:SS display
 */
export function formatFastingTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
}

/**
 * Get protocol display name with duration
 */
export function getProtocolDisplayName(
  name: string,
  fastingMinutes: number
): string {
  const hours = Math.floor(fastingMinutes / 60);
  return `${name} (${hours}h fast)`;
}
