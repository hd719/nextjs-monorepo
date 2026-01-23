import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-config";
import { createLogger } from "@/lib/logger";
import { mockBarcodeLookup } from "@/data";

const log = createLogger("server:barcode");

// ============================================================================
// CONFIGURATION
// ============================================================================

// Go service URL (barcode + integrations).
const GO_SERVICE_URL = process.env.GO_SERVICE_URL;

// API key for service-to-service authentication with Go service
const BARCODE_SERVICE_API_KEY = process.env.BARCODE_SERVICE_API_KEY;

// Use mock data instead of calling Go service (for development/testing)
const USE_MOCK_BARCODE = process.env.VITE_USE_MOCK_BARCODE;

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const lookupBarcodeSchema = z.object({
  barcode: z.string().min(8, "Barcode must be at least 8 characters"),
});

const recordBarcodeScanSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  barcode: z.string().min(8, "Barcode must be at least 8 characters"),
  foodItemId: z.string().uuid().optional(),
});

const getRecentScansSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  limit: z.number().min(1).max(50).optional().default(10),
});

// ============================================================================
// TYPES
// ============================================================================

/**
 * Product data returned from Go barcode service
 */
export interface BarcodeProduct {
  id: string;
  barcode: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
  servingSizeG: number;
  source: string;
  verified: boolean;
}

/**
 * Recent scan with optional food item details
 */
export interface RecentScan {
  id: string;
  barcode: string;
  scannedAt: Date;
  foodItem: BarcodeProduct | null;
}

/**
 * Response shape from Go barcode service
 */
interface GoServiceResponse {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  serving_size: string;
  nutrients: {
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number | null; // optional nutrient may be missing upstream
    sugar_g: number | null; // optional nutrient may be missing upstream
    sodium_g: number | null; // optional nutrient may be missing upstream
  };
  image_url: string;
}

/**
 * Error response from Go barcode service
 */
