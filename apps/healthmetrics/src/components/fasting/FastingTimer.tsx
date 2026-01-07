import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dot } from "lucide-react";
import { FastingProgress } from "./FastingProgress";
import { formatFastingTimer } from "@/constants";
import type { ActiveFast } from "@/types";

interface FastingTimerProps {
  activeFast: ActiveFast;
}

export function FastingTimer({ activeFast }: FastingTimerProps) {
  const { session, protocol, isPaused } = activeFast;

  // Local state for real-time timer updates
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Calculate initial elapsed seconds
  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date();
      const startTime = new Date(session.startTime);
      let elapsedMs = now.getTime() - startTime.getTime();

      // Subtract paused time
      if (session.pausedAt) {
        const pausedMs = now.getTime() - new Date(session.pausedAt).getTime();
        elapsedMs -= pausedMs;
      }
      elapsedMs -= session.totalPausedMin * 60 * 1000;

      return Math.max(0, Math.floor(elapsedMs / 1000));
    };

    setElapsedSeconds(calculateElapsed());

    // Update every second if not paused
    if (!isPaused) {
      const interval = setInterval(() => {
        setElapsedSeconds(calculateElapsed());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session, isPaused]);

  // Calculate derived values
  const targetSeconds = session.targetDurationMin * 60;
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const percentComplete = Math.min(100, (elapsedSeconds / targetSeconds) * 100);
  const isCompleting = percentComplete >= 90 && !isPaused;

  // Calculate estimated end time
  const estimatedEndTime = new Date(
    new Date(session.startTime).getTime() +
      session.targetDurationMin * 60 * 1000 +
      session.totalPausedMin * 60 * 1000
  );

  return (
    <div className="fasting-timer-card">
      <FastingProgress
        percentComplete={percentComplete}
        isPaused={isPaused}
        isCompleting={isCompleting}
      >
        <div className="fasting-timer">
          <span className="fasting-timer-label">
            {isPaused ? "Paused" : "Elapsed"}
          </span>
          <span className="fasting-timer-elapsed">
            {formatFastingTimer(elapsedSeconds)}
          </span>

          {remainingSeconds > 0 && (
            <>
              <span className="fasting-timer-label">Remaining</span>
              <span className="fasting-timer-remaining">
                {formatFastingTimer(remainingSeconds)}
              </span>
            </>
          )}

          {remainingSeconds === 0 && (
            <span className="fasting-timer-remaining fasting-state-completing">
              Goal reached!
            </span>
          )}
        </div>
      </FastingProgress>

      <div className="fasting-timer-protocol">
        <span>Protocol:</span>
        <span className="fasting-timer-protocol-name">{protocol.name}</span>
        <Dot className="fasting-timer-separator" />
        <span>Target: {session.targetDurationMin / 60}h</span>
      </div>

      <div className="fasting-timer-end-time">
        Est. completion: {format(estimatedEndTime, "h:mm a")}
      </div>
    </div>
  );
}
