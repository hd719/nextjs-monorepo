import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Check, X } from "lucide-react";
import { useFastingHistory } from "@/hooks";
import { formatFastingDuration } from "@/constants";
import { cn } from "@/utils";

interface FastingHistoryProps {
  userId: string;
  limit?: number;
}

export function FastingHistory({ userId, limit = 5 }: FastingHistoryProps) {
  const { data: history, isLoading } = useFastingHistory(userId, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Recent Fasts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <FastingHistorySkeleton />
        ) : !history || history.length === 0 ? (
          <div className="fasting-empty">
            <History className="fasting-empty-icon" />
            <p className="fasting-empty-text">No fasting history yet</p>
          </div>
        ) : (
          <div className="fasting-history-list">
            {history.map((entry) => (
              <HistoryItem key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface HistoryItemProps {
  entry: {
    id: string;
    date: Date;
    protocolName: string;
    targetDurationMin: number;
    actualDurationMin: number | null;
    status: string;
    completedAtTarget: boolean;
  };
}

function HistoryItem({ entry }: HistoryItemProps) {
  const dateStr = format(new Date(entry.date), "MMM d");
  const dayStr = format(new Date(entry.date), "EEEE");
  const isToday =
    format(new Date(entry.date), "yyyy-MM-dd") ===
    format(new Date(), "yyyy-MM-dd");

  return (
    <Card variant="supporting">
      <div className="fasting-history-item">
        <div className="fasting-history-item-info">
          <span className="fasting-history-item-date">
            {isToday ? "Today" : dateStr}
            {!isToday && (
              <span className="ml-2 text-muted-foreground">{dayStr}</span>
            )}
          </span>
          <span className="fasting-history-item-protocol">
            {entry.protocolName}
          </span>
        </div>

        <div className="fasting-history-item-result">
          <span className="fasting-history-item-duration">
            {entry.actualDurationMin
              ? formatFastingDuration(entry.actualDurationMin)
              : "--"}
          </span>
          <div
            className={cn(
              "fasting-history-item-status flex items-center justify-end gap-1",
              entry.completedAtTarget
                ? "fasting-history-item-status-complete"
                : "fasting-history-item-status-incomplete"
            )}
          >
            {entry.completedAtTarget ? (
              <>
                <Check className="h-3 w-3" /> Completed
              </>
            ) : (
              <>
                <X className="h-3 w-3" /> Ended Early
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function FastingHistorySkeleton() {
  return (
    <div className="fasting-history-list">
      {[1, 2, 3].map((i) => (
        <Card key={i} variant="supporting">
          <div className="fasting-history-item">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-3 w-20 ml-auto" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
