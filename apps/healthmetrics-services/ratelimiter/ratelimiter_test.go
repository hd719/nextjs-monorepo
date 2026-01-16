package ratelimiter

import (
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// Test #1 — Makes sure a new bucket can be created and the Allow function is working as expected.
func TestNewTokenBucket(t *testing.T) {
	tb := NewTokenBucket(10, 1)

	tokens := tb.Tokens()
	if tokens != 10 {
		t.Errorf("expected tokens 10, got %d", tb.tokens)
	}
}

// Test #2 — Testing the Refill function and making sure requests are allowed through when they should be and blocked when not.
func TestAllow_Refill(t *testing.T) {
	// Create a bucket with capacity 2, refill rate 10/second
	tb := NewTokenBucket(2, 10)
	now := time.Unix(0, 0)
	tb.now = func() time.Time { return now }
	tb.lastRefill = now

	// Use up all tokens
	tb.Allow()
	tb.Allow()

	// Should be denied now
	if tb.Allow() {
		t.Error("should be denied when empty")
	}

	// Advance time (100ms should give us 1 token at 10/sec)
	now = now.Add(110 * time.Millisecond)

	// Should be allowed now
	if !tb.Allow() {
		t.Error("should be allowed after refill")
	}
}

// Test #3 — Tests that the AllowN function also behaves as it should and allows n requests through or not depending on n and the capacity.
func TestAllowN(t *testing.T) {
	tb := NewTokenBucket(10, 1)

	// Request 5 tokens - should succeed
	if !tb.AllowN(5) {
		t.Error("should allow 5 tokens")
	}

	// Request 6 more - should fail (only 5 left)
	if tb.AllowN(6) {
		t.Error("should deny 6 tokens when only 5 available")
	}

	// Request 5 - should succeed
	if !tb.AllowN(5) {
		t.Error("should allow 5 tokens")
	}

	// Now empty
	if tb.AllowN(1) {
		t.Error("should deny when empty")
	}
}

// Test #4 — Frequent calls should not prevent refills over time.
func TestRefillWithFrequentCalls(t *testing.T) {
	tb := NewTokenBucket(1, 2) // 1 token max, 2 tokens/sec (1 token every 500ms)
	tb.tokens = 0              // start empty
	now := time.Unix(0, 0)
	tb.now = func() time.Time { return now }
	tb.lastRefill = now

	allowed := false
	for i := 0; i < 6; i++ { // ~600ms total
		if tb.Allow() {
			allowed = true
			break
		}
		now = now.Add(120 * time.Millisecond)
	}

	if !allowed {
		t.Error("expected a token to refill despite frequent calls")
	}
}

// Test #5 — Concurrent Allow calls should not exceed capacity.
func TestAllowConcurrent(t *testing.T) {
	// Create a bucket with capacity 5 and any refill rate.
	tb := NewTokenBucket(5, 1)
	// Disable refills so the test is deterministic.
	tb.refillRate = 0 // disable refills for deterministic test
	// Start with exactly 5 tokens.
	tb.tokens = 5 * precision

	// Track how many goroutines were allowed.
	var allowed int64
	// WaitGroup lets us wait until all goroutines complete.
	// We increment the counter before each goroutine and decrement when it finishes.
	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		// Each goroutine represents a concurrent request.
		wg.Add(1)
		go func() {
			defer wg.Done()
			// If Allow() returns true, count it.
			if tb.Allow() {
				atomic.AddInt64(&allowed, 1)
			}
		}()
	}
	// Wait for all goroutines to finish.
	wg.Wait()

	// Only 5 should pass because the bucket starts with 5 tokens and does not refill.
	if allowed != 5 {
		t.Errorf("expected 5 allowed requests, got %d", allowed)
	}
}
