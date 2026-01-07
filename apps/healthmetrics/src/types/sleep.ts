// Sleep tracking types

/**
 * Data shape for the dashboard SleepCard component
 */
export interface SleepCardData {
  hoursSlept: number;
  quality: number;
  bedtime: string;
  wakeTime: string;
  hasEntry: boolean;
}

export interface SleepEntry {
  id?: string;
  userId: string;
  date: string;
  hoursSlept: number;
  quality: number; // 1-5 rating (required)
  bedtime: string; // HH:MM format (required)
  wakeTime: string; // HH:MM format (required)
  notes?: string;
}

export interface SleepData {
  hoursSlept: number | null;
  quality: number | null;
  bedtime: string | null;
  wakeTime: string | null;
  date: string;
  hasEntry: boolean;
}

export interface SaveSleepInput {
  userId: string;
  date: string;
  hoursSlept: number;
  quality: number;
  bedtime: string;
  wakeTime: string;
  notes?: string;
}

export interface SleepHistoryEntry {
  date: string;
  hoursSlept: number;
  quality: number;
  bedtime: string;
  wakeTime: string;
}

export const DEFAULT_SLEEP_GOAL = 8;
