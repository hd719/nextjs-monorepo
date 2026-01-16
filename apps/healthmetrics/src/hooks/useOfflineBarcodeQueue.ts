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

// Process up to 3 scans in parallel for better throughput
const SYNC_CONCURRENCY_LIMIT = 3;

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

  /**
   * Process a single scan - lookup product and add to diary
   * Returns the result for this scan
   */
  const processSingleScan = useCallback(
    async (scan: QueuedBarcodeScan): Promise<QueueSyncResult> => {
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

          return {
            id: scan.id,
            barcode: scan.barcode,
            success: true,
            productName: product.name,
          };
        } else {
          // Product not found
          return {
            id: scan.id,
            barcode: scan.barcode,
            success: false,
            errorMessage: "Product not found",
            shouldMarkFailed: true,
          };
        }
      } catch (error) {
        // Network or API error - determine if we should retry or mark as failed
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes("network") ||
            error.message.includes("fetch") ||
            error.message.includes("offline"));

        return {
          id: scan.id,
          barcode: scan.barcode,
          success: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          // Network errors should be retried, other errors marked as failed
          shouldRetry: isNetworkError,
          shouldMarkFailed: !isNetworkError,
        };
      }
    },
    [userId]
  );

  // Sync all pending items with parallel processing
  const syncQueue = useCallback(async (): Promise<QueueSyncSummary> => {
    if (syncInProgressRef.current) {
      return { total: 0, succeeded: 0, failed: 0, results: [] };
    }

    syncInProgressRef.current = true;
    setIsSyncing(true);

    const pendingScans = queue.filter((s) => s.status === "pending");
    const allResults: QueueSyncResult[] = [];

    // Mark all as syncing
    setQueue((prev) =>
      prev.map((s) =>
        s.status === "pending" ? { ...s, status: "syncing" as const } : s
      )
    );

    // Process scans in batches with concurrency limit for better throughput
    for (let i = 0; i < pendingScans.length; i += SYNC_CONCURRENCY_LIMIT) {
      const batch = pendingScans.slice(i, i + SYNC_CONCURRENCY_LIMIT);

      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map((scan) => processSingleScan(scan))
      );

      // Update queue state based on results
      const successIds = batchResults.filter((r) => r.success).map((r) => r.id);
      const failedIds = batchResults
        .filter(
          (r) =>
            !r.success && (r as { shouldMarkFailed?: boolean }).shouldMarkFailed
        )
        .map((r) => r.id);
      const retryIds = batchResults
        .filter(
          (r) => !r.success && (r as { shouldRetry?: boolean }).shouldRetry
        )
        .map((r) => r.id);

      // Batch update queue state
      setQueue((prev) => {
        let updated = prev;

        // Remove successful scans
        if (successIds.length > 0) {
          updated = updated.filter((s) => !successIds.includes(s.id));
        }

        // Mark failed scans
        if (failedIds.length > 0) {
          updated = updated.map((s) => {
            if (failedIds.includes(s.id)) {
              const result = batchResults.find((r) => r.id === s.id);
              return {
                ...s,
                status: "failed" as const,
                errorMessage: result?.errorMessage || "Unknown error",
              };
            }
            return s;
          });
        }

        // Revert retry scans to pending
        if (retryIds.length > 0) {
          updated = updated.map((s) =>
            retryIds.includes(s.id) ? { ...s, status: "pending" as const } : s
          );
        }

        return updated;
      });

      allResults.push(...batchResults);
    }

    const summary: QueueSyncSummary = {
      total: pendingScans.length,
      succeeded: allResults.filter((r) => r.success).length,
      failed: allResults.filter((r) => !r.success).length,
      results: allResults,
    };

    setLastSyncResult(summary);
    setIsSyncing(false);
    syncInProgressRef.current = false;

    return summary;
  }, [queue, processSingleScan]);

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
