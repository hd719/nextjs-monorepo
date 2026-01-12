"use client";

import { useState, useCallback, useEffect, startTransition } from "react";
import { BarcodeScanner as ReactBarcodeScanner } from "react-barcode-scanner";
import "react-barcode-scanner/polyfill";
import { Flashlight, FlashlightOff, X, Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BarcodeScannerProps, ScannerError } from "@/types";

export function BarcodeScanner({
  onScan,
  onError,
  onClose,
  isActive = true,
}: BarcodeScannerProps) {
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [cameraError, setCameraError] = useState<ScannerError | null>(null);

  useEffect(() => {
    if (isActive) {
      startTransition(() => {
        setHasScanned(false);
        setCameraError(null);
      });
    }
  }, [isActive]);

  const handleCapture = useCallback(
    (detectedCodes: { rawValue: string }[]) => {
      if (hasScanned || !isActive) return;

      const barcode = detectedCodes[0]?.rawValue;
      if (!barcode) return;

      // Mark as scanned to prevent duplicates
      setHasScanned(true);

      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      // Pass barcode to parent
      onScan(barcode);
    },
    [hasScanned, isActive, onScan]
  );

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      console.error("Scanner error:", event);

      const scannerError: ScannerError = {
        type: "camera_not_available",
        message: "Camera error occurred. Please try again or use manual entry.",
      };

      setCameraError(scannerError);
      onError(scannerError);
    },
    [onError]
  );

  const toggleTorch = useCallback(() => {
    setTorchEnabled((prev) => !prev);
  }, []);

  if (cameraError) {
    return (
      <div className="scanner-container">
        <div className="scanner-error-state">
          <div className="scanner-error-icon">
            <CameraOff className="scanner-error-icon-svg" aria-hidden="true" />
          </div>
          <h3 className="scanner-error-title">
            {cameraError.type === "camera_permission_denied"
              ? "Camera Access Denied"
              : "Camera Not Available"}
          </h3>
          <p className="scanner-error-message">{cameraError.message}</p>
          <div className="scanner-error-actions">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <Button
          variant="ghost"
          size="icon"
          className="scanner-header-btn"
          onClick={onClose}
          aria-label="Close scanner"
        >
          <X className="scanner-header-icon" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="scanner-header-btn"
          onClick={toggleTorch}
          aria-label={
            torchEnabled ? "Turn off flashlight" : "Turn on flashlight"
          }
        >
          {torchEnabled ? (
            <Flashlight className="scanner-header-icon" aria-hidden="true" />
          ) : (
            <FlashlightOff className="scanner-header-icon" aria-hidden="true" />
          )}
        </Button>
      </div>

      <div className="scanner-camera-wrapper">
        {isActive && (
          <ReactBarcodeScanner
            onCapture={handleCapture}
            onError={handleError}
            options={{
              formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
            }}
            // Note: torch support depends on device capability
          />
        )}

        {/* Scan area overlay */}
        <div className="scanner-overlay">
          <div className="scanner-overlay-top" />
          <div className="scanner-overlay-middle">
            <div className="scanner-overlay-side" />
            <div
              className={`scanner-scan-area ${hasScanned ? "scanner-scan-area-success" : ""}`}
            >
              {/* Corner indicators */}
              <div className="scanner-corner scanner-corner-tl" />
              <div className="scanner-corner scanner-corner-tr" />
              <div className="scanner-corner scanner-corner-bl" />
              <div className="scanner-corner scanner-corner-br" />

              {/* Scan line animation */}
              {!hasScanned && <div className="scanner-line" />}
            </div>
            <div className="scanner-overlay-side" />
          </div>
          <div className="scanner-overlay-bottom" />
        </div>
      </div>

      {/* Instructions */}
      <div className="scanner-instructions">
        <Camera className="scanner-instructions-icon" aria-hidden="true" />
        <span>
          {hasScanned
            ? "Barcode detected!"
            : "Position barcode within the frame"}
        </span>
      </div>
    </div>
  );
}
