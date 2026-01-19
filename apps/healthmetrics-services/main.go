package main

import (
	"context"
	"healthmetrics-services/internal/auth"
	"healthmetrics-services/internal/barcode"
	"healthmetrics-services/internal/db"
	"healthmetrics-services/ratelimiter"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"github.com/openfoodfacts/openfoodfacts-go"
)

type limiterEntry struct {
	bucket   *ratelimiter.TokenBucket // the per-user token bucket
	lastSeen time.Time                // last time we saw a request from this user
}

type limiterStore struct {
	// Buckets keyed by user ID:
	// {"user_123": {bucket: {capacity: 10_000_000, tokens: 9_000_000, refillRate: 1, lastRefill: 2024-01-01T00:00:00Z}, lastSeen: 2024-01-01T00:05:00Z}}
	mu      sync.Mutex
	buckets map[string]*limiterEntry // one bucket per user for fair rate limiting
}

func newLimiterStore() *limiterStore {
	// Initializes the in-memory map for user buckets.
	return &limiterStore{
		buckets: make(map[string]*limiterEntry),
	}
}

func (s *limiterStore) Get(userID string, capacity, refillRate float64) *ratelimiter.TokenBucket {
	// Lock while reading/writing the map to avoid concurrent map writes.
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now() // capture the current time once for this request

	// If we already have a bucket for this user, reuse it and update lastSeen.
	if entry, ok := s.buckets[userID]; ok {
		entry.lastSeen = now // mark user as active
		return entry.bucket  // reuse the existing bucket
	}

	// New user seen: create a bucket with the current rate-limit settings.
	bucket := ratelimiter.NewTokenBucket(capacity, refillRate) // create a fresh bucket
	s.buckets[userID] = &limiterEntry{                         // store it in the map
		bucket:   bucket, // bucket instance for this user
		lastSeen: now,    // mark as active now
	}

	return bucket
}

func getDBConfig() db.Config {
	return db.Config{
		DatabaseURL:     os.Getenv("DATABASE_URL"), // required
		MaxConns:        10,                        // safe default
		MinConns:        2,                         // keep a couple of idle conns
		MaxConnLifetime: 30 * time.Minute,          // recycle long-lived conns
		MaxConnIdleTime: 5 * time.Minute,           // close idle conns
	}
}

func getAuthConfig() auth.Config {
	return auth.Config{
		APIKey:     os.Getenv("BARCODE_SERVICE_API_KEY"),
		CookieName: os.Getenv("BETTER_AUTH_COOKIE_NAME"),
	}
}

// We create getCacheTTL() to turn a human‑friendly env var (BARCODE_CACHE_TTL_DAYS)
// into a Go duration we can compare against updated_at
func getCacheTTL() time.Duration { // read cache TTL from env
	ttlDays := 7                                                   // default to 7 days
	if value := os.Getenv("BARCODE_CACHE_TTL_DAYS"); value != "" { // read env if set
		if parsed, err := strconv.Atoi(value); err == nil && parsed > 0 { // parse positive int
			ttlDays = parsed // override default
		}
	}
	return time.Duration(ttlDays) * 24 * time.Hour // convert days to duration
}

func getRateLimitConfig() (float64, float64) {
	// Defaults: capacity=10 burst, refillRate=1 token/sec (~60/min).
	capacity := 10.0
	refillRate := 1.0

	if value := os.Getenv("RATE_LIMIT_CAPACITY"); value != "" {
		if parsed, err := strconv.ParseFloat(value, 64); err == nil && parsed > 0 {
			capacity = parsed
		}
	}

	if value := os.Getenv("RATE_LIMIT_REFILL_RATE"); value != "" {
		if parsed, err := strconv.ParseFloat(value, 64); err == nil && parsed > 0 {
			refillRate = parsed
		}
	}

	return capacity, refillRate
}

