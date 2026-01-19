package ratelimiter

import (
	"sync"
	"time"
)

type TokenBucket struct {
	mu            sync.Mutex       // to make TokenBucket safe for concurrent use (protects tokens and lastRefill)
	capacity      int64            // int64 keeps token math in integers for precision and speed
	tokens        int64            // current token balance in "precision" units (int64)
	refillRate    int64            // tokens per second as an integer rate
	lastRefill    time.Time        // last time we refilled tokens
	nanosPerToken int64            // nanoseconds per token for integer time math (how much time should pass to generate 1 token) ex. If you allow 5 tokens per second, then one token should arrive every 200ms
	now           func() time.Time // injectable clock for deterministic tests (defaults to time.Now) need it for testing
}

const precision int64 = 1_000_000 // need to avoid float arithmetic, the nanosPerToken was used internally for precision to avoid floating point issues that I run into when running some tests
// Example:
// refillRate = 2 tokens/second
// so nanosPerToken = 1s / 2 = 0.5 seconds = 500 ms = 500,000,000 ns (precision is at 1,000,000 units) so 1 Token = 1,000,000 units
// Now lets say 250ms has passed since last refill
// tokensToAdd = (250,000,000 ns * 1,000,000 units) / 500,000,000 ns = 500,000 units = 0.5 Tokens
// So we add 0.5 Tokens to the bucket
// With precision, you can accumulate half tokens accurately using integers
// Without precision (if 1 token = 1), 250ms would add 0 tokens and you’d lose accuracy

// With this approach we can create different rate limiters for different use cases.
// Example strict: capacity=5, refillRate=1 (burst 5, then 1 token/sec).
// Example relaxed: capacity=60, refillRate=10 (burst 60, then 10 tokens/sec).
func NewTokenBucket(capacity float64, refillRate float64) *TokenBucket {
	if capacity <= 0 {
		capacity = 1 // clamp to avoid a bucket that can never allow requests
	}
	if refillRate <= 0 {
		refillRate = 1 // clamp to avoid a bucket that never refills
	}
	capUnits := int64(capacity * float64(precision)) // Go won’t let you multiply it by an int64 directly, you have to convert one side so the types match so we convert precision to float64 first
	refillRateInt := int64(refillRate)

	// Calculate nanoseconds per token: 1 second = 1e9 nanoseconds
	var nanosPerToken int64
	if refillRateInt > 0 {
		nanosPerToken = int64(time.Second) / refillRateInt
	}

	// Handle edge case where refillRate < 1 token/second
	// e.g., refillRate = 0.1 tokens/second -> nanosPerToken = 10 seconds
	// We want to ensure at least 1 nanosecond per token to avoid division by zero
	if nanosPerToken == 0 && refillRateInt > 0 {
		nanosPerToken = 1
	}

	nowFn := time.Now
	return &TokenBucket{
		capacity:      capUnits,
		tokens:        capUnits, // Start with a full bucket
		refillRate:    refillRateInt,
		lastRefill:    nowFn(),
		nanosPerToken: nanosPerToken,
		now:           nowFn,
	}
}

// Checks the refillRate is more than 0
// Finds out the elapsed time since the last refill
// Finds out from that how many tokens to add
// If this number of tokens is greater than 0 it checks it won't go over the capacity and if it does it sets it to the capacity
// Updates the lastRefill to now

func (tb *TokenBucket) refill() {
	if tb.refillRate <= 0 {
		return
	}

	now := tb.now
	if now == nil {
		now = time.Now
	}
	current := now()
	elapsed := current.Sub(tb.lastRefill).Nanoseconds()
	// Clamp elapsed to avoid int64 overflow in elapsed * precision after long idle.
	//(1<<63)-1 is another way of building the largest MaxInt64 value
	// We divide by precision to keep (elapsed * precision) <= MaxInt64.
	// Example: if elapsed is huge (days of idle), elapsed*precision could overflow; this caps it safely.
	maxElapsed := int64((1<<63)-1) / precision
	if elapsed > maxElapsed { // means we overflowed, so reset elapsed to maxElapsed
		elapsed = maxElapsed
	}

	// Calculate tokens to add
	tokensToAdd := (elapsed * precision) / tb.nanosPerToken

	if tokensToAdd > 0 { // you are not at max capacity go ahead and add tokens
		tb.tokens = tb.tokens + tokensToAdd

		// Cap at capacity (e.g., capacity=10, no requests for 60 seconds, refill adds 60 tokens -> you cap it back down to 10)
		if tb.tokens > tb.capacity {
			tb.tokens = tb.capacity
		}

		// Advance by the exact time used to mint tokens so we keep remainder.
		// We generate 1 token every 500ms (2 tokens/sec). If 760ms pass:
		// - tokensToAdd = 1.52 tokens (1,520,000 units with precision=1,000,000).
		// - usedNanos = time for 1.52 tokens = (1,520,000 * 500ms) / 1,000,000 = 760ms.
		// If 740ms pass instead:
		// - tokensToAdd = 1.48 tokens (1,480,000 units).
		// - usedNanos = (1,480,000 * 500ms) / 1,000,000 = 740ms.
		// In both cases we  take the lastRefill and add that by the exact time used to mint tokens so any leftover time is preserved for the next refill.
		usedNanos := (tokensToAdd * tb.nanosPerToken) / precision
		tb.lastRefill = tb.lastRefill.Add(time.Duration(usedNanos))
	}
}

// Calling the refill function first
// Then seeing if we have at least 1 token in the bucket
// If we do delete a token from the bucket tokens and return true — request accepted
// If we don't then return false — request denied
func (tb *TokenBucket) Allow() bool {
	tb.mu.Lock()         // Lock to make thread-safe
	defer tb.mu.Unlock() // Ensure unlock happens (at the end of the function and also in case of early returns)

	tb.refill()

	if tb.tokens >= precision { // Do we have at least 1 token (1_000_000 units)?
		tb.tokens = tb.tokens - precision // Subtract a token
		return true
	}

	return false
}

// Again start off by calling the refill function
// Work out how many tokens are being requested
// If the number of tokens in the bucket are equal or more than the requested number of tokens then return true — request accepted
// Otherwise return false — request denied
func (tb *TokenBucket) AllowN(n int64) bool {
	tb.mu.Lock()         // Lock to make thread-safe
	defer tb.mu.Unlock() // Ensure unlock happens (at the end of the function and also in case of early returns)

	if n <= 0 {
		return false //  Invalid request
	}

	tb.refill()

	required := int64(n) * precision
	if tb.tokens >= required {
		tb.tokens = tb.tokens - required
		return true
	}

	return false
}

func (tb *TokenBucket) Tokens() int64 {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	return tb.tokens / precision
}
