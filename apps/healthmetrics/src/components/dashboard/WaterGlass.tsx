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
        "flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300",
        "hover:bg-accent/10 active:scale-95",
        filled ? "text-accent" : "text-muted-foreground"
      )}
      aria-label={`Glass ${index + 1} ${filled ? "filled" : "empty"}`}
    >
      <GlassWater
        className={cn(
          "w-8 h-8 transition-all duration-300",
          filled && "fill-accent/20"
        )}
        strokeWidth={filled ? 2.5 : 2}
      />
    </button>
  );
}