func getOpenFoodFactsConfig() (time.Duration, string, barcode.RetryConfig, string) {
	// Default timeout for the OpenFoodFacts HTTP client.
	timeout := 5 * time.Second
	if value := os.Getenv("OPENFOODFACTS_TIMEOUT"); value != "" { // read from env if provided
		if parsed, err := time.ParseDuration(value); err == nil && parsed > 0 {
			timeout = parsed // override default when valid
		}
	}

	// Optional user agent string used to identify this service to OpenFoodFacts.
	userAgent := os.Getenv("OPENFOODFACTS_USER_AGENT")

	// Optional base URL (library only supports live vs sandbox; we map net -> sandbox).
	baseURL := os.Getenv("OPENFOODFACTS_BASE_URL")

	// Default retry behavior for upstream failures.
	retryCfg := barcode.RetryConfig{
		MaxAttempts: 3,                      // total attempts including the first call
		BaseDelay:   200 * time.Millisecond, // starting backoff delay
		MaxDelay:    2 * time.Second,        // cap for exponential backoff
	}

	if value := os.Getenv("OPENFOODFACTS_RETRY_MAX_ATTEMPTS"); value != "" { // max attempts override
		if parsed, err := strconv.Atoi(value); err == nil && parsed > 0 {
			retryCfg.MaxAttempts = parsed
		}
	}

	if value := os.Getenv("OPENFOODFACTS_RETRY_BASE_DELAY"); value != "" { // base delay override
		if parsed, err := time.ParseDuration(value); err == nil && parsed > 0 {
			retryCfg.BaseDelay = parsed
		}
	}

	if value := os.Getenv("OPENFOODFACTS_RETRY_MAX_DELAY"); value != "" { // max delay override
		if parsed, err := time.ParseDuration(value); err == nil && parsed > 0 {
			retryCfg.MaxDelay = parsed
		}
	}

	return timeout, userAgent, retryCfg, baseURL // pass settings back to main
}

func validateStartupConfig(authCfg auth.Config) {
	// These env vars are required for auth middleware to function.
	required := map[string]string{
		"BARCODE_SERVICE_API_KEY": authCfg.APIKey,
		"BETTER_AUTH_COOKIE_NAME": authCfg.CookieName,
		"DATABASE_URL":            os.Getenv("DATABASE_URL"), // DB connection is required now
	}

	var missing []string               // track which required vars are empty
	for key, value := range required { // scan every required env var
		if value == "" { // empty means not set or blank
			missing = append(missing, key) // collect missing keys for the error message
		}
	}

	if len(missing) > 0 {
		// Fail fast if required config is missing so we don't serve insecurely.
		log.Printf("startup_error missing_env=%s", strings.Join(missing, ","))
		os.Exit(1)
	}
}

func logStartupSummary(authCfg auth.Config, capacity, refillRate float64, timeout time.Duration, userAgent string, retryCfg barcode.RetryConfig, baseURL string) {
	// Log a safe summary without printing secrets.
	log.Printf("startup_config api_key_set=%t cookie_name=%s",
		authCfg.APIKey != "", authCfg.CookieName)
	// Log rate-limit config so operators can verify limits.
	log.Printf("startup_config rate_limit_capacity=%.2f rate_limit_refill_rate=%.2f",
		capacity, refillRate)
	// Log OpenFoodFacts config to confirm timeouts and retry policy.
	log.Printf("startup_config off_timeout=%s off_user_agent_set=%t off_retry_attempts=%d off_retry_base=%s off_retry_max=%s off_base_url=%s",
		timeout, userAgent != "", retryCfg.MaxAttempts, retryCfg.BaseDelay, retryCfg.MaxDelay, baseURL)
}

func (s *limiterStore) Cleanup(ttl time.Duration) {
	s.mu.Lock()         // lock the map while we iterate/delete
	defer s.mu.Unlock() // unlock when we're done

	// Users inactive before this time are removed
	cutoff := time.Now().Add(-ttl) // Passing a negative duration is the standard way to subtract time in Go

	for userID, entry := range s.buckets { // scan all buckets
		if entry.lastSeen.Before(cutoff) { // if user is idle beyond TTL
			delete(s.buckets, userID) // remove to avoid unbounded growth
		}
	}
}

