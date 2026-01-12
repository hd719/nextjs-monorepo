import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lookupBarcode } from "@/server";
import type { ScannedProduct, ScannerError } from "@/types";

const LOOKUP_TIMEOUT_MS = 10000; // 10 second timeout

// Maximum reasonable length for a product name display
const MAX_NAME_LENGTH = 50;

// Clean up product names from external sources (like OpenFoodFacts)
// Removes duplicate brand from start of name
// Truncates at word boundary if too long
function cleanProductName(name: string, brand: string | null): string {
  let cleaned = name.trim();

  // Remove brand from start of name if duplicated (case-insensitive)
  if (brand && cleaned.toLowerCase().startsWith(brand.toLowerCase())) {
    cleaned = cleaned.slice(brand.length).trim();
    // Remove leading separator if present (dash, comma, colon)
    if (/^[-,:]/.test(cleaned)) {
      cleaned = cleaned.slice(1).trim();
    }
  }

  // Truncate if too long (break at word boundary)
  if (cleaned.length > MAX_NAME_LENGTH) {
    const truncated = cleaned.substring(0, MAX_NAME_LENGTH);
    const lastSpace = truncated.lastIndexOf(" ");
    cleaned = lastSpace > 30 ? truncated.substring(0, lastSpace) : truncated;
  }

  return cleaned;
}

// Cache configuration
const BARCODE_CACHE_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes - consider cached data fresh
const BARCODE_CACHE_GC_TIME_MS = 30 * 60 * 1000; // 30 minutes - keep in memory

// Query key factory for barcode lookups
export const barcodeQueryKeys = {
  all: ["barcode"] as const,
  lookup: (barcode: string) => ["barcode", barcode] as const,
};

// Fetch function for barcode lookup - shared between mutation and direct calls
async function fetchBarcode(barcode: string): Promise<ScannedProduct | null> {
  // Validate barcode format
  if (!barcode || barcode.length < 8) {
    throw {
      type: "invalid_barcode",
      message: "Invalid barcode format. Please try scanning again.",
    } as ScannerError;
  }

  // Check if offline
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw {
      type: "network_offline",
      message: "You appear to be offline. Please check your connection.",
    } as ScannerError;
  }

  // Call server function with timeout
  // Server handles mock vs real based on VITE_USE_MOCK_BARCODE env var
  try {
    const result = await Promise.race([
      lookupBarcode({ data: { barcode } }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject({
              type: "api_error",
              message: "Request timed out. Please try again.",
            } as ScannerError),
          LOOKUP_TIMEOUT_MS
        )
      ),
    ]);

    if (!result) return null;

    // Map BarcodeProduct to ScannedProduct with cleaned name
    return {
      id: result.id,
      barcode: result.barcode,
      name: cleanProductName(result.name, result.brand),
      brand: result.brand,
      caloriesPer100g: result.caloriesPer100g,
      proteinG: result.proteinG,
      carbsG: result.carbsG,
      fatG: result.fatG,
      fiberG: result.fiberG,
      sugarG: result.sugarG,
      sodiumMg: result.sodiumMg,
      servingSizeG: result.servingSizeG,
      imageUrl: null,
      source: result.source as ScannedProduct["source"],
      verified: result.verified,
    };
  } catch (error) {
    // Transform server errors to ScannerError format
    throw {
      type: "api_error",
      message:
        error instanceof Error ? error.message : "Failed to lookup barcode",
    } as ScannerError;
  }
}

// Hook for barcode lookup with React Query caching
// Uses a mutation pattern for triggering lookups (user-initiated action),
// but leverages the query cache for storing results. This means:
// - Same barcode scanned twice = instant (uses cached result)
// - Cache survives component remounts
// - Works with React Query devtools for debugging
export function useBarcodeLookup() {
  const queryClient = useQueryClient();

  return useMutation<ScannedProduct | null, ScannerError, string>({
    mutationFn: async (barcode: string) => {
      // Check cache first - return immediately if we have fresh data
      const cachedData = queryClient.getQueryData<ScannedProduct | null>(
        barcodeQueryKeys.lookup(barcode)
      );

      const queryState = queryClient.getQueryState(
        barcodeQueryKeys.lookup(barcode)
      );

      // If we have cached data and it's still fresh, return it immediately
      if (cachedData !== undefined && queryState?.dataUpdatedAt) {
        const age = Date.now() - queryState.dataUpdatedAt;
        if (age < BARCODE_CACHE_STALE_TIME_MS) {
          return cachedData;
        }
      }

      // No cache or stale - fetch fresh data
      const result = await fetchBarcode(barcode);

      // Store in query cache for future lookups
      queryClient.setQueryData(barcodeQueryKeys.lookup(barcode), result, {
        updatedAt: Date.now(),
      });

      // Set garbage collection time
      queryClient.setQueryDefaults(barcodeQueryKeys.lookup(barcode), {
        gcTime: BARCODE_CACHE_GC_TIME_MS,
      });

      return result;
    },
  });
}

// Prime the barcode cache with product data (e.g., from recently scanned items)
// This allows instant lookups for products we already know about
export function usePrimeBarcodeCache() {
  const queryClient = useQueryClient();

  return (products: ScannedProduct[]) => {
    products.forEach((product) => {
      queryClient.setQueryData(
        barcodeQueryKeys.lookup(product.barcode),
        product,
        { updatedAt: Date.now() }
      );
    });
  };
}
