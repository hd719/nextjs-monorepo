"use client";

import { Check, WifiOff, Clock, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QueuedBarcodeScan } from "@/types";
import { MEAL_TYPE_LABELS } from "@/constants";

interface QueuedScanCardProps {
  scan: QueuedBarcodeScan;
  onScanAnother: () => void;
  onDone: () => void;
  totalQueued: number;
}

export function QueuedScanCard({
  scan,
  onScanAnother,
  onDone,
  totalQueued,
}: QueuedScanCardProps) {
  return (
    <div className="queued-scan-card" role="status" aria-live="polite">
      <div className="queued-scan-header">
        <WifiOff aria-hidden="true" />
        <span>Offline Mode</span>
      </div>

      <div className="queued-scan-content">
        <div className="queued-scan-icon">
          <Check aria-hidden="true" />
        </div>
        <h3 className="queued-scan-title">Barcode Saved</h3>
        <p className="queued-scan-barcode">{scan.barcode}</p>
        <p className="queued-scan-message">
          Will sync when you&apos;re back online
        </p>
      </div>

      <div className="queued-scan-details">
        <div className="queued-scan-detail">
          <Clock aria-hidden="true" />
          <span>{MEAL_TYPE_LABELS[scan.mealType]}</span>
        </div>
        <div className="queued-scan-detail">
          <span>
            {scan.servings} serving{scan.servings !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="queued-scan-actions">
        <Button variant="outline" onClick={onScanAnother}>
          Scan Another
        </Button>
        <Button onClick={onDone}>Done</Button>
      </div>

      {totalQueued > 0 && (
        <p className="queued-scan-count">
          <ClipboardList aria-hidden="true" />
          {totalQueued} scan{totalQueued !== 1 ? "s" : ""} queued
        </p>
      )}
    </div>
  );
}
