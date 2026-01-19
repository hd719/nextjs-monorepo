package auth

import (
	"context" // for ErrNoRows checks
	"errors"
	"fmt"     // for error formatting
	"log"     // for auth logs
	"net/url" // for decoding cookie value
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Config struct {
	APIKey     string
	CookieName string
}

// parseSessionToken extracts the raw token from "token.signature" cookie values.
func parseSessionToken(raw string) (string, error) {
	decoded, err := url.QueryUnescape(raw) // cookie value may be URL-encoded
	if err != nil {
		return "", fmt.Errorf("decode session token: %w", err)
	}

	parts := strings.SplitN(decoded, ".", 2) // split token.signature
	if len(parts) == 0 || parts[0] == "" {   // token must exist
		return "", fmt.Errorf("invalid session token format")
	}

	return parts[0], nil // return just the token part

}

// lookupSession loads user_id + expires_at for a session token
// Think of Scan like “fill these boxes.”
// The query returns two values from the DB: user_id and expires_at.
// Scan needs two places to put them.
// So we create two empty boxes (variables), then pass their addresses:
// var userID string       // empty box for user_id
// var expiresAt time.Time // empty box for expires_at
// err := row.Scan(&userID, &expiresAt)
// After Scan, those boxes are filled.
// Then we return them.
// If you don’t create the variables first, there’s nowhere for Scan to put the values.
func lookupSession(ctx context.Context, pool *pgxpool.Pool, token string) (string, time.Time, error) {
	var userID string       // user_id from the session row
	var expiresAt time.Time // expires_at from the session row

	err := pool.QueryRow(
		ctx,
		`SELECT user_id, expires_at FROM session WHERE token = $1`,
		token,
	).Scan(&userID, &expiresAt)

	if err != nil {
		return "", time.Time{}, err
	}

	return userID, expiresAt, nil
}

func New(cfg Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Local type aliases for JSON error payloads.
		type InternalError = map[string]interface{}
		type UnauthorizedError = map[string]interface{}
		// Skip the health check route to avoid blocking liveness checks.
		if c.Request.URL.Path == "/healthz" {
			// Flag for downstream middleware (rate limiter) to skip this request and this is set on the context
			c.Set("skipRateLimit", true)
			c.Next()
			return
		}

		// Read the request ID from the incoming headers (sent by the TS server action).
		requestID := c.GetHeader("X-Request-ID")
		if requestID != "" { // only set when present to avoid storing empty values
			c.Set("requestID", requestID) // keep it on context for downstream logging
		}

		// Guard: all auth config values must be present.
		if cfg.APIKey == "" || cfg.CookieName == "" {
			// Log missing config so ops can spot misconfigured deployments.
			log.Printf("auth_error request_id=%s reason=missing_config", requestID)
			c.JSON(500, gin.H{"error": InternalError{
				"code":    "INTERNAL_ERROR",
				"message": "Auth Config is missing",
			}})
			c.Abort()
			return
		}

		// 1) Validate API key (service-to-service auth).
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" || apiKey != cfg.APIKey {
			// Record API key failures with the same request ID for tracing.
			log.Printf("auth_error request_id=%s reason=invalid_api_key", requestID)
			c.JSON(401, gin.H{"error": UnauthorizedError{
				"code":    "UNAUTHORIZED",
				"message": "Invalid API key",
			}})
			c.Abort()
			return
		}

		// 2) Extract session token from the session cookie.
		cookie, err := c.Request.Cookie(cfg.CookieName)
		if err != nil || cookie.Value == "" {
			// If the session cookie is missing, the user cannot be authenticated.
			log.Printf("auth_error request_id=%s reason=missing_session_cookie", requestID)
			c.JSON(401, gin.H{"error": map[string]interface{}{
				"code":    "UNAUTHORIZED",
				"message": "Missing session cookie",
			}})
			c.Abort()
			return
		}

		// 3) Validate session token against the DB.
		poolAny, ok := c.Get("db") // grab DB pool from Gin context
		if !ok {
			log.Printf("auth_error request_id=%s reason=missing_db_pool", requestID)
			c.JSON(500, gin.H{"error": InternalError{
				"code":    "INTERNAL_ERROR",
				"message": "DB not available",
			}})
			c.Abort()
			return
		}

		pool, ok := poolAny.(*pgxpool.Pool) // type assert to pgx pool
		if !ok {
			log.Printf("auth_error request_id=%s reason=invalid_db_pool", requestID)
			c.JSON(500, gin.H{"error": InternalError{
				"code":    "INTERNAL_ERROR",
				"message": "DB not available",
			}})
			c.Abort()
			return
		}

		sessionToken, err := parseSessionToken(cookie.Value) // extract token part
		if err != nil {
			log.Printf("auth_error request_id=%s reason=invalid_session_token", requestID)
			c.JSON(401, gin.H{"error": UnauthorizedError{
				"code":    "UNAUTHORIZED",
				"message": "Invalid session token",
			}})
			c.Abort()
			return
		}

		// Query session row with a short timeout.
		queryCtx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()

		dbUserID, expiresAt, err := lookupSession(queryCtx, pool, sessionToken)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) { // token not found
				log.Printf("auth_error request_id=%s reason=session_not_found", requestID)
				c.JSON(401, gin.H{"error": UnauthorizedError{
					"code":    "UNAUTHORIZED",
					"message": "Invalid session token",
				}})
				c.Abort()
				return
			}

			log.Printf("auth_error request_id=%s reason=session_lookup_failed err=%v", requestID, err)
			c.JSON(500, gin.H{"error": InternalError{
				"code":    "INTERNAL_ERROR",
				"message": "Session validation failed",
			}})
			c.Abort()
			return
		}

		if time.Now().After(expiresAt) { // expired session
			log.Printf("auth_error request_id=%s reason=session_expired", requestID)
			c.JSON(401, gin.H{"error": UnauthorizedError{
				"code":    "UNAUTHORIZED",
				"message": "Session expired",
			}})
			c.Abort()
			return
		}

		// 4) Require X-User-ID (must match DB session user).
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			// User ID is required for per-user rate limiting and auditing.
			log.Printf("auth_error request_id=%s reason=missing_user_id", requestID)
			c.JSON(401, gin.H{"error": map[string]interface{}{
				"code":    "UNAUTHORIZED",
				"message": "Missing X-User-ID",
			}})
			c.Abort()
			return
		}

		// Ensure the session belongs to the same user as X-User-ID.
		if dbUserID != userID {
			log.Printf("auth_error request_id=%s reason=user_mismatch", requestID)
			c.JSON(403, gin.H{"error": map[string]interface{}{
				"code":    "FORBIDDEN",
				"message": "User mismatch",
			}})
			c.Abort()
			return
		}

		// Store the user ID in context for downstream handlers/middleware.
		c.Set("userID", userID)

		// Auth passed; continue to the next middleware/handler.
		c.Next()
	}
}
