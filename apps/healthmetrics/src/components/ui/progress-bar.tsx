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
  const getColorClass = () => {
    if (percentage > 100) return "bg-destructive"; // Red: over limit
    if (percentage >= 90) return "bg-warning"; // Amber: approaching limit
    return "bg-accent"; // Green: on track
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            getColorClass()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
