/**
 * Time formatting utilities
 */

/**
 * Resolve the timezone to use for date math.
 * Prefer a user-set timezone; otherwise fall back to the browser timezone.
 */
export function resolveTimezone(preferred?: string | null): string {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (
    preferred &&
    preferred !== "UTC" &&
    preferred !== "Etc/UTC"
  ) {
    return preferred;
  }

  return browserTimezone || "UTC";
}

/**
 * Format a date key (YYYY-MM-DD) in the given timezone.
 */
export function formatDateKey(date: Date, timezone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone: timezone });
}

export function formatDuration(minutes: number): string {
  if (minutes < 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Format duration with full words
 */
export function formatDurationLong(minutes: number): string {
  if (minutes < 0) return "0 minutes";

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  const hourPart =
    hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "";
  const minPart =
    mins > 0 ? `${mins} ${mins === 1 ? "minute" : "minutes"}` : "";

  if (hourPart && minPart) {
    return `${hourPart} ${minPart}`;
  }

  return hourPart || minPart || "0 minutes";
}
