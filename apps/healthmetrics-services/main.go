package main

import (
	"healthmetrics-services/internal/barcode"
	"healthmetrics-services/ratelimiter"
	"os"
	"strconv"
	"sync"
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

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Placeholder auth middleware so rate limiting runs after auth.
		// TODO: validate X-API-Key + JWT + X-User-ID per PRD. (we can check the database for this)
		c.Next()
	}
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
	// Rate limiting store shared across requests (one bucket per user).
	store := newLimiterStore()

	go func() { // run cleanup in the background
		ticker := time.NewTicker(5 * time.Minute) // cleanup interval
		defer ticker.Stop()                       // stop ticker on shutdown

		for range ticker.C { // wait for each tick
			store.Cleanup(30 * time.Minute) // remove users idle for 30 minutes
		}
	}()

	capacity, refillRate := getRateLimitConfig()
	router.Use(requestid.New())
	// Auth should run before rate limiting so only verified users are limited.
	router.Use(authMiddleware())
	router.Use(func(c *gin.Context) {
		// Rate limiting middleware: reject if X-User-ID is missing, then check bucket.
		// Skip health check
		if c.Request.URL.Path == "/healthz" {
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

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"message":   "Health check successful",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// This comes from the frontend when the user scans a barcode
	router.GET("/v1/barcodes/:code", barcode.NewHandler(&api))
	router.Run() // listens on 0.0.0.0:8080 by default
}
