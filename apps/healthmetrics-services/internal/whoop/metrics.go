package whoop

import (
	"context"
	"net/http"
	"strings"
	"sync/atomic"
	"time"
)

// Metrics stores lightweight counters for WHOOP operations.
// These are in-memory (per service instance) and reset on restart.
type Metrics struct {
	ExchangeTotal   uint64
	ExchangeSuccess uint64
	ExchangeFailure uint64

	SyncTotal       uint64
	SyncSuccess     uint64
	SyncFailure     uint64
	SyncDurationMs  uint64

	RefreshTotal   uint64
	RefreshFailure uint64

	DisconnectTotal   uint64
	DisconnectFailure uint64

	WhoopAPITotal   uint64
	WhoopAPIFailure uint64
}

func NewMetrics() *Metrics {
	return &Metrics{}
}

func (m *Metrics) RecordExchange(err error) {
	atomic.AddUint64(&m.ExchangeTotal, 1)
	if err != nil {
		atomic.AddUint64(&m.ExchangeFailure, 1)
		return
	}
	atomic.AddUint64(&m.ExchangeSuccess, 1)
}

func (m *Metrics) RecordSync(duration time.Duration, err error) {
	atomic.AddUint64(&m.SyncTotal, 1)
	atomic.AddUint64(&m.SyncDurationMs, uint64(duration.Milliseconds()))
	if err != nil {
		atomic.AddUint64(&m.SyncFailure, 1)
		return
	}
	atomic.AddUint64(&m.SyncSuccess, 1)
}

func (m *Metrics) RecordRefresh(err error) {
	atomic.AddUint64(&m.RefreshTotal, 1)
	if err != nil {
		atomic.AddUint64(&m.RefreshFailure, 1)
	}
}

func (m *Metrics) RecordDisconnect(err error) {
	atomic.AddUint64(&m.DisconnectTotal, 1)
	if err != nil {
		atomic.AddUint64(&m.DisconnectFailure, 1)
	}
}

func (m *Metrics) RecordWhoopAPI(err error) {
	atomic.AddUint64(&m.WhoopAPITotal, 1)
	if err != nil {
		atomic.AddUint64(&m.WhoopAPIFailure, 1)
	}
}

// Snapshot returns a stable view of counters for debugging.
func (m *Metrics) Snapshot() map[string]any {
	total := atomic.LoadUint64(&m.SyncTotal)
	duration := atomic.LoadUint64(&m.SyncDurationMs)
	avg := 0.0
	if total > 0 {
		avg = float64(duration) / float64(total)
	}

	return map[string]any{
		"exchange_total":   atomic.LoadUint64(&m.ExchangeTotal),
		"exchange_success": atomic.LoadUint64(&m.ExchangeSuccess),
		"exchange_failure": atomic.LoadUint64(&m.ExchangeFailure),
		"sync_total":       total,
		"sync_success":     atomic.LoadUint64(&m.SyncSuccess),
		"sync_failure":     atomic.LoadUint64(&m.SyncFailure),
		"sync_avg_ms":      avg,
		"refresh_total":    atomic.LoadUint64(&m.RefreshTotal),
		"refresh_failure":  atomic.LoadUint64(&m.RefreshFailure),
		"disconnect_total": atomic.LoadUint64(&m.DisconnectTotal),
		"disconnect_failure": atomic.LoadUint64(&m.DisconnectFailure),
		"whoop_api_total":    atomic.LoadUint64(&m.WhoopAPITotal),
		"whoop_api_failure":  atomic.LoadUint64(&m.WhoopAPIFailure),
	}
}

// requestIDKey is a context key used to carry correlation IDs through sync flows.
type requestIDKey struct{}

// WithRequestID attaches a request ID to the context for downstream logging.
func WithRequestID(ctx context.Context, requestID string) context.Context {
	if requestID == "" {
		return ctx
	}
	return context.WithValue(ctx, requestIDKey{}, requestID)
}

// RequestIDFromContext extracts the request ID (if present).
func RequestIDFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if value, ok := ctx.Value(requestIDKey{}).(string); ok {
		return value
	}
	return ""
}

// requestIDFromHeaders reads the correlation ID sent by the frontend.
func requestIDFromHeaders(r *http.Request) string {
	if r == nil {
		return ""
	}
	return strings.TrimSpace(r.Header.Get("X-Request-ID"))
}
