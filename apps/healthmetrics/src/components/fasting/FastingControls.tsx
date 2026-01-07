import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogAction,
  DialogCancel,
} from "@/components/ui/dialog";
import { Play, Pause, Square, X, Loader2 } from "lucide-react";
import {
  useEndFast,
  useCancelFast,
  usePauseFast,
  useResumeFast,
} from "@/hooks";
import type { ActiveFast } from "@/types";

interface FastingControlsProps {
  activeFast: ActiveFast;
  userId: string;
}

export function FastingControls({ activeFast, userId }: FastingControlsProps) {
  const { session, isPaused } = activeFast;

  const endFast = useEndFast();
  const cancelFast = useCancelFast();
  const pauseFast = usePauseFast();
  const resumeFast = useResumeFast();

  const isLoading =
    endFast.isPending ||
    cancelFast.isPending ||
    pauseFast.isPending ||
    resumeFast.isPending;

  const handleEnd = () => {
    endFast.mutate({
      userId,
      sessionId: session.id,
    });
  };

  const handleCancel = () => {
    cancelFast.mutate({
      userId,
      sessionId: session.id,
    });
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeFast.mutate({
        userId,
        sessionId: session.id,
      });
    } else {
      pauseFast.mutate({
        userId,
        sessionId: session.id,
      });
    }
  };

  return (
    <div className="fasting-controls">
      {/* End Fast Button */}
      <Button
        size="lg"
        onClick={handleEnd}
        disabled={isLoading}
        className="fasting-controls-primary"
      >
        {endFast.isPending ? (
          <Loader2 className="fasting-btn-icon-spin" />
        ) : (
          <Square className="fasting-btn-icon" />
        )}
        End Fast
      </Button>

      {/* Pause/Resume Button */}
      <Button
        size="lg"
        variant="outline"
        onClick={handlePauseResume}
        disabled={isLoading}
      >
        {pauseFast.isPending || resumeFast.isPending ? (
          <Loader2 className="fasting-btn-icon-spin" />
        ) : isPaused ? (
          <Play className="fasting-btn-icon" />
        ) : (
          <Pause className="fasting-btn-icon" />
        )}
        {isPaused ? "Resume" : "Pause"}
      </Button>

      {/* Cancel Button with Confirmation Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" variant="ghost" disabled={isLoading}>
            {cancelFast.isPending ? (
              <Loader2 className="fasting-btn-icon-only-spin" />
            ) : (
              <X className="fasting-btn-icon-only" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Fast</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this fast? This action cannot be
              undone and your progress will not be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogCancel>Keep Fasting</DialogCancel>
            <DialogAction onClick={handleCancel}>Cancel Fast</DialogAction>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
