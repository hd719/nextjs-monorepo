import { cn } from "@/lib/utils";
import styles from "./progress-bar.module.css";

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
    if (percentage > 100) return styles.fillOverLimit; // Red: over limit
    if (percentage >= 90) return styles.fillWarning; // Amber: approaching limit
    return styles.fillOnTrack; // Green: on track
  };

  return (
    <div className={cn(styles.container, className)}>
      {label && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
          <span className={styles.percentage}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={styles.track}>
        <div
          className={cn(styles.fill, getFillClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
