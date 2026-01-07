import { useState } from "react";
import { Calendar, Star, Clock, Trash2, Edit2, Moon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSleepHistory } from "@/hooks";
import { deleteSleepEntry } from "@/server";
import { LogSleepDialog } from "./LogSleepDialog";

interface SleepLogTableProps {
  userId: string;
}

interface EditingEntry {
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: number;
  notes: string;
}

export function SleepLogTable({ userId }: SleepLogTableProps) {
  const { data: history, isLoading, refetch } = useSleepHistory(userId, 30);
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = async (date: string) => {
    if (!confirm("Are you sure you want to delete this sleep entry?")) return;

    await deleteSleepEntry({ data: { userId, date } });
    refetch();
  };

  const handleEdit = (entry: {
    date: string;
    bedtime: string;
    wakeTime: string;
    quality: number;
  }) => {
    setEditingEntry({
      date: entry.date,
      bedtime: entry.bedtime,
      wakeTime: entry.wakeTime,
      quality: entry.quality,
      notes: "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditingEntry(null);
    setEditDialogOpen(false);
    refetch();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === yesterday.getTime()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getQualityStars = (quality: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < quality ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
        />
      ));
  };

  const getHoursClass = (hours: number) => {
    if (hours >= 7 && hours <= 9) return "text-emerald-400";
    if (hours >= 6 || hours <= 10) return "text-amber-400";
    return "text-rose-400";
  };

  if (isLoading) {
    return (
      <Card variant="supporting" className="sleep-table-card">
        <CardContent className="sleep-table-loading">
          <div className="sleep-loading-spinner" />
          <span>Loading sleep history...</span>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card variant="supporting" className="sleep-table-card">
        <CardContent className="sleep-table-empty">
          <Calendar className="w-12 h-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300">
            No Sleep Logged Yet
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Start tracking your sleep to see your history here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card variant="supporting" className="sleep-table-card">
        <CardContent className="sleep-table-content">
          <h3 className="sleep-table-title">
            <Calendar className="w-5 h-5" style={{ color: "var(--accent)" }} />
            Sleep History
          </h3>

          <div className="sleep-list">
            {history.map((entry) => (
              <div key={entry.date} className="sleep-list-item">
                {/* Date */}
                <div className="sleep-list-date">
                  <Moon
                    className="w-4 h-4"
                    style={{ color: "var(--accent)" }}
                  />
                  <span>{formatDate(entry.date)}</span>
                </div>

                {/* Times */}
                <div className="sleep-list-times">
                  <div className="sleep-list-time">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="sleep-list-time-label">Bed</span>
                    <span>{formatTime(entry.bedtime)}</span>
                  </div>
                  <div className="sleep-list-time">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="sleep-list-time-label">Wake</span>
                    <span>{formatTime(entry.wakeTime)}</span>
                  </div>
                </div>

                {/* Hours */}
                <div
                  className={`sleep-list-hours ${getHoursClass(entry.hoursSlept)}`}
                >
                  {entry.hoursSlept.toFixed(1)}h
                </div>

                {/* Quality */}
                <div className="sleep-list-quality">
                  {getQualityStars(entry.quality)}
                </div>

                {/* Actions */}
                <div className="sleep-list-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="sleep-action-edit"
                    onClick={() => handleEdit(entry)}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="sleep-action-delete"
                    onClick={() => handleDelete(entry.date)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingEntry && (
        <LogSleepDialog
          userId={userId}
          date={editingEntry.date}
          initialData={{
            bedtime: editingEntry.bedtime,
            wakeTime: editingEntry.wakeTime,
            quality: editingEntry.quality,
            notes: editingEntry.notes,
          }}
          isEdit
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
          trigger={null}
        />
      )}
    </>
  );
}
