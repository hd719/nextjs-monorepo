"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAnimatedSearchOptions {
  onExpandChange?: (isExpanded: boolean) => void;
  animationDuration?: number;
}

interface UseAnimatedSearchReturn {
  isExpanded: boolean;
  isAnimating: boolean;
  searchRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  expandSearch: () => void;
  collapseSearch: () => void;
}

/**
 * Custom hook for managing animated search functionality
 * Handles expansion/collapse state, animations, and focus management
 */
export const useAnimatedSearch = ({
  onExpandChange,
  animationDuration = 300,
}: UseAnimatedSearchOptions = {}): UseAnimatedSearchReturn => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs for DOM elements
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animation timeout ref for cleanup
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Expand the search bar with animation
   */
  const expandSearch = useCallback(() => {
    if (isExpanded || isAnimating) return;

    setIsAnimating(true);

    // Set expanded state immediately
    setIsExpanded(true);

    // Notify parent component immediately
    onExpandChange?.(true);

    // Focus the input after a brief delay to allow for DOM update
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    // Mark animation as complete
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [isExpanded, isAnimating, onExpandChange]);

  /**
   * Collapse the search bar with animation
   */
  const collapseSearch = useCallback(() => {
    if (!isExpanded || isAnimating) return;

    // Blur the input to remove focus
    inputRef.current?.blur();

    // Notify parent component immediately
    onExpandChange?.(false);

    // Collapse immediately - let CSS handle the transition
    setIsExpanded(false);
  }, [isExpanded, isAnimating, onExpandChange]);

  /**
   * Handle click outside to close search
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        !isAnimating &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        collapseSearch();
      }
    };

    if (isExpanded) {
      // Add a small delay to prevent immediate closing when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isExpanded, isAnimating, collapseSearch]);

  /**
   * Handle escape key to close search
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isExpanded && !isAnimating) {
        collapseSearch();
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isExpanded, isAnimating, collapseSearch]);

  /**
   * Cleanup animation timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
    isExpanded,
    isAnimating,
    searchRef,
    inputRef,
    expandSearch,
    collapseSearch,
  };
};
