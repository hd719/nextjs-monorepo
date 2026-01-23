package whoop

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type ExchangeRequest struct {
	UserID      string `json:"userId"`
	Code        string `json:"code"`
	RedirectURI string `json:"redirectUri"`
}

type SyncRequest struct {
	UserID string `json:"userId"`
}

type DisconnectRequest struct {
	UserID string `json:"userId"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
	ExpiresIn    int64  `json:"expires_in"`
	Scope        string `json:"scope"`
	TokenType    string `json:"token_type"`
}

// ErrMissingToken is returned when an integration has no stored tokens.
var ErrMissingToken = errors.New("missing token")

type Service struct {
	// DB implements the integration persistence contract (upserts + status).
	DB DB

	// HTTPClient is used for WHOOP token exchange.
	HTTPClient *http.Client

	// Logger writes structured-ish logs (use log.New or your own logger wrapper).
	Logger *log.Logger

	// Metrics holds in-memory counters for observability.
	Metrics *Metrics

	ClientID     string
	ClientSecret string
	TokenURL     string
	RedirectURL  string
}

type DB interface {
	UpsertIntegration(ctx context.Context, userID, provider string) (integrationID string, err error)
	UpsertIntegrationToken(ctx context.Context, integrationID string, accessEnc string, refreshEnc *string, expiresAt time.Time, scopes []string) error
	MarkIntegrationConnected(ctx context.Context, integrationID string) error
	GetIntegration(ctx context.Context, userID, provider string) (IntegrationRecord, error)
	HasIntegrationToken(ctx context.Context, integrationID string) (bool, error)
	UpdateIntegrationLastSync(ctx context.Context, integrationID string, syncedAt time.Time) error
	GetIntegrationToken(ctx context.Context, integrationID string) (IntegrationTokenRecord, error)
	UpsertIntegrationRawEvent(ctx context.Context, integrationID, resourceType, sourceID string, payload []byte) error
	UpsertIntegrationSleep(ctx context.Context, data IntegrationSleepRecord) error
	UpsertIntegrationRecovery(ctx context.Context, data IntegrationRecoveryRecord) error
	UpsertIntegrationWorkout(ctx context.Context, data IntegrationWorkoutRecord) error
	UpsertIntegrationCycle(ctx context.Context, data IntegrationCycleRecord) error
	UpdatePrimarySleep(ctx context.Context, integrationID string) error
	UpsertIntegrationLastError(ctx context.Context, integrationID string, lastError *string) error
	UpsertIntegrationConnection(ctx context.Context, integrationID, providerUserID string) error
	DeleteIntegrationTokens(ctx context.Context, integrationID string) error
	MarkIntegrationDisconnected(ctx context.Context, integrationID string) error
}

func (s *Service) ExchangeHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: add internal auth middleware (API key + cookie JWT)
	// This handler:
	// 1) validates input
	// 2) exchanges the auth code for tokens
	// 3) encrypts + stores tokens
	// 4) marks the integration as connected
	var req ExchangeRequest
	requestID := requestIDFromHeaders(r)

	// r.Body is a stream of bytes, we need to decode it into a struct using json.NewDecoder
	// NewDecoder lets you parse the stream without loading the entire body into memory
	// Decode() populates the struct fields based on JSON keys (like userId, code, redirectUri)
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.recordExchangeMetrics(err)
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	// Validate the request fields
	if req.UserID == "" || req.Code == "" || req.RedirectURI == "" {
		s.recordExchangeMetrics(errors.New("missing fields"))
		http.Error(w, "missing fields", http.StatusBadRequest)
		return
	}

	// Validate the redirect URI
	// req.RedirectURI is the redirect URI from the request (https://localhost:3003/integrations/whoop/callback)
	// s.RedirectURL is the redirect URI from the environment variable from the server (https://localhost:3003/integrations/whoop/callback)
	if req.RedirectURI != s.RedirectURL {
		s.recordExchangeMetrics(errors.New("invalid redirect uri"))
		http.Error(w, "invalid redirect_uri", http.StatusBadRequest)
		return
	}

	ctx := WithRequestID(r.Context(), requestID)

	token, err := s.exchangeToken(ctx, req.Code, req.RedirectURI)
	if err != nil {
		// We check s.Logger != nil to avoid a nil pointer panic.
		// In Go, calling a method on a nil pointer (like s.Logger.Printf) will crash the program, this guard makes logging optional — if no logger was injected, the handler still works its just a safety check
		s.logWithRequestID(requestID, "whoop token exchange failed user=%s err=%v", req.UserID, err)
		s.recordExchangeMetrics(err)
		http.Error(w, "token exchange failed", http.StatusBadGateway)
		return
	}

	// Encrypt tokens before storing them
	// Encrypt the access token before storing it in the database (limit the blast radius in case the database is compromised)
	var accessEnc string
	if token.AccessToken != "" {
		enc, err := Encrypt(token.AccessToken) // encrypt the access token before storing it in the database (limit the blast radius in case the database is compromised)
		if err != nil {
			s.recordExchangeMetrics(err)
			http.Error(w, "encrypt failed", http.StatusInternalServerError)
			return
		}
		accessEnc = enc
	}

	// Access tokens are always required so we store them as a string, while refresh tokens are optional (only returned with offline scope) so we store them as a pointer.
	var refreshEnc *string
	if token.RefreshToken != "" {
		enc, err := Encrypt(token.RefreshToken) // encrypt the refresh token before storing it in the database (limit the blast radius in case the database is compromised)
		if err != nil {
			s.recordExchangeMetrics(err)
			http.Error(w, "encrypt failed", http.StatusInternalServerError)
			return
		}
		refreshEnc = &enc
	}

	expiresAt := time.Now().Add(time.Duration(token.ExpiresIn) * time.Second)

	// Upsert integration + store tokens
	integrationID, err := s.DB.UpsertIntegration(ctx, req.UserID, "whoop")
	if err != nil {
		s.logWithRequestID(requestID, "whoop db error (upsert integration) user=%s err=%v", req.UserID, err)
		s.recordExchangeMetrics(err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	s.logWithRequestID(requestID, "integration created user=%s integration=%s", req.UserID, integrationID)

	// Add the encrypted tokens to the database
	if err := s.DB.UpsertIntegrationToken(ctx, integrationID, accessEnc, refreshEnc, expiresAt, strings.Fields(token.Scope)); err != nil {
		s.logWithRequestID(requestID, "whoop db error (upsert token) user=%s integration=%s err=%v", req.UserID, integrationID, err)
		s.recordExchangeMetrics(err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	s.logWithRequestID(requestID, "integration tokens stored user=%s integration=%s", req.UserID, integrationID)

	// Mark the integration as connected
	if err := s.DB.MarkIntegrationConnected(ctx, integrationID); err != nil {
		s.logWithRequestID(requestID, "whoop db error (mark connected) user=%s integration=%s err=%v", req.UserID, integrationID, err)
		s.recordExchangeMetrics(err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	// TODO: enqueue initial sync job

	s.recordExchangeMetrics(nil)
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (s *Service) SyncHandler(w http.ResponseWriter, r *http.Request) {
	// This handler:
	// 1) validates input
	// 2) loads integration
	// 3) delegates sync logic to SyncIntegration
	var req SyncRequest
	requestID := requestIDFromHeaders(r)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.recordSyncMetrics(0, errors.New("invalid json"))
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	if req.UserID == "" {
		s.recordSyncMetrics(0, errors.New("missing fields"))
		http.Error(w, "missing fields", http.StatusBadRequest)
		return
	}

	ctx := WithRequestID(r.Context(), requestID)

	integration, err := s.DB.GetIntegration(ctx, req.UserID, "whoop")
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			s.recordSyncMetrics(0, err)
			http.Error(w, "integration not found", http.StatusNotFound)
			return
		}
		s.logWithRequestID(requestID, "whoop db error (get integration) user=%s err=%v", req.UserID, err)
		s.recordSyncMetrics(0, err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	if integration.Status != "connected" {
		s.recordSyncMetrics(0, errors.New("integration not connected"))
		http.Error(w, "integration not connected", http.StatusConflict)
		return
	}

	if err := s.SyncIntegration(ctx, req.UserID, integration.ID); err != nil {
		if errors.Is(err, ErrMissingToken) {
			http.Error(w, "missing token", http.StatusBadRequest)
			return
		}
		s.logWithRequestID(requestID, "whoop sync failed user=%s integration=%s err=%v", req.UserID, integration.ID, err)
		http.Error(w, "sync failed", http.StatusBadGateway)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (s *Service) exchangeToken(ctx context.Context, code, redirectURI string) (*TokenResponse, error) {
	// Build the OAuth token exchange payload.
	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("client_id", s.ClientID)
	form.Set("client_secret", s.ClientSecret)
	form.Set("redirect_uri", redirectURI)

	// Send the request to WHOOP's token endpoint.
	req, err := http.NewRequestWithContext(ctx, "POST", s.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// This response holds a open network connection to WHOOP's token endpoint, which is why we defer the closing of the body
	resp, err := s.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, errors.New("whoops server error: token endpoint returned error")
	}

	// Decode the token response
	// token := {
	//   "access_token": "abc123",
	//   "refresh_token": "refresh456",
	//   "expires_in": 3600,
	//   "scope": "read:sleep read:recovery offline",
	//   "token_type": "bearer"
	// }
	var token TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return nil, err
	}
	return &token, nil
}

func (s *Service) DisconnectHandler(w http.ResponseWriter, r *http.Request) {
	// Disconnect:
	// 1) find the integration row
	// 2) delete stored tokens
	// 3) mark integration status = disconnected
	var req DisconnectRequest
	requestID := requestIDFromHeaders(r)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.recordDisconnectMetrics(err)
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	if req.UserID == "" {
		s.recordDisconnectMetrics(errors.New("missing fields"))
		http.Error(w, "missing fields", http.StatusBadRequest)
		return
	}

	ctx := WithRequestID(r.Context(), requestID)

	integration, err := s.DB.GetIntegration(ctx, req.UserID, "whoop")
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			s.recordDisconnectMetrics(err)
			http.Error(w, "integration not found", http.StatusNotFound)
			return
		}
		s.logWithRequestID(requestID, "whoop db error (get integration) user=%s err=%v", req.UserID, err)
		s.recordDisconnectMetrics(err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	if err := s.DB.DeleteIntegrationTokens(ctx, integration.ID); err != nil {
		s.logWithRequestID(requestID, "whoop db error (delete tokens) user=%s integration=%s err=%v", req.UserID, integration.ID, err)
		s.recordDisconnectMetrics(err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	if err := s.DB.MarkIntegrationDisconnected(ctx, integration.ID); err != nil {
		s.logWithRequestID(requestID, "whoop db error (mark disconnected) user=%s integration=%s err=%v", req.UserID, integration.ID, err)
		s.recordDisconnectMetrics(err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	s.recordDisconnectMetrics(nil)
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (s *Service) refreshToken(ctx context.Context, refreshToken string) (*TokenResponse, error) {
	var refreshErr error
	defer func() { s.recordRefreshMetrics(refreshErr) }()

	form := url.Values{}
	form.Set("grant_type", "refresh_token")
	form.Set("refresh_token", refreshToken)
	form.Set("client_id", s.ClientID)
	form.Set("client_secret", s.ClientSecret)

	req, err := http.NewRequestWithContext(ctx, "POST", s.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		refreshErr = err
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := s.HTTPClient.Do(req)
	if err != nil {
		refreshErr = err
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		refreshErr = errors.New("whoops server error: refresh token endpoint returned error")
		return nil, refreshErr
	}

	var token TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		refreshErr = err
		return nil, err
	}

	return &token, nil
}

// SyncIntegration runs the core sync flow for a given integration.
// It is reused by both the HTTP handler and the scheduled sync job.
func (s *Service) SyncIntegration(ctx context.Context, userID, integrationID string) error {
	start := time.Now()
	logAndReturn := func(err error) error {
		s.logSyncStatus(ctx, userID, integrationID, time.Since(start).Milliseconds(), err)
		return err
	}

	// Confirm a token row exists (fast guard for missing tokens).
	hasToken, err := s.DB.HasIntegrationToken(ctx, integrationID)
	if err != nil {
		err = fmt.Errorf("check token: %w", err)
		s.recordSyncError(ctx, integrationID, err)
		return logAndReturn(err)
	}
	if !hasToken {
		s.recordSyncError(ctx, integrationID, ErrMissingToken)
		return logAndReturn(ErrMissingToken)
	}

	// Load encrypted tokens + expiry from DB.
	tokenRecord, err := s.DB.GetIntegrationToken(ctx, integrationID)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			s.recordSyncError(ctx, integrationID, ErrMissingToken)
			return logAndReturn(ErrMissingToken)
		}
		err = fmt.Errorf("get token: %w", err)
		s.recordSyncError(ctx, integrationID, err)
		return logAndReturn(err)
	}

	// Decrypt access token so we can call WHOOP.
	accessToken, err := Decrypt(tokenRecord.AccessTokenEncrypted)
	if err != nil {
		err = fmt.Errorf("decrypt access token: %w", err)
		s.recordSyncError(ctx, integrationID, err)
		return logAndReturn(err)
	}

	// Refresh token is optional (only returned with offline scope).
	var refreshToken string
	if tokenRecord.RefreshTokenEncrypted != nil {
		refreshToken, err = Decrypt(*tokenRecord.RefreshTokenEncrypted)
		if err != nil {
			err = fmt.Errorf("decrypt refresh token: %w", err)
			s.recordSyncError(ctx, integrationID, err)
			return logAndReturn(err)
		}
	}

	// If token is expired (or near expiry), refresh it first.
	if tokenRecord.ExpiresAt != nil && tokenRecord.ExpiresAt.Before(time.Now().Add(1*time.Minute)) {
		if refreshToken == "" {
			s.recordSyncError(ctx, integrationID, ErrMissingToken)
			return logAndReturn(ErrMissingToken)
		}

		refreshed, err := s.refreshToken(ctx, refreshToken)
		if err != nil {
			err = fmt.Errorf("refresh token: %w", err)
			s.recordSyncError(ctx, integrationID, err)
			return logAndReturn(err)
		}

		accessEnc, err := Encrypt(refreshed.AccessToken)
		if err != nil {
			err = fmt.Errorf("encrypt access token: %w", err)
			s.recordSyncError(ctx, integrationID, err)
			return logAndReturn(err)
		}

		var refreshEnc *string
		if refreshed.RefreshToken != "" {
			enc, err := Encrypt(refreshed.RefreshToken)
			if err != nil {
				err = fmt.Errorf("encrypt refresh token: %w", err)
				s.recordSyncError(ctx, integrationID, err)
				return logAndReturn(err)
			}
			refreshEnc = &enc
		}

		expiresAt := time.Now().Add(time.Duration(refreshed.ExpiresIn) * time.Second)
		if err := s.DB.UpsertIntegrationToken(ctx, integrationID, accessEnc, refreshEnc, expiresAt, strings.Fields(refreshed.Scope)); err != nil {
			err = fmt.Errorf("upsert refreshed tokens: %w", err)
			s.recordSyncError(ctx, integrationID, err)
			return logAndReturn(err)
		}

		accessToken = refreshed.AccessToken
	}

	// Fetch WHOOP data and store raw payloads.
	if err := s.fetchAndStoreWhoopData(ctx, integrationID, accessToken); err != nil {
		err = fmt.Errorf("fetch whoop data: %w", err)
		s.recordSyncError(ctx, integrationID, err)
		return logAndReturn(err)
	}

	// Update last_sync_at for UI + monitoring.
	if err := s.DB.UpdateIntegrationLastSync(ctx, integrationID, time.Now()); err != nil {
		err = fmt.Errorf("update last sync: %w", err)
		s.recordSyncError(ctx, integrationID, err)
		return logAndReturn(err)
	}

	// Clear last_error on successful sync.
	_ = s.DB.UpsertIntegrationLastError(ctx, integrationID, nil)

	durationMs := time.Since(start).Milliseconds()
	s.logSyncStatus(ctx, userID, integrationID, durationMs, nil)

	return nil
}

func (s *Service) recordSyncError(ctx context.Context, integrationID string, err error) {
	if err == nil {
		return
	}

	msg := err.Error()
	if len(msg) > 500 {
		msg = msg[:500]
	}

	_ = s.DB.UpsertIntegrationLastError(ctx, integrationID, &msg)
}

func (s *Service) logSyncStatus(ctx context.Context, userID, integrationID string, durationMs int64, err error) {
	requestID := RequestIDFromContext(ctx)
	s.recordSyncMetrics(durationMs, err)

	if err != nil {
		s.logWithRequestID(requestID, "whoop sync failed user=%s integration=%s duration_ms=%d err=%v", userID, integrationID, durationMs, err)
		return
	}

	s.logWithRequestID(requestID, "whoop sync completed user=%s integration=%s duration_ms=%d", userID, integrationID, durationMs)
}

func (s *Service) logWithRequestID(requestID, format string, args ...interface{}) {
	message := fmt.Sprintf(format, args...)
	if requestID != "" {
		message = fmt.Sprintf("request_id=%s %s", requestID, message)
	}
	if s.Logger != nil {
		s.Logger.Printf("%s", message)
		return
	}
	log.Printf("%s", message)
}

func (s *Service) recordExchangeMetrics(err error) {
	if s.Metrics == nil {
		return
	}
	s.Metrics.RecordExchange(err)
}

func (s *Service) recordSyncMetrics(durationMs int64, err error) {
	if s.Metrics == nil {
		return
	}
	s.Metrics.RecordSync(time.Duration(durationMs)*time.Millisecond, err)
}

func (s *Service) recordRefreshMetrics(err error) {
	if s.Metrics == nil {
		return
	}
	s.Metrics.RecordRefresh(err)
}

func (s *Service) recordDisconnectMetrics(err error) {
	if s.Metrics == nil {
		return
	}
	s.Metrics.RecordDisconnect(err)
}

func (s *Service) recordWhoopAPIMetrics(err error) {
	if s.Metrics == nil {
		return
	}
	s.Metrics.RecordWhoopAPI(err)
}
