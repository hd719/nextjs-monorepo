import { useEffect, useState } from "react";
import { GlassWater } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

interface WaterGlassProps {
  filled: boolean;
  onClick: () => void;
  index: number;
}

export function WaterGlass({ filled, onClick, index }: WaterGlassProps) {
  const isMockDashboard = import.meta.env.VITE_USE_MOCK_DASHBOARD === "true";
  const [isLoading, setIsLoading] = useState(isMockDashboard);

  useEffect(() => {
    if (!isMockDashboard) {
      setIsLoading(false);
      return;
    }

    const timeout = setTimeout(
      () => {
        setIsLoading(false);
      },
      250 + index * 50
    );

    return () => clearTimeout(timeout);
  }, [index, isMockDashboard]);

  if (isLoading) {
    return (
      <button
        type="button"
        className="dashboard-water-glass-button"
        aria-label={`Glass ${index + 1} loading`}
        aria-busy="true"
        disabled
      >
        <Skeleton className="skeleton-avatar-sm" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "dashboard-water-glass-button",
        filled
          ? "dashboard-water-glass-button-filled"
          : "dashboard-water-glass-button-empty"
      )}
      aria-label={`Glass ${index + 1} ${filled ? "filled" : "empty"}`}
    >
      <GlassWater
        className={cn(
          "dashboard-water-glass-icon",
          filled && "dashboard-water-glass-icon-filled"
        )}
        strokeWidth={filled ? 2.5 : 2}
      />
    </button>
  );
}
