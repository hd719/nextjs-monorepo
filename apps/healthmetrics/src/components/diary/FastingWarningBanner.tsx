import { useNavigate } from "@tanstack/react-router";
import { Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveFast } from "@/hooks";
import { ROUTES } from "@/constants";
import { formatDuration } from "@/utils";
import type { ActiveFast } from "@/types";

export interface FastingWarningBannerProps {
  userId: string;
}

/**
 * Calculates time remaining in an active fast
 */
function calculateTimeRemaining(activeFast: ActiveFast): {
  elapsedMinutes: number;
  remainingMinutes: number;
  percentage: number;
} {
  const now = new Date();
  const startTime = new Date(activeFast.session.startTime);
  const pausedMs = activeFast.session.totalPausedMin * 60 * 1000;

  let elapsedMs = now.getTime() - startTime.getTime() - pausedMs;
  if (activeFast.isPaused && activeFast.session.pausedAt) {
    // If currently paused, don't count time since pause
    const pausedSince = new Date(activeFast.session.pausedAt).getTime();
    elapsedMs = pausedSince - startTime.getTime() - pausedMs;
  }

  const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / (1000 * 60)));
  const remainingMinutes = Math.max(
    0,
    activeFast.session.targetDurationMin - elapsedMinutes
  );
  const percentage = Math.min(
    100,
    (elapsedMinutes / activeFast.session.targetDurationMin) * 100
  );

  return { elapsedMinutes, remainingMinutes, percentage };
}

/**
 * Banner shown on diary page when user has an active fast
 * Warns them that eating will break their fast
 */
export function FastingWarningBanner({ userId }: FastingWarningBannerProps) {
  const navigate = useNavigate();
  const { data: activeFast, isLoading } = useActiveFast(userId);

  // Don't show anything while loading or if no active fast
  if (isLoading || !activeFast || !activeFast.session) {
    return null;
  }

  const { remainingMinutes, percentage } = calculateTimeRemaining(activeFast);
  const protocolName = activeFast.protocol?.name || "Custom";
  const isPaused = activeFast.isPaused;

  // If fast is almost complete (>95%), show encouraging message
  const isAlmostDone = percentage >= 95;

  const handleViewFast = () => {
    navigate({ to: ROUTES.FASTING });
  };

  return (
    <div
      className={`diary-fasting-banner ${isAlmostDone ? "diary-fasting-banner-success" : ""}`}
    >
      <div className="diary-fasting-banner-icon">
        {isAlmostDone ? (
          <Clock className="diary-fasting-banner-icon-svg" />
        ) : (
          <AlertTriangle className="diary-fasting-banner-icon-svg" />
        )}
      </div>

      <div className="diary-fasting-banner-content">
        <div className="diary-fasting-banner-title">
          {isAlmostDone
            ? "Almost there!"
            : isPaused
              ? "Fast Paused"
              : "You're Currently Fasting"}
        </div>
        <div className="diary-fasting-banner-details">
          <span className="diary-fasting-banner-protocol">{protocolName}</span>
          <span className="diary-fasting-banner-separator">•</span>
          <span className="diary-fasting-banner-time">
            {isAlmostDone
              ? `Only ${formatDuration(remainingMinutes)} left!`
              : `${formatDuration(remainingMinutes)} remaining`}
          </span>
        </div>
        {!isAlmostDone && !isPaused && (
          <p className="diary-fasting-banner-warning">
            Logging food will break your fast
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleViewFast}
        className="diary-fasting-banner-action"
      >
        View Fast
        <ChevronRight className="diary-fasting-banner-action-icon" />
      </Button>
    </div>
  );
}
