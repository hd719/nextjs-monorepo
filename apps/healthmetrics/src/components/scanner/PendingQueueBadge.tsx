"use client";

import { CloudOff, Loader2 } from "lucide-react";

interface PendingQueueBadgeProps {
  count: number;
  isSyncing?: boolean;
  onClick?: () => void;
}

export function PendingQueueBadge({
  count,
  isSyncing = false,
  onClick,
}: PendingQueueBadgeProps) {
  if (count === 0 && !isSyncing) return null;

  return (
    <button
      type="button"
      className="pending-queue-badge"
      onClick={onClick}
      aria-label={
        isSyncing
          ? "Syncing queued barcodes"
          : `${count} barcode${count !== 1 ? "s" : ""} pending sync`
      }
    >
      {isSyncing ? (
        <Loader2
          className="pending-queue-badge-icon animate-spin"
          aria-hidden="true"
        />
      ) : (
        <CloudOff className="pending-queue-badge-icon" aria-hidden="true" />
      )}
      <span className="pending-queue-badge-count">
        {isSyncing ? "Syncing..." : count}
      </span>
    </button>
  );
}
