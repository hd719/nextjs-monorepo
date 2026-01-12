package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Config holds DB settings read from ENV
type Config struct {
	DatabaseURL     string        // DATABASE_URL connection string
	MaxConns        int32         // max total connections
	MinConns        int32         // min idle connections
	MaxConnLifetime time.Duration // max lifetime of a connection
	MaxConnIdleTime time.Duration // max idle time before closing
}

// NewPool creates a pgx connection pool and verifies it with Ping
func NewPool(ctx context.Context, cfg Config) (*pgxpool.Pool, error) {
	if cfg.DatabaseURL == "" { // Database URL is required
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	poolCfg, err := pgxpool.ParseConfig(cfg.DatabaseURL) // parse DATABASE_URL
	if err != nil {
		return nil, fmt.Errorf("parse DATABASE_URL: %w", err)
	}

	// Apply pool sizing config.
	if cfg.MaxConns > 0 { // only override when explicitly set
		poolCfg.MaxConns = cfg.MaxConns
	}
	if cfg.MinConns > 0 { // only override when explicitly set
		poolCfg.MinConns = cfg.MinConns
	}
	poolCfg.MaxConnLifetime = cfg.MaxConnLifetime
	poolCfg.MaxConnIdleTime = cfg.MaxConnIdleTime

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg) // create the pool
	if err != nil {
		return nil, fmt.Errorf("create pool: %w", err)
	}

	// Verify the pool works before returning it
	pingCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	if err := pool.Ping(pingCtx); err != nil {
		pool.Close() // close on failure to avoid leaks
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return pool, nil // return a ready-to-use pool
}
