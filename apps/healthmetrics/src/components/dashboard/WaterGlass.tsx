import { GlassWater } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./WaterGlass.module.css";

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
        styles.glassButton,
        filled ? styles.glassButtonFilled : styles.glassButtonEmpty
      )}
      aria-label={`Glass ${index + 1} ${filled ? "filled" : "empty"}`}
    >
      <GlassWater
        className={cn(styles.glassIcon, filled && styles.glassIconFilled)}
        strokeWidth={filled ? 2.5 : 2}
      />
    </button>
  );
}
