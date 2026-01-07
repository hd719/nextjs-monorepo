import { FASTING_PROGRESS_RING } from "@/constants";
import { cn } from "@/utils";

interface FastingProgressProps {
  percentComplete: number;
  isPaused?: boolean;
  isCompleting?: boolean;
  children?: React.ReactNode;
}

/**
 * Circular progress ring for fasting timer
 * Shows visual progress toward fasting goal
 */
export function FastingProgress({
  percentComplete,
  isPaused = false,
  isCompleting = false,
  children,
}: FastingProgressProps) {
  const { size, strokeWidth, radius, circumference } = FASTING_PROGRESS_RING;

  // Calculate stroke-dashoffset for progress
  const progress = Math.min(100, Math.max(0, percentComplete));
  const offset = circumference - (progress / 100) * circumference;

  // Determine fill color based on state
  const fillClass = cn(
    "fasting-progress-ring-fill",
    isPaused && "fasting-progress-ring-fill-paused",
    isCompleting && "fasting-progress-ring-fill-completing",
    !isPaused && !isCompleting && "fasting-progress-ring-fill-active"
  );

  return (
    <div className="fasting-progress" style={{ width: size, height: size }}>
      <svg
        className="fasting-progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          className="fasting-progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className={fillClass}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      {/* Center content */}
      <div className="fasting-progress-center">{children}</div>
    </div>
  );
}
