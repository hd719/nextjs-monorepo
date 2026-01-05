import type { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import { cn } from "@/utils/cn";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  framed?: boolean;
  headingLevel?: "h2" | "h3" | "h4";
  variant?: "default" | "error";
  /** Makes the entire card clickable (uses the action's onClick) */
  clickable?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  framed = true,
  headingLevel = "h3",
  variant = "default",
  clickable = false,
}: EmptyStateProps) {
  const HeadingTag = headingLevel;
  const isError = variant === "error";
  const isClickable = clickable && action?.onClick;

  const content = (
    <div
      className={cn(
        "empty-state-container",
        isError && "empty-state-error",
        !framed && className
      )}
      role={isError ? "alert" : undefined}
    >
      <div
        className={cn(
          "empty-state-icon-container",
          isError && "empty-state-icon-error"
        )}
      >
        <Icon className="empty-state-icon" aria-hidden="true" />
      </div>
      <HeadingTag className="empty-state-title">{title}</HeadingTag>
      {description && <p className="empty-state-description">{description}</p>}
      {action && !isClickable && (
        <Button
          onClick={action.onClick}
          variant={isError ? "destructive" : "default"}
          className="focus-ring"
        >
          {action.label}
        </Button>
      )}
      {action && isClickable && (
        <span className="empty-state-clickable-hint">{action.label}</span>
      )}
    </div>
  );

  if (framed) {
    if (isClickable) {
      return (
        <Card
          variant="supporting"
          className={cn(
            "empty-state-card empty-state-card-clickable",
            className
          )}
          onClick={action?.onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              action?.onClick();
            }
          }}
        >
          {content}
        </Card>
      );
    }
    return (
      <Card variant="supporting" className={cn("empty-state-card", className)}>
        {content}
      </Card>
    );
  }

  return content;
}