interface GoServiceError {
  error: {
    code: string;
    message: string;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique request ID for tracing/debugging
 * Format: req_{timestamp}_{random}
 */
function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${random}`;
}

/**
 * Parse serving size string to grams (e.g., "240ml" -> 240, "100g" -> 100)
 */
function parseServingSizeG(servingSize: string): number {
  const match = servingSize.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 100;
}

/**
 * Transform Go service response to BarcodeProduct
 */
function transformGoResponse(data: GoServiceResponse): BarcodeProduct {
  return {
    id: data.id,
    barcode: data.barcode,
    name: data.name,
    brand: data.brand || null,
    caloriesPer100g: data.nutrients.calories_kcal,
    proteinG: data.nutrients.protein_g,
    carbsG: data.nutrients.carbs_g,
    fatG: data.nutrients.fat_g,
    fiberG: data.nutrients.fiber_g ?? null, // preserve 0, treat null as unknown
    sugarG: data.nutrients.sugar_g ?? null, // preserve 0, treat null as unknown
    sodiumMg:
      data.nutrients.sodium_g != null // only convert when a value is present
        ? data.nutrients.sodium_g * 1000 // convert g -> mg for UI consistency
        : null, // unknown sodium
    servingSizeG: parseServingSizeG(data.serving_size),
    source: "open_food_facts",
    verified: true,
  };
}

// ============================================================================
// SERVER FUNCTIONS
// ============================================================================

/**
 * Look up a product by barcode
 *
 * If VITE_USE_MOCK_BARCODE=true, uses mock data for development/testing.
 * Otherwise, calls the Go microservice which handles:
 * - Barcode validation
 * - Cache check (Postgres)
 * - OpenFoodFacts API call
 * - Persistence to food_items table
 *
 * Authentication:
 * - API Key: Sent via X-API-Key header to prove request is from this app
 * - JWT: Forwarded via Authorization header so Go can verify user identity
 * - User ID: Sent via X-User-ID header for auditing/logging
 * - Request ID: Sent via X-Request-ID header for tracing
 *
 * Returns the product if found, null if not found
 */
export const lookupBarcode = createServerFn({ method: "GET" })
  .inputValidator((data: { barcode: string }) => {
    return lookupBarcodeSchema.parse(data);
  })
  .handler(async ({ data: { barcode } }): Promise<BarcodeProduct | null> => {
    // Generate request ID for tracing across services
    const requestId = generateRequestId();

    if (USE_MOCK_BARCODE === "true") {
      log.info({ barcode, requestId }, "Using mock barcode lookup");
      const mockProduct = await mockBarcodeLookup(barcode);

      if (!mockProduct) {
        log.info({ barcode, requestId }, "Product not found in mock data");
        return null;
      }

      log.info(
        { barcode, requestId, productName: mockProduct.name },
        "Product found in mock data"
      );

      return {
        id: mockProduct.id,
        barcode: mockProduct.barcode,
        name: mockProduct.name,
        brand: mockProduct.brand,
        caloriesPer100g: mockProduct.caloriesPer100g,
        proteinG: mockProduct.proteinG,
        carbsG: mockProduct.carbsG,
        fatG: mockProduct.fatG,
        fiberG: mockProduct.fiberG,
        sugarG: mockProduct.sugarG,
        sodiumMg: mockProduct.sodiumMg,
        servingSizeG: mockProduct.servingSizeG,
        source: mockProduct.source,
        verified: mockProduct.verified,
      };
    }

    // Get the user session for authentication
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    // User must be authenticated to call the barcode service
    if (!session) {
      log.warn(
        { barcode, requestId },
        "Unauthenticated barcode lookup attempt"
      );
      throw new Error("Authentication required");
    }

    const userId = session.user.id;
    // Get the session token (JWT) from the cookie header for forwarding
    // Better Auth stores the token in the session cookie
    const cookieHeader = headers.get("cookie") || "";

    // Call Go service for real data
    if (!GO_SERVICE_URL) {
      throw new Error("GO_SERVICE_URL is required for barcode lookups");
    }

    const url = `${GO_SERVICE_URL}/v1/barcodes/${barcode}`;

    try {
      log.info(
        { barcode, requestId, userId, url },
        "Calling Go barcode service"
      );

      // Build authentication headers for Go service
      const serviceHeaders: Record<string, string> = {
        Accept: "application/json",
        "X-Request-ID": requestId,
        "X-User-ID": userId,
      };

      // Add API key if configured (required for production)
      if (BARCODE_SERVICE_API_KEY) {
        serviceHeaders["X-API-Key"] = BARCODE_SERVICE_API_KEY;
      } else {
        log.warn(
          { requestId },
          "BARCODE_SERVICE_API_KEY not configured - service-to-service auth disabled"
        );
      }

      // Forward cookie header so Go service can validate the session JWT
      // The Go service will verify the JWT signature using the shared secret
      if (cookieHeader) {
        serviceHeaders["Cookie"] = cookieHeader;
      }

      console.log("serviceHeaders", serviceHeaders);

      const response = await fetch(url, {
        method: "GET",
        headers: serviceHeaders,
      });

      // Authentication/authorization errors from Go service
      if (response.status === 401) {
        log.warn(
          { barcode, requestId, userId },
          "Go service rejected authentication"
        );
        throw new Error("Authentication failed");
      }

      if (response.status === 403) {
        log.warn(
          { barcode, requestId, userId },
          "Go service rejected authorization"
        );
        throw new Error("Not authorized to access this resource");
      }

      // Product not found
      if (response.status === 404) {
        log.info({ barcode, requestId }, "Product not found in Go service");
        return null;
      }

      // Invalid barcode
      if (response.status === 400) {
        const errorData = (await response.json()) as GoServiceError;
        log.warn(
          { barcode, requestId, error: errorData.error },
          "Invalid barcode rejected by Go service"
        );
        throw new Error(errorData.error.message);
      }

      // Upstream error (OpenFoodFacts down, etc.)
      if (response.status === 502) {
        const errorData = (await response.json()) as GoServiceError;
        log.error(
          { barcode, requestId, error: errorData.error },
          "Go service upstream error"
        );
        throw new Error("Unable to lookup product. Please try again later.");
      }

      // Other errors
      if (!response.ok) {
        log.error(
          { barcode, requestId, status: response.status },
          "Unexpected error from Go service"
        );
        throw new Error("Failed to lookup barcode");
      }

      // Success - transform and return
      const data = (await response.json()) as GoServiceResponse;
      const product = transformGoResponse(data);

      log.info(
        { barcode, requestId, productName: product.name },
        "Product found via Go service"
      );

      return product;
    } catch (error) {
      // Re-throw known errors
      if (error instanceof Error) {
        throw error;
      }

      log.error(
        { err: error, barcode, requestId },
        "Failed to call Go barcode service"
      );
      throw new Error("Failed to lookup barcode");
    }
  });

/**
 * Record a barcode scan for analytics and history
 *
 * This stays in TypeScript as it's part of the analytics domain,
 * not the barcode lookup domain owned by Go.
 */
export const recordBarcodeScan = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { userId: string; barcode: string; foodItemId?: string }) => {
      return recordBarcodeScanSchema.parse(data);
    }
  )
  .handler(
    async ({
      data: { userId, barcode, foodItemId },
    }): Promise<{ id: string }> => {
      try {
        const scan = await prisma.barcodeScan.create({
          data: {
            userId,
            barcode,
            foodItemId: foodItemId || null,
          },
        });

        log.info({ userId, barcode, scanId: scan.id }, "Barcode scan recorded");

        return { id: scan.id };
      } catch (error) {
        log.error(
          { err: error, userId, barcode },
          "Failed to record barcode scan"
        );
        throw new Error("Failed to record barcode scan");
      }
    }
  );

/**
 * Get a user's recent barcode scans with product details
 *
 * This stays in TypeScript as it's part of the analytics domain.
 */
export const getRecentScans = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string; limit?: number }) => {
    return getRecentScansSchema.parse(data);
  })
  .handler(async ({ data: { userId, limit } }): Promise<RecentScan[]> => {
    try {
      const scans = await prisma.barcodeScan.findMany({
        where: { userId },
        orderBy: { scannedAt: "desc" },
        take: limit,
        include: {
          foodItem: true,
        },
      });

      return scans.map((scan) => ({
        id: scan.id,
        barcode: scan.barcode,
        scannedAt: scan.scannedAt,
        foodItem: scan.foodItem
          ? {
              id: scan.foodItem.id,
              barcode: scan.foodItem.barcode!,
              name: scan.foodItem.name,
              brand: scan.foodItem.brand,
              caloriesPer100g: Number(scan.foodItem.caloriesPer100g),
              proteinG: Number(scan.foodItem.proteinG),
              carbsG: Number(scan.foodItem.carbsG),
              fatG: Number(scan.foodItem.fatG),
              fiberG: scan.foodItem.fiberG
                ? Number(scan.foodItem.fiberG)
                : null,
              sugarG: scan.foodItem.sugarG
                ? Number(scan.foodItem.sugarG)
                : null,
              sodiumMg: scan.foodItem.sodiumMg
                ? Number(scan.foodItem.sodiumMg)
                : null,
              servingSizeG: Number(scan.foodItem.servingSizeG),
              source: scan.foodItem.source,
              verified: scan.foodItem.verified,
            }
          : null,
      }));
    } catch (error) {
      log.error({ err: error, userId }, "Failed to get recent scans");
      throw new Error("Failed to get recent barcode scans");
    }
  });
