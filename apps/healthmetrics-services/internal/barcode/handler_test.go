package barcode

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/openfoodfacts/openfoodfacts-go"
)

// fakeFetcher returns a fixed product/error and tracks how many times it was called.
type fakeFetcher struct {
	product *openfoodfacts.Product // product to return (if any)
	err     error                  // error to return (if any)
	calls   int                    // number of calls observed
}

// Product satisfies the ProductFetcher interface for tests.
func (f *fakeFetcher) Product(code string) (*openfoodfacts.Product, error) {
	f.calls++ // track how many times the handler calls upstream
	return f.product, f.err
}

// setupCacheStubs swaps cache helpers for tests and returns a cleanup function.
func setupCacheStubs(
	getFn func(context.Context, *pgxpool.Pool, string) (FoodItem, time.Time, bool, error), // fake cache read
	upsertFn func(context.Context, *pgxpool.Pool, *openfoodfacts.Product, string, float64, string) error, // fake cache write
) func() {
	origGet := getFoodItemByBarcodeFunc     // keep the real function
	origUpsert := upsertFoodItemFunc        // keep the real function
	getFoodItemByBarcodeFunc = getFn        // install test stub
	upsertFoodItemFunc = upsertFn           // install test stub
	return func() {                         // return a cleanup func
		getFoodItemByBarcodeFunc = origGet // restore real fetcher
		upsertFoodItemFunc = origUpsert    // restore real upsert
	}
}

// makeRouter wires a tiny Gin router with our handler for tests.
func makeRouter(fetcher ProductFetcher, retryCfg RetryConfig, cacheTTL time.Duration) *gin.Engine {
	gin.SetMode(gin.TestMode) // silence Gin output for tests
	router := gin.New()       // create a minimal router for unit tests
	router.Use(func(c *gin.Context) { // inject a dummy DB pool into context
		c.Set("db", &pgxpool.Pool{}) // zero-value pool is enough for stubbed helpers
		c.Next()                     // continue to the handler
	})
	router.GET("/v1/barcodes/:code", NewHandler(fetcher, retryCfg, cacheTTL)) // wire the handler under test
	return router // return the configured router
}

func TestHandler_InvalidBarcodeFormat(t *testing.T) {
	// Use a fetcher that would return success if called.
	fetcher := &fakeFetcher{product: &openfoodfacts.Product{}}
	// Keep retries at 1 so tests are fast.
	retryCfg := RetryConfig{MaxAttempts: 1, BaseDelay: time.Millisecond, MaxDelay: time.Millisecond}
	// Build the test router.
	cacheTTL := time.Hour // cache window for tests
	router := makeRouter(fetcher, retryCfg, cacheTTL)

	// This barcode has letters, so it should fail validation.
	req := httptest.NewRequest(http.MethodGet, "/v1/barcodes/ABC123", nil)
	rec := httptest.NewRecorder() // capture the HTTP response
	router.ServeHTTP(rec, req)    // execute the request against the router

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
	if fetcher.calls != 0 { // handler should exit before hitting upstream
		t.Fatalf("expected 0 upstream calls, got %d", fetcher.calls)
	}
}

func TestHandler_InvalidChecksum(t *testing.T) {
	// Use a fetcher that would return success if called.
	fetcher := &fakeFetcher{product: &openfoodfacts.Product{}}
	// Keep retries at 1 so tests are fast.
	retryCfg := RetryConfig{MaxAttempts: 1, BaseDelay: time.Millisecond, MaxDelay: time.Millisecond}
	// Build the test router.
	cacheTTL := time.Hour // cache window for tests
	router := makeRouter(fetcher, retryCfg, cacheTTL)

	// 4006381333931 is a known valid EAN-13; change last digit to make it invalid.
	req := httptest.NewRequest(http.MethodGet, "/v1/barcodes/4006381333930", nil)
	rec := httptest.NewRecorder() // capture the HTTP response
	router.ServeHTTP(rec, req)    // execute the request against the router

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
	if fetcher.calls != 0 { // checksum failure should not call upstream
		t.Fatalf("expected 0 upstream calls, got %d", fetcher.calls)
	}
}

func TestMapProductToFoodItem(t *testing.T) {
	// Build a minimal product with nutriments populated.
	product := &openfoodfacts.Product{ // build a minimal upstream product
		Id:          "id_1",
		Code:        "12345678",
		ProductName: "Test Product",
		Brands:      "Test Brand",
		ServingSize: "100g",
		Nutriments: openfoodfacts.Nutriment{ // use the upstream Nutriment struct
			Energy100G:        120,
			Proteins100G:      3,
			Carbohydrates100G: 20,
			Fat100G:           5,
			Fiber100G:         2,
			Sugars100G:        8,
			Sodium100G:        0.5,
		},
	}

	// Map to API response shape.
	item := mapProductToFoodItem(product) // map upstream product into API response

	if item.Barcode != "12345678" {
		t.Fatalf("expected barcode to map from upstream")
	}
	if item.Nutrients.CaloriesKcal != 120 {
		t.Fatalf("expected calories to map from upstream")
	}
}

