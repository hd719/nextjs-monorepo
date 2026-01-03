import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  // Color-coded based on percentage
  const getFillClass = () => {
    if (percentage > 100) return "progress-bar-fill-over-limit"; // Red: over limit
    if (percentage >= 90) return "progress-bar-fill-warning"; // Amber: approaching limit
    return "progress-bar-fill-on-track"; // Green: on track
  };

  return (
    <div className={cn("progress-bar-container", className)}>
      {label && (
        <div className="progress-bar-label-row">
          <span className="progress-bar-label">{label}</span>
          <span className="progress-bar-percentage">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className={cn("progress-bar-fill", getFillClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
