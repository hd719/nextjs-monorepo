import { useMutation } from "@tanstack/react-query";
import { lookupBarcode } from "@/server";
import type { ScannedProduct, ScannerError } from "@/types";

const LOOKUP_TIMEOUT_MS = 10000; // 10 second timeout

export function useBarcodeLookup() {
  return useMutation<ScannedProduct | null, ScannerError, string>({
    mutationFn: async (barcode: string) => {
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

        // Map BarcodeProduct to ScannedProduct
        return {
          id: result.id,
          barcode: result.barcode,
          name: result.name,
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
    },
  });
}
