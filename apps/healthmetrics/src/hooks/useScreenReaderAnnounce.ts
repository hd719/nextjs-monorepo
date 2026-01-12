"use client";

import { useCallback, useRef, useEffect } from "react";

export function useScreenReaderAnnounce() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  // Create the announcer element on mount
  useEffect(() => {
    // Check if announcer already exists
    let announcer = document.getElementById(
      "scanner-sr-announcer"
    ) as HTMLDivElement | null;

    if (!announcer) {
      announcer = document.createElement("div");
      announcer.id = "scanner-sr-announcer";
      announcer.setAttribute("role", "status");
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      // Visually hidden but accessible to screen readers
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(announcer);
    }

    announcerRef.current = announcer;

    return () => {
      // Don't remove on unmount - other components might use it
    };
  }, []);

  /**
   * Announce a message to screen readers
   *
   * @param message - The message to announce
   * @param priority - "polite" (default) or "assertive" for urgent messages
   */
  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (!announcerRef.current) return;

      // Update aria-live if priority changes
      announcerRef.current.setAttribute("aria-live", priority);

      // Clear and set to trigger announcement
      announcerRef.current.textContent = "";

      // Use requestAnimationFrame to ensure the clear happens first
      requestAnimationFrame(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      });
    },
    []
  );

  /**
   * Announce an urgent message (interrupts current speech)
   */
  const announceUrgent = useCallback(
    (message: string) => {
      announce(message, "assertive");
    },
    [announce]
  );

  return { announce, announceUrgent };
}