func main() {
	router := gin.Default()
	authCfg := getAuthConfig()     // load auth envs early for validation
	validateStartupConfig(authCfg) // fail fast if required envs are missing

	dbCfg := getDBConfig()                               // read DB env + defaults
	pool, err := db.NewPool(context.Background(), dbCfg) // create/ping pool
	if err != nil {
		log.Fatalf("db_error err=%v", err) // stop if DB is down
	}
	defer pool.Close() // close pool on shutdown

	// Rate limiting store shared across requests (one bucket per user).
	store := newLimiterStore()

	go func() { // run cleanup in the background
		ticker := time.NewTicker(5 * time.Minute) // cleanup interval
		defer ticker.Stop()                       // stop ticker on shutdown

		for range ticker.C { // wait for each tick
			store.Cleanup(30 * time.Minute) // remove users idle for 30 minutes
		}
	}()

	capacity, refillRate := getRateLimitConfig() // read rate-limit settings (or defaults)
	cacheTTL := getCacheTTL()                    // read cache TTL (days -> duration)
	// Store DB in Gin context so handlers can use it later.
	router.Use(func(c *gin.Context) {
		c.Set("db", pool) // attach pool to context
		c.Next()
	})
	router.Use(requestid.New())
	router.Use(func(c *gin.Context) {
		// Skip the request ID requirement for health checks.
		if c.Request.URL.Path == "/healthz" {
			c.Next()
			return
		}

		// Require the FE to send X-Request-ID (requestid.New() will still store it).
		if c.GetHeader("X-Request-ID") == "" {
			c.JSON(400, gin.H{"error": map[string]interface{}{
				"code":    "INVALID_REQUEST",
				"message": "Missing X-Request-ID",
			}})

			c.Abort()
			return
		}

		// Echo the request ID back for tracing.
		reqID := requestid.Get(c)
		c.Header("X-Request-ID", reqID)

		c.Set("requestID", reqID)

		c.Next()
	})
	router.Use(func(c *gin.Context) {
		// Record the start time so we can measure total request duration.
		start := time.Now()
		// Run the rest of the middleware/handler chain first.
		c.Next()
		// Skip logging for health checks to reduce noise.
		if c.Request.URL.Path == "/healthz" {
			return
		}
		// Grab the request ID (already validated earlier).
		reqID := requestid.Get(c)
		// Pull the user ID if auth already set it.
		userID := c.GetString("userID")
		// Read the barcode route param (empty for non-barcode routes).
		barcode := c.Param("code")
		// Capture the final HTTP status code after handlers run.
		status := c.Writer.Status()
		// Compute the total time spent handling the request.
		duration := time.Since(start)
		// Log a single line with request context for tracing.
		log.Printf("request_log request_id=%s user_id=%s barcode=%s status=%d duration=%s path=%s",
			reqID, userID, barcode, status, duration, c.Request.URL.Path)
	})
	// Auth should run before rate limiting so only verified users are limited.
	router.Use(auth.New(authCfg))
	router.Use(func(c *gin.Context) {
		// Rate limiting middleware: reject if X-User-ID is missing, then check bucket.
		// Skip health check when auth middleware marks it.
		if c.GetBool("skipRateLimit") {
			c.Next()
			return
		}

		// Key by user ID provided by the TS server.
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			c.JSON(401, gin.H{"error": map[string]interface{}{
				"code":    "UNAUTHORIZED",
				"message": "Missing X-User-ID",
			}})
			c.Abort() // stop processing and do not call handlers
			return
		}

		// capacity/refillRate are configurable via env.
		// Each user gets their own bucket from the store.
		// This is in-memory per service instance (not shared across replicas).
		bucket := store.Get(userID, capacity, refillRate)
		// Allow() consumes 1 token; false means the user is rate-limited.
		if !bucket.Allow() {
			// Retry-After tells the client when to try again (seconds).
			c.Header("Retry-After", "1")
			c.JSON(429, gin.H{"error": map[string]interface{}{
				"code":    "RATE_LIMITED",
				"message": "Too many requests",
			}})
			c.Abort()
			return
		}

		// Request is allowed, continue to the handler.
		c.Next()
	})
	api := openfoodfacts.NewClient("world", "", "")
	timeout, userAgent, retryCfg, baseURL := getOpenFoodFactsConfig()
	api.Timeout(timeout)
	if userAgent != "" {
		api.UserAgent(userAgent)
	}
	if baseURL != "" && strings.Contains(baseURL, "openfoodfacts.net") {
		// The library only supports live vs sandbox; net maps to sandbox.
		api.Sandbox()
	}

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"message":   "Health check successful",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// This comes from the frontend when the user scans a barcode
	router.GET("/v1/barcodes/:code", barcode.NewHandler(&api, retryCfg, cacheTTL))

	// Print a safe config summary after we compute all config values.
	logStartupSummary(authCfg, capacity, refillRate, timeout, userAgent, retryCfg, baseURL)

	// Create a real HTTP server so we can shut down gracefully.
	server := &http.Server{
		Addr:    ":8080", // listen on 0.0.0.0:8080 by default
		Handler: router,  // use Gin as the handler
	}

	// Start serving in a goroutine so we can wait for shutdown signals.
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			// Log fatal if the server fails unexpectedly.
			log.Fatalf("server_error err=%v", err)
		}
	}()

	// Wait for SIGINT/SIGTERM so we can shut down cleanly.
	stopCtx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	<-stopCtx.Done() // block until a signal arrives

	// Allow in-flight requests up to 10 seconds to finish.
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		// Log shutdown errors so we can diagnose hung requests.
		log.Printf("shutdown_error err=%v", err)
	}
}
