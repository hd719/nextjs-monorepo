"use client";

import { Loader2, Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarcodeScanner } from "./BarcodeScanner";
import { ProductCard } from "./ProductCard";
import { ProductNotFound } from "./ProductNotFound";
import { ScannerLoadingState } from "./ScannerLoadingState";
import { ScannerErrorState } from "./ScannerErrorState";
import { ManualBarcodeInput } from "./ManualBarcodeInput";
import { RecentlyScanned } from "./RecentlyScanned";
import { CameraPermissionState } from "./CameraPermissionState";
import { OfflineIndicator } from "./OfflineIndicator";
import { QueuedScanCard } from "./QueuedScanCard";
import { useScannerDialog } from "@/hooks";
import {
  SCANNER_DIALOG_TITLES,
  SCANNER_DIALOG_DESCRIPTIONS,
} from "@/constants";
import type { ScannerDialogProps } from "@/types";

// Extended titles/descriptions for queued state
const EXTENDED_TITLES = {
  ...SCANNER_DIALOG_TITLES,
  queued: "Barcode Saved",
};

const EXTENDED_DESCRIPTIONS = {
  ...SCANNER_DIALOG_DESCRIPTIONS,
  queued: "Your scan has been queued for later",
};

export function ScannerDialog({
  open,
  onOpenChange,
  userId,
  date,
  onSuccess,
}: ScannerDialogProps) {
  const {
    state,
    product,
    scannedBarcode,
    displayError,
    showManualInput,
    isLookingUp,
    isAddingToDiary,
    cameraPermission,
    requestCameraPermission,
    cameraPermissionError,
    isOffline,
    queuedScan,
    pendingQueueCount,
    servings,
    setServings,
    mealType,
    setMealType,
    recentlyScanned,
    handleSelectRecent,
    handleRemoveRecent,
    handleClearRecent,
    handleScan,
    handleScannerError,
    handleClose,
    handleTryAgain,
    handleManualSubmit,
    handleAddToDiary,
    toggleManualInput,
  } = useScannerDialog({ open, onOpenChange, userId, date, onSuccess });

  // Check if we need to show permission UI instead of scanner
  const needsPermissionUI = cameraPermission !== "granted" && !showManualInput;

  const renderContent = () => {
    // Show permission UI if camera permission is not granted
    // (unless user has toggled to manual input)
    if (state === "scanning" && needsPermissionUI) {
      return (
        <CameraPermissionState
          status={cameraPermission}
          onRequestPermission={requestCameraPermission}
          onManualEntry={toggleManualInput}
          onClose={handleClose}
          error={cameraPermissionError}
        />
      );
    }

    switch (state) {
      case "queued":
        return queuedScan ? (
          <QueuedScanCard
            scan={queuedScan}
            onScanAnother={handleTryAgain}
            onDone={handleClose}
            totalQueued={pendingQueueCount}
          />
        ) : null;
      case "scanning":
        return (
          <>
            {/* Offline indicator */}
            {isOffline && <OfflineIndicator pendingCount={pendingQueueCount} />}
            <div
              className={`scanner-dialog-body ${showManualInput ? "scanner-dialog-body-hidden" : ""}`}
            >
              <BarcodeScanner
                onScan={handleScan}
                onError={handleScannerError}
                onClose={handleClose}
                isActive={
                  state === "scanning" && cameraPermission === "granted"
                }
              />
            </div>
            <div className="scanner-manual-input-section">
              <button
                type="button"
                onClick={toggleManualInput}
                className="scanner-manual-input-toggle"
              >
                <Keyboard className="icon-sm" aria-hidden="true" />
                {showManualInput ? "Use camera" : "Enter barcode manually"}
              </button>
              {showManualInput && (
                <ManualBarcodeInput
                  onSubmit={handleManualSubmit}
                  isLoading={isLookingUp}
                />
              )}
            </div>
            {recentlyScanned.length > 0 && (
              <div className="scanner-recently-scanned-section">
                <RecentlyScanned
                  items={recentlyScanned}
                  onSelect={handleSelectRecent}
                  onRemove={handleRemoveRecent}
                  onClearAll={handleClearRecent}
                />
              </div>
            )}
          </>
        );
      case "loading":
        return <ScannerLoadingState barcode={scannedBarcode} />;
      case "found":
        return product ? (
          <ProductCard
            product={product}
            servings={servings}
            onServingsChange={setServings}
            mealType={mealType}
            onMealTypeChange={setMealType}
          />
        ) : null;
      case "not_found":
        return (
          <ProductNotFound
            barcode={scannedBarcode}
            onTryAgain={handleTryAgain}
            onSearchManually={handleClose}
          />
        );
      case "error":
        return (
          <ScannerErrorState
            error={displayError}
            message={displayError?.message}
            onTryAgain={handleTryAgain}
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  const showHeader = state !== "scanning" && state !== "queued";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="scanner-dialog-content"
        closeOnOutsideClick
        onClose={handleClose}
      >
        {showHeader && (
          <DialogHeader className="scanner-dialog-header">
            <DialogTitle>
              {EXTENDED_TITLES[state as keyof typeof EXTENDED_TITLES]}
            </DialogTitle>
            <DialogDescription>
              {
                EXTENDED_DESCRIPTIONS[
                  state as keyof typeof EXTENDED_DESCRIPTIONS
                ]
              }
            </DialogDescription>
          </DialogHeader>
        )}

        {renderContent()}

        {state === "found" && (
          <DialogFooter className="scanner-dialog-footer">
            <Button variant="outline" onClick={handleTryAgain}>
              Scan Another
            </Button>
            <Button onClick={handleAddToDiary} disabled={isAddingToDiary}>
              {isAddingToDiary ? (
                <>
                  <Loader2 className="loader-icon" aria-hidden="true" />
                  Adding...
                </>
              ) : (
                "Add to Diary"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
