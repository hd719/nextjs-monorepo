"use client";

import { Loader2, ScanBarcode } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ScannerLoadingStateProps {
  barcode?: string | null;
  variant?: "spinner" | "skeleton";
}

export function ScannerLoadingState({
  barcode,
  variant = "spinner",
}: ScannerLoadingStateProps) {
  if (variant === "skeleton") {
    return <ProductCardSkeleton barcode={barcode} />;
  }

  return (
    <div className="scanner-loading">
      <div className="scanner-loading-icon">
        <ScanBarcode aria-hidden="true" />
      </div>
      <Loader2 className="scanner-loading-spinner" aria-hidden="true" />
      <p className="scanner-loading-text">Looking up barcode...</p>
      {barcode && <p className="scanner-loading-barcode">{barcode}</p>}
    </div>
  );
}

/**
 * Skeleton loading state that mimics the ProductCard layout
 */
function ProductCardSkeleton({ barcode }: { barcode?: string | null }) {
  return (
    <div
      className="scanner-product-card"
      aria-busy="true"
      aria-label="Loading product details"
    >
      {/* Header with image and name */}
      <div className="scanner-product-header">
        <Skeleton className="w-16 h-16 rounded-lg" />
        <div className="scanner-product-info">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-1" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>

      {/* Nutrition grid skeleton */}
      <div className="scanner-nutrition-grid">
        <div className="scanner-nutrition-item">
          <Skeleton className="h-6 w-12 mx-auto mb-1" />
          <Skeleton className="h-3 w-10 mx-auto" />
        </div>
        <div className="scanner-nutrition-item">
          <Skeleton className="h-6 w-12 mx-auto mb-1" />
          <Skeleton className="h-3 w-10 mx-auto" />
        </div>
        <div className="scanner-nutrition-item">
          <Skeleton className="h-6 w-12 mx-auto mb-1" />
          <Skeleton className="h-3 w-10 mx-auto" />
        </div>
      </div>

      {/* Extended nutrition skeleton */}
      <div className="scanner-nutrition-extended">
        <Skeleton className="h-12 rounded-md" />
        <Skeleton className="h-12 rounded-md" />
        <Skeleton className="h-12 rounded-md" />
      </div>

      {/* Servings control skeleton */}
      <Skeleton className="h-14 w-full rounded-lg mb-4" />

      {/* Meal selector skeleton */}
      <div className="scanner-meal-selector">
        <Skeleton className="h-4 w-20 mb-2" />
        <div className="grid grid-cols-4 gap-2">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>

      {/* Barcode indicator */}
      {barcode && (
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Barcode: <span className="font-mono">{barcode}</span>
          </p>
        </div>
      )}
    </div>
  );
}
