/**
 * Time formatting utilities
 */

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
