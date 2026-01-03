import { GlassWater } from "lucide-react";
import { cn } from "@/lib/utils";

interface WaterGlassProps {
  filled: boolean;
  onClick: () => void;
  index: number;
}

export function WaterGlass({ filled, onClick, index }: WaterGlassProps) {
  return (
    <button
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
