"use client";

import { useState, useCallback, useEffect } from "react";
import {
  RECENTLY_SCANNED_STORAGE_KEY,
  RECENTLY_SCANNED_MAX_ITEMS,
} from "@/constants";
import type { ScannedProduct } from "@/types";

export interface RecentlyScannedItem {
  product: ScannedProduct;
  scannedAt: string;
}

interface UseRecentlyScannedReturn {
  items: RecentlyScannedItem[];
  addItem: (product: ScannedProduct) => void;
  removeItem: (barcode: string) => void;
  clearAll: () => void;
}

/**
 * Hook to manage recently scanned products in localStorage
 * Stores up to MAX_ITEMS products, most recent first
 */
export function useRecentlyScanned(): UseRecentlyScannedReturn {
  const [items, setItems] = useState<RecentlyScannedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_SCANNED_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyScannedItem[];
        setItems(parsed);
      }
    } catch (error) {
      console.error("Failed to load recently scanned items:", error);
    }
  }, []);

  // Save to localStorage whenever items change
  const saveToStorage = useCallback((newItems: RecentlyScannedItem[]) => {
    try {
      localStorage.setItem(
        RECENTLY_SCANNED_STORAGE_KEY,
        JSON.stringify(newItems)
      );
    } catch (error) {
      console.error("Failed to save recently scanned items:", error);
    }
  }, []);

  const addItem = useCallback(
    (product: ScannedProduct) => {
      setItems((prevItems) => {
        // Remove existing entry for this barcode (if any)
        const filtered = prevItems.filter(
          (item) => item.product.barcode !== product.barcode
        );

        // Add new item at the beginning
        const newItem: RecentlyScannedItem = {
          product,
          scannedAt: new Date().toISOString(),
        };

        // Keep only MAX_ITEMS
        const newItems = [newItem, ...filtered].slice(
          0,
          RECENTLY_SCANNED_MAX_ITEMS
        );

        saveToStorage(newItems);
        return newItems;
      });
    },
    [saveToStorage]
  );

  const removeItem = useCallback(
    (barcode: string) => {
      setItems((prevItems) => {
        const newItems = prevItems.filter(
          (item) => item.product.barcode !== barcode
        );
        saveToStorage(newItems);
        return newItems;
      });
    },
    [saveToStorage]
  );

  const clearAll = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(RECENTLY_SCANNED_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recently scanned items:", error);
    }
  }, []);

  return {
    items,
    addItem,
    removeItem,
    clearAll,
  };
}
