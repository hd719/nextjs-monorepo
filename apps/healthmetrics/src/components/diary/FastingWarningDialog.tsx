import { Loader2, AlertTriangle, Clock, Utensils } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEndFast } from "@/hooks";
import { formatDuration } from "@/utils";
import type { ActiveFast } from "@/types";

export interface FastingWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeFast: ActiveFast;
  userId: string;
  /** Called when user chooses to end fast and proceed with logging */
  onEndFastAndLog: () => void;
  /** Called when user chooses to log food anyway without ending fast */
  onLogAnyway: () => void;
  /** Called when user cancels the action */
  onCancel: () => void;
}

/**
 * Dialog shown when user tries to add food while actively fasting
 * Offers three options: End Fast & Log, Log Anyway, or Cancel
 */
export function FastingWarningDialog({
  open,
  onOpenChange,
  activeFast,
  userId,
  onEndFastAndLog,
  onLogAnyway,
  onCancel,
}: FastingWarningDialogProps) {
  const endFast = useEndFast();
  const isEnding = endFast.isPending;

  // Calculate elapsed time
  const now = new Date();
  const startTime = new Date(activeFast.session.startTime);
  const pausedMs = activeFast.session.totalPausedMin * 60 * 1000;
  const elapsedMs = now.getTime() - startTime.getTime() - pausedMs;
  const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / (1000 * 60)));
  const remainingMinutes = Math.max(
    0,
    activeFast.session.targetDurationMin - elapsedMinutes
  );

  const protocolName = activeFast.protocol?.name || "Custom Fast";
  const percentage = Math.round(
    (elapsedMinutes / activeFast.session.targetDurationMin) * 100
  );

  const handleEndFastAndLog = async () => {
    try {
      await endFast.mutateAsync({
        userId,
        sessionId: activeFast.session.id,
      });
      onEndFastAndLog();
    } catch (error) {
      console.error("Failed to end fast:", error);
    }
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fasting-warning-dialog">
        <DialogHeader>
          <div className="fasting-warning-dialog-icon-wrapper">
            <AlertTriangle className="fasting-warning-dialog-icon" />
          </div>
          <DialogTitle className="fasting-warning-dialog-title">
            You&apos;re Currently Fasting
          </DialogTitle>
          <DialogDescription className="fasting-warning-dialog-description">
            Adding food to your diary means you&apos;re ending your eating window.
          </DialogDescription>
        </DialogHeader>

        {/* Fast Status Card */}
        <div className="fasting-warning-status-card">
          <div className="fasting-warning-status-header">
            <Clock className="fasting-warning-status-icon" />
            <span className="fasting-warning-status-protocol">
              {protocolName}
            </span>
          </div>
          <div className="fasting-warning-status-progress">
            <div className="fasting-warning-progress-bar">
              <div
                className="fasting-warning-progress-fill"
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
            <span className="fasting-warning-progress-text">
              {percentage}% complete
            </span>
          </div>
          <div className="fasting-warning-status-times">
            <div className="fasting-warning-time-item">
              <span className="fasting-warning-time-label">Elapsed</span>
              <span className="fasting-warning-time-value">
                {formatDuration(elapsedMinutes)}
              </span>
            </div>
            <div className="fasting-warning-time-item">
              <span className="fasting-warning-time-label">Remaining</span>
              <span className="fasting-warning-time-value">
                {formatDuration(remainingMinutes)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="fasting-warning-dialog-footer">
          {/* Primary: End Fast & Log */}
          <Button
            onClick={handleEndFastAndLog}
            disabled={isEnding}
            className="fasting-warning-btn-end"
          >
            {isEnding ? (
              <Loader2 className="fasting-warning-btn-icon-spin" />
            ) : (
              <Utensils className="fasting-warning-btn-icon" />
            )}
            End Fast & Log Food
          </Button>

          {/* Secondary: Log Anyway (without ending fast - for tracking purposes) */}
          <Button
            variant="outline"
            onClick={onLogAnyway}
            disabled={isEnding}
            className="fasting-warning-btn-log"
          >
            Log Anyway
          </Button>

          {/* Tertiary: Cancel */}
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isEnding}
            className="fasting-warning-btn-cancel"
          >
            Keep Fasting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
