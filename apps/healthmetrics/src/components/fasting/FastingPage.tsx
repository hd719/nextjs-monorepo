import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, Play } from "lucide-react";
import { useActiveFast } from "@/hooks";
import { FastingTimer } from "./FastingTimer";
import { FastingControls } from "./FastingControls";
import { FastingProtocolSelector } from "./FastingProtocolSelector";
import { FastingStatsCard } from "./FastingStatsCard";
import { FastingHistory } from "./FastingHistory";
import { FastingCalendar } from "./FastingCalendar";

interface FastingPageProps {
  userId: string;
}

export function FastingPage({ userId }: FastingPageProps) {
  const [showProtocolSelector, setShowProtocolSelector] = useState(false);

  const { data: activeFast, isLoading } = useActiveFast(userId);

  return (
    <div className="fasting-page">
      {/* Page Header */}
      <div className="fasting-page-header">
        <div>
          <h1 className="fasting-page-title">Fasting Timer</h1>
          <p className="fasting-page-subtitle">
            Track your intermittent fasting journey
          </p>
        </div>
      </div>

      {/* Timer Card */}
      <Card variant="hero">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            {activeFast ? "Current Fast" : "Start Fasting"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <FastingTimerSkeleton />
          ) : activeFast ? (
            <div className="fasting-timer-card-content">
              <FastingTimer activeFast={activeFast} />
              <FastingControls activeFast={activeFast} userId={userId} />
            </div>
          ) : (
            <FastingIdleState onStart={() => setShowProtocolSelector(true)} />
          )}
        </CardContent>
      </Card>

      {/* Stats and Calendar Row */}
      <div className="fasting-page-row">
        <FastingStatsCard userId={userId} />
        <FastingCalendar userId={userId} />
      </div>

      {/* History */}
      <FastingHistory userId={userId} />

      {/* Protocol Selector Dialog */}
      <FastingProtocolSelector
        userId={userId}
        open={showProtocolSelector}
        onOpenChange={setShowProtocolSelector}
      />
    </div>
  );
}

interface FastingIdleStateProps {
  onStart: () => void;
}

function FastingIdleState({ onStart }: FastingIdleStateProps) {
  return (
    <div className="fasting-idle">
      <div className="fasting-idle-icon">
        <Timer className="fasting-idle-icon-inner" />
      </div>

      <div className="fasting-idle-text">
        <h3 className="fasting-idle-title">Ready to fast?</h3>
        <p className="fasting-idle-description">
          Start tracking your intermittent fasting session
        </p>
      </div>

      <Button size="lg" onClick={onStart}>
        <Play className="mr-2 h-4 w-4" />
        Start Fast
      </Button>
    </div>
  );
}

function FastingTimerSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <Skeleton className="h-60 w-60 rounded-full" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
