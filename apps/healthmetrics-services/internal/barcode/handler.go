package barcode

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/openfoodfacts/openfoodfacts-go"
)

type FoodItemNutrients struct {
	CaloriesKcal float64  `json:"calories_kcal"`
	ProteinG     float64  `json:"protein_g"`
	CarbsG       float64  `json:"carbs_g"`
	FatG         float64  `json:"fat_g"`
	FiberG       *float64 `json:"fiber_g"`  // nullable when upstream is missing
	SugarG       *float64 `json:"sugar_g"`  // nullable when upstream is missing
	SodiumG      *float64 `json:"sodium_g"` // nullable when upstream is missing
}

type FoodItem struct {
	ID          string            `json:"id"`
	Barcode     string            `json:"barcode"`
	Name        string            `json:"name"`
	Brand       string            `json:"brand"`
	ServingSize string            `json:"serving_size"`
	Nutrients   FoodItemNutrients `json:"nutrients"`
	ImageUrl    string            `json:"image_url"`
}

// baseDelay = the starting wait time before the first retry. It sets how quickly you retry after the first failure.
// maxDelay = the cap on exponential backoff. As retries keep failing, the delay doubles until it hits this ceiling.
// Example with baseDelay=200ms, maxDelay=2s:
// attempt 1 fails → wait 200ms
// attempt 2 fails → wait 400ms
// attempt 3 fails → wait 800ms
// attempt 4 fails → wait 1.6s
// attempt 5 fails → would be 3.2s, but we cap at 2s
type RetryConfig struct {
	MaxAttempts int
	BaseDelay   time.Duration
	MaxDelay    time.Duration
}

// ProductFetcher lets us swap the upstream client in tests (real client in prod, fake in tests)
type ProductFetcher interface {
	Product(code string) (*openfoodfacts.Product, error)
}

var digitOnlyRegex = regexp.MustCompile("^[0-9]+$")

// Allow tests to swap DB helpers without changing production logic.
var (
	getFoodItemByBarcodeFunc = getFoodItemByBarcode // default: real DB fetch
	upsertFoodItemFunc       = upsertFoodItem       // default: real DB write
)

// normalizeBarcode ensures a single canonical key for cache and DB storage.
// Example: UPC-A 12-digit "072745068393" becomes EAN-13 "0072745068393".
// This prevents duplicate rows for the same product when users scan UPC vs EAN.
func normalizeBarcode(code string) string {
	// Normalize UPC-A (12 digits) to EAN-13 by left-padding a 0.
	if len(code) == 12 {
		return "0" + code
	}
	return code
}

func supportsChecksum(length int) bool {
	switch length {
	case 8, 12, 13, 14:
		return true
	default:
		return false
	}
}

func isValidChecksum(code string) bool {
	sum := 0
	// UPC/EAN checksum: alternate weights 3 and 1 from the right, excluding the check digit.
	weight := 3

	// Steps:
	// len(code) - 2 to 0 (right to left, excluding check digit which is last digit).
	// The rightmost non-check digit (second-to-last overall) is position 1 (odd) by definition.
	for i := len(code) - 2; i >= 0; i-- {
		// a string is a slice of bytes in Go
		// code[i] is a byte (ASCII) not value. Example: '5'(53) - '0'(48) = 5.
		digit := int(code[i] - '0')
		sum += digit * weight
		if weight == 3 {
			weight = 1
		} else {
			weight = 3
		}
	}

	// sum is the total across all digits except the check digit
	// sum = 44 -> 44 % 10 = 4 -> 10 - 4 = 6 -> 6 % 10 = 6
	// sum = 50 -> 50 % 10 = 0 -> 10 - 0 = 10 -> 10 % 10 = 0
	checkDigit := (10 - (sum % 10)) % 10
	return checkDigit == int(code[len(code)-1]-'0')
}

