"use client";

import { WifiOff } from "lucide-react";

interface OfflineIndicatorProps {
  pendingCount?: number;
}

export function OfflineIndicator({ pendingCount = 0 }: OfflineIndicatorProps) {
  return (
    <div className="offline-indicator" role="status" aria-live="polite">
      <div className="offline-indicator-badge">
        <WifiOff aria-hidden="true" />
        <span>Offline</span>
      </div>
      {pendingCount > 0 && (
        <p className="offline-indicator-message">
          {pendingCount} scan{pendingCount !== 1 ? "s" : ""} queued
        </p>
      )}
    </div>
  );
}
