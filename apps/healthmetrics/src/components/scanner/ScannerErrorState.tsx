"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  WifiOff,
  RefreshCw,
  Camera,
  Server,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ScannerError } from "@/types";

interface ScannerErrorStateProps {
  error?: ScannerError | null;
  message?: string;
  onTryAgain: () => void;
  onClose: () => void;
}

export function ScannerErrorState({
  error,
  message,
  onTryAgain,
  onClose,
}: ScannerErrorStateProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle retry with loading state
  const handleRetry = async () => {
    setIsRetrying(true);
    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 300));
    onTryAgain();
    setIsRetrying(false);
  };

  // Determine error type and display
  const errorType = error?.type || "api_error";
  const errorConfig = getErrorConfig(errorType, isOnline);
  const displayMessage =
    message || error?.message || errorConfig.defaultMessage;

  return (
    <div className="scanner-error-state">
      {/* Error icon */}
      <div className={`scanner-error-icon ${errorConfig.iconClassName}`}>
        <errorConfig.Icon
          className="scanner-error-icon-svg"
          aria-hidden="true"
        />
      </div>

      {/* Error title */}
      <h3 className="scanner-error-title">{errorConfig.title}</h3>

      {/* Error message */}
      <p className="scanner-error-message">{displayMessage}</p>

      {/* Offline alert */}
      {!isOnline && (
        <Alert variant="destructive" className="scanner-error-alert">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You&apos;re currently offline. Please check your internet
            connection.
          </AlertDescription>
        </Alert>
      )}

      {/* Help text for specific errors */}
      {errorConfig.helpText && (
        <p className="scanner-error-help">{errorConfig.helpText}</p>
      )}

      {/* Actions */}
      <div className="scanner-error-actions">
        {errorConfig.showRetry && (
          <Button
            onClick={handleRetry}
            disabled={
              isRetrying || (!isOnline && errorType === "network_offline")
            }
            variant="outline"
          >
            {isRetrying ? (
              <>
                <RefreshCw
                  className="w-4 h-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Try Again
              </>
            )}
          </Button>
        )}
        <Button
          onClick={onClose}
          variant={errorConfig.showRetry ? "ghost" : "outline"}
        >
          Close
        </Button>
      </div>
    </div>
  );
}

/**
 * Get error configuration based on error type
 */
function getErrorConfig(
  errorType: ScannerError["type"] | string,
  isOnline: boolean
) {
  // Override with network error if offline
  if (!isOnline) {
    return {
      Icon: WifiOff,
      iconClassName: "scanner-error-icon-network",
      title: "No Internet Connection",
      defaultMessage:
        "Unable to look up product information. Please check your connection and try again.",
      helpText: "Make sure you have a stable internet connection.",
      showRetry: true,
    };
  }

  switch (errorType) {
    case "camera_permission_denied":
      return {
        Icon: Camera,
        iconClassName: "scanner-error-icon-camera",
        title: "Camera Access Denied",
        defaultMessage:
          "Camera permission was denied. Please enable camera access in your browser settings.",
        helpText: "You can also enter the barcode manually.",
        showRetry: false,
      };

    case "camera_not_available":
      return {
        Icon: Camera,
        iconClassName: "scanner-error-icon-camera",
        title: "Camera Not Available",
        defaultMessage:
          "No camera was found on this device or it&apos;s being used by another app.",
        helpText: "Try closing other apps that might be using the camera.",
        showRetry: true,
      };

    case "network_offline":
      return {
        Icon: WifiOff,
        iconClassName: "scanner-error-icon-network",
        title: "Network Offline",
        defaultMessage:
          "You appear to be offline. Please check your internet connection.",
        helpText: null,
        showRetry: true,
      };

    case "api_error":
      return {
        Icon: Server,
        iconClassName: "scanner-error-icon-api",
        title: "Service Unavailable",
        defaultMessage:
          "We couldn&apos;t connect to our servers. This might be temporary.",
        helpText: "Please wait a moment and try again.",
        showRetry: true,
      };

    case "invalid_barcode":
      return {
        Icon: XCircle,
        iconClassName: "scanner-error-icon-invalid",
        title: "Invalid Barcode",
        defaultMessage:
          "The barcode format is not recognized. Please try scanning again.",
        helpText: "Make sure the barcode is clearly visible and not damaged.",
        showRetry: true,
      };

    default:
      return {
        Icon: AlertCircle,
        iconClassName: "scanner-error-icon-default",
        title: "Something Went Wrong",
        defaultMessage: "An unexpected error occurred. Please try again.",
        helpText: null,
        showRetry: true,
      };
  }
}
