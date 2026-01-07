// Centralized constants exports

// Defaults
export {
  DEFAULT_NUTRITION_GOALS,
  DEFAULT_WATER_GOAL,
  MEAL_TYPES,
  type MealType,
  DEFAULT_TIMEZONE,
  DEFAULT_UNITS_PREFERENCE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SEARCH_LIMIT,
  DEFAULT_ACTIVITY_LIMIT,
  DATE_FORMAT_DISPLAY,
  DATE_FORMAT_API,
} from "./defaults";

// Error messages
export { AUTH_ERRORS } from "./errors";

// Onboarding
export {
  ONBOARDING_TOTAL_STEPS,
  ONBOARDING_CONTENT_STEPS,
  GOAL_OPTIONS,
  ACTIVITY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  ACTIVITY_MULTIPLIERS,
  GOAL_CALORIE_ADJUSTMENTS,
  GOAL_MACRO_RATIOS,
  ONBOARDING_DEFAULTS,
  ONBOARDING_LIMITS,
} from "./onboarding";

// Progress
export { DATE_RANGE_OPTIONS } from "./progress";

// Routes
export { ROUTES, buildDiaryRoute } from "./routes";

// Fasting
export {
  FASTING_PRESET_PROTOCOLS,
  DEFAULT_FASTING_PROTOCOL,
  FASTING_TIMER_INTERVAL_MS,
  FASTING_MIN_DURATION_MIN,
  DEFAULT_FASTING_GOAL_PER_WEEK,
  FASTING_PROGRESS_RING,
  FASTING_STATUS_COLORS,
  FASTING_HISTORY_PAGE_SIZE,
  FASTING_STREAK_LOOKBACK_DAYS,
  formatFastingDuration,
  formatFastingTimer,
  getProtocolDisplayName,
} from "./fasting";

// Environment URLs (single source of truth for dev URLs)
export const DEFAULT_DEV_URL = "http://localhost:3003";
