"use client";

import { useState, useEffect, useCallback } from "react";

// Camera permission states
export type CameraPermissionStatus =
  | "checking" // Initial check in progress
  | "prompt" // User hasn't been asked yet
  | "granted" // Permission granted
  | "denied" // Permission denied
  | "unavailable"; // No camera available

export interface UseCameraPermissionResult {
  status: CameraPermissionStatus;
  requestPermission: () => Promise<void>;
  isChecking: boolean;
  error: string | null;
}

export function useCameraPermission(): UseCameraPermissionResult {
  const [status, setStatus] = useState<CameraPermissionStatus>("checking");
  const [error, setError] = useState<string | null>(null);

  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  // Check camera availability and permission
  const checkPermission = useCallback(async () => {
    if (!isBrowser) {
      setStatus("unavailable");
      return;
    }

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      setError("Camera API not supported in this browser");
      return;
    }

    try {
      // Try using the Permissions API first (more reliable)
      if (navigator.permissions?.query) {
        const result = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });

        // Map permission state to our status
        switch (result.state) {
          case "granted":
            setStatus("granted");
            break;
          case "denied":
            setStatus("denied");
            break;
          case "prompt":
            setStatus("prompt");
            break;
          default:
            setStatus("prompt");
        }

        // Listen for permission changes
        result.onchange = () => {
          switch (result.state) {
            case "granted":
              setStatus("granted");
              break;
            case "denied":
              setStatus("denied");
              break;
            case "prompt":
              setStatus("prompt");
              break;
          }
        };
      } else {
        // Fallback: assume we need to prompt
        // The actual permission will be requested when camera is accessed
        setStatus("prompt");
      }
    } catch {
      // Some browsers throw on permissions.query for camera
      // Fallback to assuming prompt state
      setStatus("prompt");
    }
  }, [isBrowser]);

  // Request camera permission by attempting to access the camera
  const requestPermission = useCallback(async () => {
    if (!isBrowser) return;

    setError(null);

    try {
      // Request camera access - this will trigger the permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Permission granted - stop the stream immediately
      // (we just needed it to trigger the permission)
      stream.getTracks().forEach((track) => track.stop());

      setStatus("granted");
    } catch (err) {
      if (err instanceof Error) {
        // Handle different error types
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setStatus("denied");
          setError("Camera permission was denied");
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          setStatus("unavailable");
          setError("No camera found on this device");
        } else if (err.name === "NotReadableError") {
          setStatus("unavailable");
          setError("Camera is being used by another application");
        } else if (err.name === "OverconstrainedError") {
          // Try again without facing mode constraint
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            stream.getTracks().forEach((track) => track.stop());
            setStatus("granted");
          } catch {
            setStatus("unavailable");
            setError("Could not access camera");
          }
        } else {
          setStatus("unavailable");
          setError(err.message || "Could not access camera");
        }
      } else {
        setStatus("unavailable");
        setError("An unknown error occurred");
      }
    }
  }, [isBrowser]);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    status,
    requestPermission,
    isChecking: status === "checking",
    error,
  };
}
