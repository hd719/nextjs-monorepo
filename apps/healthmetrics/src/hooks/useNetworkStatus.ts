"use client";

import { useState, useEffect, useCallback } from "react";

// Env var to simulate offline mode for scanner testing (only affects scanner, not whole app)
const SIMULATE_OFFLINE =
  import.meta.env.VITE_SIMULATE_SCANNER_OFFLINE === "true";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    // If simulating offline, always return false
    if (SIMULATE_OFFLINE) return false;
    // Default to true during SSR, will be updated on mount
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });

  // Manual check function (useful for retry logic)
  const checkConnection = useCallback(() => {
    // Always return false if simulating offline
    if (SIMULATE_OFFLINE) return false;
    if (typeof window === "undefined") return true;
    const online = navigator.onLine;
    setIsOnline(online);
    return online;
  }, []);

  useEffect(() => {
    // Skip real network detection if simulating offline
    if (SIMULATE_OFFLINE) {
      setIsOnline(false);
      return;
    }

    // Set initial state on mount
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    checkConnection,
  };
}