func TestHandler_UpstreamNotFound(t *testing.T) {
	// Return the sentinel ErrNoProduct to simulate a 404 upstream result.
	fetcher := &fakeFetcher{err: openfoodfacts.ErrNoProduct}
	retryCfg := RetryConfig{MaxAttempts: 1, BaseDelay: time.Millisecond, MaxDelay: time.Millisecond}
	cacheTTL := time.Hour // cache window for tests
	cleanup := setupCacheStubs( // stub cache read to a miss
		func(context.Context, *pgxpool.Pool, string) (FoodItem, time.Time, bool, error) {
			return FoodItem{}, time.Time{}, false, nil // cache miss
		},
		func(context.Context, *pgxpool.Pool, *openfoodfacts.Product, string, float64, string) error {
			return nil // no-op cache write
		},
	)
	defer cleanup()                           // restore real helpers
	router := makeRouter(fetcher, retryCfg, cacheTTL)

	req := httptest.NewRequest(http.MethodGet, "/v1/barcodes/123456789", nil) // 9 digits skips checksum validation
	rec := httptest.NewRecorder() // capture the HTTP response
	router.ServeHTTP(rec, req)    // execute the request against the router

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rec.Code)
	}
}

func TestHandler_UpstreamError(t *testing.T) {
	// Return a generic error to simulate a 5xx upstream failure.
	fetcher := &fakeFetcher{err: errors.New("upstream boom")}
	retryCfg := RetryConfig{MaxAttempts: 1, BaseDelay: time.Millisecond, MaxDelay: time.Millisecond}
	cacheTTL := time.Hour // cache window for tests
	cleanup := setupCacheStubs( // stub cache read to a miss
		func(context.Context, *pgxpool.Pool, string) (FoodItem, time.Time, bool, error) {
			return FoodItem{}, time.Time{}, false, nil // cache miss
		},
		func(context.Context, *pgxpool.Pool, *openfoodfacts.Product, string, float64, string) error {
			return nil // no-op cache write
		},
	)
	defer cleanup()                           // restore real helpers
	router := makeRouter(fetcher, retryCfg, cacheTTL)

	req := httptest.NewRequest(http.MethodGet, "/v1/barcodes/123456789", nil) // 9 digits skips checksum validation
	rec := httptest.NewRecorder() // capture the HTTP response
	router.ServeHTTP(rec, req)    // execute the request against the router

	if rec.Code != http.StatusBadGateway {
		t.Fatalf("expected 502, got %d", rec.Code)
	}
}

func TestHandler_UpstreamSuccess(t *testing.T) {
	// Return a simple product to simulate a successful upstream response.
	fetcher := &fakeFetcher{product: &openfoodfacts.Product{ // fake success response
		Id:          "id_1",
		Code:        "123456789",
		ProductName: "Test Product",
	}}
	retryCfg := RetryConfig{MaxAttempts: 1, BaseDelay: time.Millisecond, MaxDelay: time.Millisecond}
	cacheTTL := time.Hour // cache window for tests
	cleanup := setupCacheStubs( // stub cache read to a miss
		func(context.Context, *pgxpool.Pool, string) (FoodItem, time.Time, bool, error) {
			return FoodItem{}, time.Time{}, false, nil // cache miss
		},
		func(context.Context, *pgxpool.Pool, *openfoodfacts.Product, string, float64, string) error {
			return nil // no-op cache write
		},
	)
	defer cleanup()                           // restore real helpers
	router := makeRouter(fetcher, retryCfg, cacheTTL)

	req := httptest.NewRequest(http.MethodGet, "/v1/barcodes/123456789", nil) // 9 digits skips checksum validation
	rec := httptest.NewRecorder() // capture the HTTP response
	router.ServeHTTP(rec, req)    // execute the request against the router

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var body FoodItem // decode the JSON response into the response struct
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if body.Name != "Test Product" {
		t.Fatalf("expected product name to match")
	}
}

// scriptedFetcher returns a sequence of results to simulate retries.
type scriptedFetcher struct {
	results []fetchResult // ordered list of responses/errors
	calls   int           // track how many times Product was called
}

// fetchResult is a single scripted response for the fake upstream.
type fetchResult struct {
	product *openfoodfacts.Product // product to return
	err     error                  // error to return
}

// Product returns the next scripted result each time it is called.
func (s *scriptedFetcher) Product(code string) (*openfoodfacts.Product, error) {
	if s.calls >= len(s.results) { // if we run out, keep returning the last result
		last := s.results[len(s.results)-1]
		s.calls++
		return last.product, last.err
	}
	result := s.results[s.calls]
	s.calls++
	return result.product, result.err
}

func TestFetchProductWithRetry_RetriesThenSucceeds(t *testing.T) {
	// First two calls fail, third succeeds.
	fetcher := &scriptedFetcher{
		results: []fetchResult{
			{err: errors.New("timeout")},
			{err: errors.New("timeout")},
			{product: &openfoodfacts.Product{Id: "id_1"}},
		},
	}

	// Use tiny delays so the test runs quickly.
	cfg := RetryConfig{
		MaxAttempts: 3,
		BaseDelay:   time.Millisecond,
		MaxDelay:    time.Millisecond,
	}

	product, err := fetchProductWithRetry(fetcher, "12345678", cfg)
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}
	if product == nil {
		t.Fatalf("expected product, got nil")
	}
	if fetcher.calls != 3 {
		t.Fatalf("expected 3 attempts, got %d", fetcher.calls)
	}
}