func fetchProductWithRetry(api ProductFetcher, code string, cfg RetryConfig) (*openfoodfacts.Product, error) {
	// Goal: call OpenFoodFacts with retry + exponential backoff for transient errors.
	// "Transient" = network/server errors (not "product missing").
	// Example (MaxAttempts=3, BaseDelay=200ms, MaxDelay=2s):
	// - attempt 1: timeout -> wait 200ms
	// - attempt 2: 502 error -> wait 400ms
	// - attempt 3: success -> return product
	// If ErrNoProduct happens on attempt 1, return immediately (no retries).

	// Start with the config values (these may be zero if not set).
	maxAttempts := cfg.MaxAttempts
	if maxAttempts < 1 { // ensure we always try at least once
		maxAttempts = 1
	}

	// Base delay is the first backoff duration before retrying.
	baseDelay := cfg.BaseDelay
	if baseDelay <= 0 { // use a safe default if not provided
		baseDelay = 200 * time.Millisecond
	}

	// Max delay is the cap for exponential backoff.
	maxDelay := cfg.MaxDelay
	if maxDelay <= 0 { // use a safe default if not provided
		maxDelay = 2 * time.Second
	}

	var lastErr error // keep the last error so we can return it after retries
	// attempt starts at 1 so "attempt 1" means the very first call (no wait).
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		// Timeline example with MaxAttempts=3, BaseDelay=200ms:
		// t=0ms attempt1 -> error -> sleep 200ms
		// t=200ms attempt2 -> error -> sleep 400ms
		// t=600ms attempt3 -> success -> return
		// Try to fetch the product from OpenFoodFacts.
		product, err := api.Product(code)
		if err == nil { // success path
			return product, nil
		}
		// ErrNoProduct is not transient; do not retry it.
		if errors.Is(err, openfoodfacts.ErrNoProduct) {
			return nil, err
		}

		// Keep the last error so we can return it if all attempts fail.
		lastErr = err
		if attempt == maxAttempts { // no retries left
			break
		}

		// Exponential backoff: baseDelay * 2^(attempt-1), capped at maxDelay.
		// attempt=1 -> delay=baseDelay
		// attempt=2 -> delay=baseDelay*2
		// attempt=3 -> delay=baseDelay*4
		delay := baseDelay
		for i := 1; i < attempt; i++ { // double per attempt
			if delay >= maxDelay/2 { // avoid overflow and cap cleanly
				delay = maxDelay
				break
			}
			delay *= 2
		}
		if delay > maxDelay { // final safety cap
			delay = maxDelay
		}
		// Wait before retrying to avoid hammering the upstream API.
		time.Sleep(delay)
	}

	return nil, lastErr // return the final error if all retries fail
}

func mapProductToFoodItem(product *openfoodfacts.Product) FoodItem {
	// Convert the OpenFoodFacts product into the API response shape.
	return FoodItem{
		ID:          product.Id,          // OpenFoodFacts product ID
		Barcode:     product.Code,        // barcode string from upstream
		Name:        product.ProductName, // product name from upstream
		Brand:       product.Brands,      // brand string from upstream
		ServingSize: product.ServingSize, // serving size text from upstream
		Nutrients: FoodItemNutrients{
			CaloriesKcal: product.Nutriments.Energy100G,             // per-100g kcal
			ProteinG:     product.Nutriments.Proteins100G,           // per-100g protein (g)
			CarbsG:       product.Nutriments.Carbohydrates100G,      // per-100g carbs (g)
			FatG:         product.Nutriments.Fat100G,                // per-100g fat (g)
			FiberG:       floatOrNil(product.Nutriments.Fiber100G),  // per-100g fiber (g) or null
			SugarG:       floatOrNil(product.Nutriments.Sugars100G), // per-100g sugars (g) or null
			SodiumG:      floatOrNil(product.Nutriments.Sodium100G), // per-100g sodium (g) or null
		},
		ImageUrl: product.ImageURL.String(), // upstream image URL (may be empty)
	}
}

func floatOrNil(value float64) *float64 {
	// Treat zero as "missing" for optional nutrients (matches FE null handling).
	if value == 0 {
		return nil
	}
	// Return a pointer so JSON encodes a real number (not null).
	return &value
}

// Errors that come from OpenFoods API
func classifyUpstreamError(err error) string {
	// Distinguish common upstream error types for logging.
	if errors.Is(err, openfoodfacts.ErrNoProduct) {
		return "not_found"
	}
	var netErr net.Error
	if errors.As(err, &netErr) && netErr.Timeout() {
		return "timeout"
	}
	var syntaxErr *json.SyntaxError
	if errors.As(err, &syntaxErr) {
		return "parse_error"
	}
	var typeErr *json.UnmarshalTypeError
	if errors.As(err, &typeErr) {
		return "parse_error"
	}
	return "upstream_error"
}

