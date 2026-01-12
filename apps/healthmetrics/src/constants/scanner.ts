import type { ScannerState } from "@/types";

// Recently scanned storage
export const RECENTLY_SCANNED_STORAGE_KEY = "healthmetrics:recently-scanned";
export const RECENTLY_SCANNED_MAX_ITEMS = 10;

// Dialog titles for each scanner state
export const SCANNER_DIALOG_TITLES: Record<
  Exclude<ScannerState, "scanning" | "idle">,
  string
> = {
  loading: "Looking Up...",
  found: "Add to Diary",
  not_found: "Product Not Found",
  error: "Scanner Error",
};

// Dialog descriptions for each scanner state
export const SCANNER_DIALOG_DESCRIPTIONS: Record<
  Exclude<ScannerState, "scanning" | "idle">,
  string
> = {
  loading: "Searching our database for this product",
  found: "Review the product details and add to your food diary",
  not_found: "This barcode wasn't found in our database",
  error: "There was a problem with the scanner",
};
