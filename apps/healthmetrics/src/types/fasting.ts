// ============================================================================
// ENUMS & STATUS
// ============================================================================

export type FastingStatus = "active" | "paused" | "completed" | "cancelled";

// ============================================================================
// PROTOCOL TYPES
// ============================================================================

/**
 * Fasting protocol definition
 * Represents a fasting schedule (e.g., 16:8, 18:6)
 */
export interface FastingProtocol {
  id: string;
  userId: string | null; // null = system preset
  name: string;
  fastingMinutes: number;
  eatingMinutes: number;
  isPreset: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Simplified protocol for display
 */
export interface FastingProtocolOption {
  id: string;
  name: string;
  fastingMinutes: number;
  eatingMinutes: number;
  isPreset: boolean;
  description?: string;
}

// ============================================================================
// SESSION TYPES
// ============================================================================

/**
 * Fasting session from database
 */
export interface FastingSession {
  id: string;
  userId: string;
  protocolId: string;
  startTime: Date;
  endTime: Date | null;
  targetDurationMin: number;
  actualDurationMin: number | null;
  pausedAt: Date | null;
  totalPausedMin: number;
  status: FastingStatus;
  completedAtTarget: boolean | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Joined data
  protocol?: FastingProtocol;
}

/**
 * Active fast with computed timer values
 */
export interface ActiveFast {
  session: FastingSession;
  protocol: FastingProtocol;
  elapsedMinutes: number;
  remainingMinutes: number;
  percentComplete: number;
  estimatedEndTime: Date;
  isPaused: boolean;
}

// ============================================================================
// STATS & HISTORY TYPES
// ============================================================================

/**
 * Fasting statistics summary
 */
export interface FastingStats {
  // Streak data
  currentStreak: number;
  longestStreak: number;
  // This week
  fastsThisWeek: number;
  weeklyGoal: number | null;
  // Totals
  totalFasts: number;
  totalFastingMinutes: number;
  averageFastDuration: number;
  completionRate: number; // percentage
  // Recent
  lastFastDate: Date | null;
  lastFastDuration: number | null;
}

/**
 * Fasting history entry for list display
 */
export interface FastingHistoryEntry {
  id: string;
  date: Date;
  protocolName: string;
  targetDurationMin: number;
  actualDurationMin: number | null;
  status: FastingStatus;
  completedAtTarget: boolean;
}

/**
 * Calendar day data for fasting calendar view
 */
export interface FastingCalendarDay {
  date: string;
  hasFast: boolean;
  status?: FastingStatus;
  durationMin?: number;
  completedAtTarget?: boolean;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Input for starting a new fast
 */
export interface StartFastInput {
  userId: string;
  protocolId: string;
  startTime?: Date; // defaults to now
}

/**
 * Input for ending a fast
 */
export interface EndFastInput {
  userId: string;
  sessionId: string;
  endTime?: Date; // defaults to now
  notes?: string;
}

/**
 * Input for creating custom protocol
 */
export interface CreateProtocolInput {
  userId: string;
  name: string;
  fastingMinutes: number;
  eatingMinutes: number;
}

/**
 * Input for updating fasting preferences
 */
export interface UpdateFastingPreferencesInput {
  userId: string;
  defaultProtocolId?: string;
  goalPerWeek?: number;
}

// ============================================================================
// TIMER STATE (Client-side)
// ============================================================================

/**
 * Client-side timer state for real-time display
 */
export interface FastingTimerState {
  isActive: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  remainingSeconds: number;
  percentComplete: number;
  phase: "fasting" | "eating" | "idle";
}

/**
 * Timer display values (formatted)
 */
export interface FastingTimerDisplay {
  elapsed: string;
  remaining: string;
  percentComplete: number;
  estimatedEnd: string;
}
