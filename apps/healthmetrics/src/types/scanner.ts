import type { MealType } from "@/constants/defaults";

// Supported barcode formats for food products
export type BarcodeFormat =
  | "ean_13" // European Article Number (13 digits) - most common for food
  | "ean_8" // Compact EAN
  | "upc_a" // Universal Product Code (US) - 12 digits
  | "upc_e" // Compact UPC
  | "code_128"; // General purpose barcode

// Product data returned from barcode lookup
export interface ScannedProduct {
  id: string;
  barcode: string;
  name: string;
  brand: string | null;
  // Nutrition per 100g
  caloriesPer100g: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
  servingSizeG: number;
  imageUrl: string | null;
  source: "open_food_facts" | "usda" | "user" | "edamam" | "cookbook";
  verified: boolean;
}

// State for the scanner dialog
export type ScannerState =
  | "idle" // Initial state, camera not active
  | "scanning" // Camera active, waiting for barcode
  | "loading" // Barcode detected, fetching product
  | "found" // Product found, showing details
  | "not_found" // Barcode not in database
  | "error"; // Error occurred (camera/API)

// Error types that can occur during scanning
export interface ScannerError {
  type:
    | "camera_permission_denied"
    | "camera_not_available"
    | "api_error"
    | "network_offline"
    | "invalid_barcode";
  message: string;
}

// Props for the main BarcodeScanner component
export interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError: (error: ScannerError) => void;
  onClose: () => void;
  isActive?: boolean;
}

// Props for the ScannerDialog component
export interface ScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  date: string; // YYYY-MM-DD
  onSuccess: () => void;
}

// Props for the ProductCard component
export interface ProductCardProps {
  product: ScannedProduct;
  servings: number;
  onServingsChange: (servings: number) => void;
  mealType: MealType;
  onMealTypeChange: (mealType: MealType) => void;
  isLoading?: boolean;
}

// Props for ProductNotFound component
export interface ProductNotFoundProps {
  barcode: string;
  onTryAgain: () => void;
  onManualSearch: () => void;
  onManualEntry: () => void;
}

// Props for ManualBarcodeInput component
export interface ManualBarcodeInputProps {
  onSubmit: (barcode: string) => void;
  isLoading?: boolean;
}

// Recently scanned item (stored in the database)
export interface RecentlyScannedItem {
  barcode: string;
  productId: string;
  productName: string;
  brand: string | null;
  caloriesPer100g: number;
  imageUrl: string | null;
  scannedAt: string; // ISO date string
}

// Hook return type for useRecentlyScanned
export interface UseRecentlyScannedResult {
  items: RecentlyScannedItem[];
  addItem: (item: RecentlyScannedItem) => void;
  removeItem: (barcode: string) => void;
  clearAll: () => void;
}

// Input for creating a diary entry from scanned product
export interface CreateDiaryEntryFromScanInput {
  userId: string;
  date: string;
  product: ScannedProduct;
  servings: number;
  mealType: MealType;
  notes?: string;
}

// Offline queue types
export type QueuedScanStatus = "pending" | "syncing" | "synced" | "failed";

export interface QueuedBarcodeScan {
  id: string;
  barcode: string;
  mealType: MealType;
  servings: number;
  date: string; // Target diary date (YYYY-MM-DD)
  queuedAt: string; // ISO timestamp when queued
  status: QueuedScanStatus;
  errorMessage?: string;
  productName?: string; // Cached name if known
}

// Sync result for a single item
export interface QueueSyncResult {
  id: string;
  barcode: string;
  success: boolean;
  productName?: string;
  errorMessage?: string;
  // Used internally to determine how to handle failed syncs
  shouldRetry?: boolean; // Network error - keep as pending for retry
  shouldMarkFailed?: boolean; // Other error - mark as failed
}

// Summary of sync operation
export interface QueueSyncSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: QueueSyncResult[];
}
