import { cn } from "@/utils/cn";

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  ariaLabel?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  ariaLabel,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const displayPercentage = Math.round(percentage);

  // Color-coded based on percentage
  const getFillClass = () => {
    if (percentage > 100) return "progress-bar-fill-over-limit"; // Red: over limit
    if (percentage >= 90) return "progress-bar-fill-warning"; // Amber: approaching limit
    return "progress-bar-fill-on-track"; // Green: on track
  };

  // Build accessible label
  const accessibleLabel =
    ariaLabel || label || `Progress: ${displayPercentage}%`;

  return (
    <div className={cn("progress-bar-container", className)}>
      {label && (
        <div className="progress-bar-label-row">
          <span className="progress-bar-label">{label}</span>
          <span className="progress-bar-percentage" aria-hidden="true">
            {displayPercentage}%
          </span>
        </div>
      )}
      <div
        className="progress-bar-track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={accessibleLabel}
      >
        <div
          className={cn("progress-bar-fill", getFillClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