func writeError(c *gin.Context, status int, code string, message string) {
	// Helper to keep error responses consistent across the handler.
	c.JSON(status, gin.H{"error": map[string]interface{}{ // wrap error in a predictable envelope
		"code":    code,    // short error code for programmatic checks
		"message": message, // human-readable message for debugging/UI
	}})
}

func NewHandler(api ProductFetcher, retryCfg RetryConfig, cacheTTL time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// This comes from the frontend when the user scans a barcode
		barcode := c.Param("code") // raw barcode from the URL
		isBarCodeValid := len(barcode) >= 8 && len(barcode) <= 14 && digitOnlyRegex.MatchString(barcode)

		if !isBarCodeValid {
			writeError(c, 400, "INVALID_BARCODE", "Barcode must be 8-14 digits") // invalid format
			return
		}
		if supportsChecksum(len(barcode)) && !isValidChecksum(barcode) {
			writeError(c, 400, "INVALID_BARCODE", "Invalid barcode checksum") // checksum failed
			return
		}

		normalizedBarcode := normalizeBarcode(barcode) // normalize to a consistent cache key

		// Pull the DB pool out of Gin context (set in main.go)
		poolValue, ok := c.Get("db")
		if !ok {
			writeError(c, 500, "INTERNAL_ERROR", "Database not configured")
			return
		}

		pool, ok := poolValue.(*pgxpool.Pool)
		if !ok || pool == nil {
			writeError(c, 500, "INTERNAL_ERROR", "Invalid database handle")
			return
		}

		// Look for a cached food item
		cachedItem, updatedAt, found, err := getFoodItemByBarcodeFunc(c.Request.Context(), pool, normalizedBarcode)
		if err != nil {
			writeError(c, 500, "INTERNAL_ERROR", "Failed to load cached item")
			return
		}

		if found {
			// If updated_at is within the TTL window, serve the cached item.
			if time.Since(updatedAt) <= cacheTTL {
				c.JSON(200, cachedItem)
				return
			}
			// Cache is stale -> fall through to upstream fetch.
		}

		// Make external API call to OpenFoodFacts
		product, err := fetchProductWithRetry(api, normalizedBarcode, retryCfg)
		if err != nil {
			// Log a simple upstream error classification for debugging.
			errorType := classifyUpstreamError(err)                                              // timeout/parse_error/upstream_error
			requestID := c.GetHeader("X-Request-ID")                                             // request ID for log correlation
			log.Printf("upstream_error request_id=%s type=%s err=%v", requestID, errorType, err) // log classification for debugging
			// ErrNoProduct is a sentinel error value (errors.New), so use errors.Is to detect it even if the library wraps the error.
			// ErrNoProduct is an error returned by Client.Product when the product could not be retrieved successfully.
			if errors.Is(err, openfoodfacts.ErrNoProduct) {
				writeError(c, 404, "NOT_FOUND", "Product not found") // upstream returned no product
				return
			}
			writeError(c, 502, "UPSTREAM_ERROR", fmt.Sprintf("Failed to fetch product from OpenFoodFacts: %v", err))
			return
		}
		if product == nil {
			writeError(c, 500, "INTERNAL_ERROR", "Unexpected empty product") // safety guard
			return
		}

		// Parse serving size for DB storage (fallback to 100g if unclear).
		servingSizeG, servingSizeUnit := parseServingSize(product.ServingSize)

		// Best-effort cache write: log and continue on error.
		if err := upsertFoodItemFunc(c.Request.Context(), pool, product, normalizedBarcode, servingSizeG, servingSizeUnit); err != nil {
			requestID := c.GetHeader("X-Request-ID")
			log.Printf("cache_write_error request_id=%s barcode=%s err=%v", requestID, barcode, err)
		}

		// Need to transform the OpenFoodFacts response into the FoodItem struct.
		foodItem := mapProductToFoodItem(product)
		foodItem.Barcode = normalizedBarcode // return the canonical barcode format

		c.JSON(200, foodItem)
	}
}
