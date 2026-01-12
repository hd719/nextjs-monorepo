"use client";

import { Camera, CameraOff, Settings, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CameraPermissionStatus } from "@/hooks";

interface CameraPermissionStateProps {
  status: CameraPermissionStatus;
  onRequestPermission: () => void;
  onManualEntry: () => void;
  onClose: () => void;
  error?: string | null;
}

export function CameraPermissionState({
  status,
  onRequestPermission,
  onManualEntry,
  onClose,
  error,
}: CameraPermissionStateProps) {
  // Loading state while checking permissions
  if (status === "checking") {
    return (
      <div className="scanner-permission-state">
        <div className="scanner-permission-icon scanner-permission-icon-checking">
          <Camera className="w-12 h-12 animate-pulse" aria-hidden="true" />
        </div>
        <h3 className="scanner-permission-title">Checking Camera Access</h3>
        <p className="scanner-permission-message">
          Please wait while we check camera permissions...
        </p>
      </div>
    );
  }

  // Prompt state - user hasn't granted permission yet
  if (status === "prompt") {
    return (
      <div className="scanner-permission-state">
        <div className="scanner-permission-icon scanner-permission-icon-prompt">
          <Camera className="w-12 h-12" aria-hidden="true" />
        </div>
        <h3 className="scanner-permission-title">Camera Access Required</h3>
        <p className="scanner-permission-message">
          To scan barcodes, we need access to your camera. Your camera feed
          stays on your device and is never recorded or stored.
        </p>
        <div className="scanner-permission-actions">
          <Button onClick={onRequestPermission} className="w-full">
            <Camera className="w-4 h-4 mr-2" aria-hidden="true" />
            Allow Camera Access
          </Button>
          <Button variant="outline" onClick={onManualEntry} className="w-full">
            Enter Barcode Manually
          </Button>
        </div>
      </div>
    );
  }

  // Denied state - user explicitly denied permission
  if (status === "denied") {
    return (
      <div className="scanner-permission-state">
        <div className="scanner-permission-icon scanner-permission-icon-denied">
          <CameraOff className="w-12 h-12" aria-hidden="true" />
        </div>
        <h3 className="scanner-permission-title">Camera Access Denied</h3>
        <p className="scanner-permission-message">
          Camera permission was denied. To scan barcodes, you&apos;ll need to
          enable camera access in your browser or device settings.
        </p>

        {/* Platform-specific instructions */}
        <div className="scanner-permission-instructions">
          <PlatformInstructions />
        </div>

        <div className="scanner-permission-actions">
          <Button variant="outline" onClick={onManualEntry} className="w-full">
            Enter Barcode Manually
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Unavailable state - no camera or not supported
  if (status === "unavailable") {
    return (
      <div className="scanner-permission-state">
        <div className="scanner-permission-icon scanner-permission-icon-unavailable">
          <CameraOff className="w-12 h-12" aria-hidden="true" />
        </div>
        <h3 className="scanner-permission-title">Camera Not Available</h3>
        <p className="scanner-permission-message">
          {error ||
            "No camera was found on this device, or your browser doesn't support camera access."}
        </p>
        <div className="scanner-permission-actions">
          <Button onClick={onManualEntry} className="w-full">
            Enter Barcode Manually
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Granted state - should not render this component
  return null;
}

/**
 * Platform-specific instructions for enabling camera access
 */
function PlatformInstructions() {
  // Detect platform
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid =
    typeof navigator !== "undefined" && /Android/.test(navigator.userAgent);

  if (isIOS) {
    return (
      <div className="scanner-platform-instructions">
        <div className="scanner-platform-header">
          <Smartphone className="w-4 h-4" aria-hidden="true" />
          <span>iOS Instructions</span>
        </div>
        <ol className="scanner-platform-steps">
          <li>Open the Settings app</li>
          <li>Scroll down and tap Safari (or your browser)</li>
          <li>Tap &quot;Camera&quot;</li>
          <li>Select &quot;Allow&quot;</li>
          <li>Return to this page and refresh</li>
        </ol>
      </div>
    );
  }

  if (isAndroid) {
    return (
      <div className="scanner-platform-instructions">
        <div className="scanner-platform-header">
          <Smartphone className="w-4 h-4" aria-hidden="true" />
          <span>Android Instructions</span>
        </div>
        <ol className="scanner-platform-steps">
          <li>Tap the lock icon in the address bar</li>
          <li>Tap &quot;Permissions&quot; or &quot;Site settings&quot;</li>
          <li>Find &quot;Camera&quot; and tap to allow</li>
          <li>Refresh this page</li>
        </ol>
      </div>
    );
  }

  // Desktop instructions
  return (
    <div className="scanner-platform-instructions">
      <div className="scanner-platform-header">
        <Monitor className="w-4 h-4" aria-hidden="true" />
        <span>Desktop Instructions</span>
      </div>
      <ol className="scanner-platform-steps">
        <li>Click the camera/lock icon in the address bar</li>
        <li>Find the camera permission setting</li>
        <li>Change it from &quot;Block&quot; to &quot;Allow&quot;</li>
        <li>Refresh this page</li>
      </ol>
      <div className="scanner-settings-hint">
        <Settings className="w-4 h-4" aria-hidden="true" />
        <span>
          You can also check <strong>chrome://settings/content/camera</strong>{" "}
          (Chrome) or browser preferences
        </span>
      </div>
    </div>
  );
}
