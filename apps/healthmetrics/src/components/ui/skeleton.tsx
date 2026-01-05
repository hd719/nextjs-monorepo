import { cn } from "@/utils/cn";

export interface SkeletonProps {
  className?: string;
  /** Variant to match visual hierarchy */
  variant?: "default" | "hero" | "supporting";
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton",
        variant === "hero" && "skeleton-hero",
        variant === "supporting" && "skeleton-supporting",
        className
      )}
      aria-busy="true"
      aria-label="Loading..."
    />
  );
}
