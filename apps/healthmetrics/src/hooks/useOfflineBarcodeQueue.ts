"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNetworkStatus } from "./useNetworkStatus";
import { lookupBarcode, createDiaryEntryFromScan } from "@/server";
import type {
  QueuedBarcodeScan,
  QueueSyncSummary,
  QueueSyncResult,
  ScannedProduct,
} from "@/types";
import type { MealType } from "@/constants";
import { createLogger } from "@/lib/logger";

const STORAGE_KEY = "barcode-offline-queue";
const MAX_QUEUE_SIZE = 50;
const FAILED_RETENTION_DAYS = 7;

const log = createLogger("hooks:offline-barcode-queue");

export function useOfflineBarcodeQueue(userId: string) {
  const { isOnline } = useNetworkStatus();
  const [queue, setQueue] = useState<QueuedBarcodeScan[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<QueueSyncSummary | null>(
    null
  );
  const syncInProgressRef = useRef(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as QueuedBarcodeScan[];
        // Clean up old failed items
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - FAILED_RETENTION_DAYS);
        const filtered = parsed.filter((item) => {
          if (item.status === "failed") {
            return new Date(item.queuedAt) > cutoffDate;
          }
          return true;
        });
        setQueue(filtered);
      } catch {
        log.error("Failed to parse offline queue from localStorage");
      }
    }
  }, []);

  // Persist queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);

  // Auto-sync when coming back online
  // Note: syncQueue is intentionally excluded to prevent infinite loops
  // The ref syncInProgressRef prevents duplicate syncs
  useEffect(() => {
    if (isOnline && !syncInProgressRef.current) {
      const pendingCount = queue.filter((s) => s.status === "pending").length;
      if (pendingCount > 0) {
        syncQueue();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, queue]);

  // Add a scan to the queue
  const queueScan = useCallback(
    (
      barcode: string,
      mealType: MealType,
      servings: number,
      date: string,
      productName?: string
    ): QueuedBarcodeScan => {
      const scan: QueuedBarcodeScan = {
        id: crypto.randomUUID(),
        barcode,
        mealType,
        servings,
        date,
        queuedAt: new Date().toISOString(),
        status: "pending",
        productName,
      };

      setQueue((prev) => {
        // Enforce max queue size
        const newQueue = [...prev, scan];
        if (newQueue.length > MAX_QUEUE_SIZE) {
          // Remove oldest pending items first
          const sorted = [...newQueue].sort(
            (a, b) =>
              new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
          );
          return sorted.slice(-MAX_QUEUE_SIZE);
        }
        return newQueue;
      });

      return scan;
    },
    []
  );

  // Remove a scan from the queue
  const removeScan = useCallback((id: string) => {
    setQueue((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Clear all failed items
  const clearFailed = useCallback(() => {
    setQueue((prev) => prev.filter((s) => s.status !== "failed"));
  }, []);

  // Clear entire queue
  const clearAll = useCallback(() => {
    setQueue([]);
  }, []);

  // Sync all pending items
  const syncQueue = useCallback(async (): Promise<QueueSyncSummary> => {
    if (syncInProgressRef.current) {
      return { total: 0, succeeded: 0, failed: 0, results: [] };
    }

    syncInProgressRef.current = true;
    setIsSyncing(true);

    const pendingScans = queue.filter((s) => s.status === "pending");
    const results: QueueSyncResult[] = [];

    // Mark all as syncing
    setQueue((prev) =>
      prev.map((s) =>
        s.status === "pending" ? { ...s, status: "syncing" as const } : s
      )
    );

    for (const scan of pendingScans) {
      try {
        // Look up the barcode using server function
        const product = await lookupBarcode({
          data: { barcode: scan.barcode },
        });

        if (product) {
          // Map to ScannedProduct format for diary entry
          const scannedProduct: ScannedProduct = {
            id: product.id,
            barcode: product.barcode,
            name: product.name,
            brand: product.brand,
            caloriesPer100g: product.caloriesPer100g,
            proteinG: product.proteinG,
            carbsG: product.carbsG,
            fatG: product.fatG,
            fiberG: product.fiberG,
            sugarG: product.sugarG,
            sodiumMg: product.sodiumMg,
            servingSizeG: product.servingSizeG,
            imageUrl: null,
            source: product.source as ScannedProduct["source"],
            verified: product.verified,
          };

          // Add to diary using server function
          await createDiaryEntryFromScan({
            data: {
              userId,
              date: scan.date,
              mealType: scan.mealType,
              servings: scan.servings,
              quantityG: scannedProduct.servingSizeG * scan.servings,
              product: {
                barcode: scannedProduct.barcode,
                name: scannedProduct.name,
                brand: scannedProduct.brand,
                caloriesPer100g: scannedProduct.caloriesPer100g,
                proteinG: scannedProduct.proteinG,
                carbsG: scannedProduct.carbsG,
                fatG: scannedProduct.fatG,
                fiberG: scannedProduct.fiberG,
                sugarG: scannedProduct.sugarG,
                sodiumMg: scannedProduct.sodiumMg,
                servingSizeG: scannedProduct.servingSizeG,
                source: scannedProduct.source,
                verified: scannedProduct.verified,
              },
            },
          });

          // Remove from queue on success
          setQueue((prev) => prev.filter((s) => s.id !== scan.id));

          results.push({
            id: scan.id,
            barcode: scan.barcode,
            success: true,
            productName: product.name,
          });
        } else {
          // Product not found
          setQueue((prev) =>
            prev.map((s) =>
              s.id === scan.id
                ? {
                    ...s,
                    status: "failed" as const,
                    errorMessage: "Product not found",
                  }
                : s
            )
          );

          results.push({
            id: scan.id,
            barcode: scan.barcode,
            success: false,
            errorMessage: "Product not found",
          });
        }
      } catch (error) {
        // Network or API error - keep as pending for retry
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes("network") ||
            error.message.includes("fetch") ||
            error.message.includes("offline"));

        if (isNetworkError) {
          // Revert to pending for retry
          setQueue((prev) =>
            prev.map((s) =>
              s.id === scan.id ? { ...s, status: "pending" as const } : s
            )
          );
        } else {
          // Mark as failed
          setQueue((prev) =>
            prev.map((s) =>
              s.id === scan.id
                ? {
                    ...s,
                    status: "failed" as const,
                    errorMessage:
                      error instanceof Error ? error.message : "Unknown error",
                  }
                : s
            )
          );
        }

        results.push({
          id: scan.id,
          barcode: scan.barcode,
          success: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const summary: QueueSyncSummary = {
      total: pendingScans.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };

    setLastSyncResult(summary);
    setIsSyncing(false);
    syncInProgressRef.current = false;

    return summary;
  }, [queue, userId]);

  // Computed values
  const pendingCount = queue.filter((s) => s.status === "pending").length;
  const failedCount = queue.filter((s) => s.status === "failed").length;
  const totalCount = queue.length;

  return {
    // Queue state
    queue,
    pendingCount,
    failedCount,
    totalCount,
    isEmpty: queue.length === 0,

    // Sync state
    isSyncing,
    lastSyncResult,

    // Actions
    queueScan,
    removeScan,
    clearFailed,
    clearAll,
    syncQueue,
  };
}