func TestHandler_CacheHitFresh(t *testing.T) {
	// Cache hit should short-circuit upstream calls.
	fetcher := &fakeFetcher{product: &openfoodfacts.Product{Id: "id_1"}} // upstream should not be called
	retryCfg := RetryConfig{MaxAttempts: 1, BaseDelay: time.Millisecond, MaxDelay: time.Millisecond}
	cacheTTL := time.Hour // allow fresh cache within 1 hour
	cached := FoodItem{Name: "Cached Item"} // cached response
	updatedAt := time.Now()                 // mark cache as fresh
	cleanup := setupCacheStubs(
		func(context.Context, *pgxpool.Pool, string) (FoodItem, time.Time, bool, error) {
			return cached, updatedAt, true, nil // return a fresh cached item
		},
		func(context.Context, *pgxpool.Pool, *openfoodfacts.Product, string, float64, string) error {
			return nil // no-op cache write
		},
	)
	defer cleanup()                           // restore real helpers
	router := makeRouter(fetcher, retryCfg, cacheTTL)

	req := httptest.NewRequest(http.MethodGet, "/v1/barcodes/123456789", nil) // 9 digits skips checksum
	rec := httptest.NewRecorder()                                           // capture the HTTP response
	router.ServeHTTP(rec, req)                                              // execute the request

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if fetcher.calls != 0 {
		t.Fatalf("expected 0 upstream calls, got %d", fetcher.calls)
	}
}

func TestHandler_CacheHitStale(t *testing.T) {
	// Stale cache should fall through to upstream.
	fetcher := &fakeFetcher{product: &openfoodfacts.Product{Id: "id_1", ProductName: "Fresh"}} // upstream response
	retryCfg := RetryConfig{MaxAttempts: 1, BaseDelay: time.Millisecond, MaxDelay: time.Millisecond}
	cacheTTL := time.Hour                   // cache is only valid for 1 hour
	updatedAt := time.Now().Add(-2 * time.Hour) // mark cache as stale
	upsertCalls := 0                         // track cache writes
	cleanup := setupCacheStubs(
		func(context.Context, *pgxpool.Pool, string) (FoodItem, time.Time, bool, error) {
			return FoodItem{Name: "Old"}, updatedAt, true, nil // stale cached item
		},
		func(context.Context, *pgxpool.Pool, *openfoodfacts.Product, string, float64, string) error {
			upsertCalls++ // record that we attempted a cache write
			return nil    // no-op cache write
		},
	)
	defer cleanup()                           // restore real helpers
	router := makeRouter(fetcher, retryCfg, cacheTTL)

	req := httptest.NewRequest(http.MethodGet, "/v1/barcodes/123456789", nil) // 9 digits skips checksum
	rec := httptest.NewRecorder()                                           // capture the HTTP response
	router.ServeHTTP(rec, req)                                              // execute the request

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if fetcher.calls != 1 {
		t.Fatalf("expected 1 upstream call, got %d", fetcher.calls)
	}
	if upsertCalls != 1 {
		t.Fatalf("expected 1 cache write, got %d", upsertCalls)
	}
}

// fakeTimeoutError simulates a net.Error timeout for classification tests.
type fakeTimeoutError struct{}

func (fakeTimeoutError) Error() string { return "timeout" }       // satisfy error interface
func (fakeTimeoutError) Timeout() bool { return true }            // mark as timeout
func (fakeTimeoutError) Temporary() bool { return true }          // required by net.Error

func TestClassifyUpstreamError(t *testing.T) {
	// Not found should classify as "not_found".
	if got := classifyUpstreamError(openfoodfacts.ErrNoProduct); got != "not_found" {
		t.Fatalf("expected not_found, got %s", got)
	}

	// Timeout should classify as "timeout".
	if got := classifyUpstreamError(fakeTimeoutError{}); got != "timeout" {
		t.Fatalf("expected timeout, got %s", got)
	}

	// JSON parse errors should classify as "parse_error".
	if got := classifyUpstreamError(&json.SyntaxError{}); got != "parse_error" {
		t.Fatalf("expected parse_error, got %s", got)
	}

	// Other errors should classify as "upstream_error".
	if got := classifyUpstreamError(errors.New("boom")); got != "upstream_error" {
		t.Fatalf("expected upstream_error, got %s", got)
	}
}

func TestNormalizeBarcode(t *testing.T) {
	// UPC-A (12 digits) should be left-padded to EAN-13.
	if got := normalizeBarcode("072745068393"); got != "0072745068393" {
		t.Fatalf("expected EAN-13 normalization, got %s", got)
	}
	// EAN-13 should remain unchanged.
	if got := normalizeBarcode("0072745068393"); got != "0072745068393" {
		t.Fatalf("expected no change, got %s", got)
	}
}
