package whoop

import (
	"context"
	"encoding/json"
	"errors"
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

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
	ExpiresIn    int64  `json:"expires_in"`
	Scope        string `json:"scope"`
	TokenType    string `json:"token_type"`
}

type Service struct {
	// DB implements the integration persistence contract (upserts + status).
	DB DB

	// HTTPClient is used for WHOOP token exchange.
	HTTPClient *http.Client

	// Logger writes structured-ish logs (use log.New or your own logger wrapper).
	Logger *log.Logger

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
}

func (s *Service) ExchangeHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: add internal auth middleware (API key + cookie JWT)
	// This handler:
	// 1) validates input
	// 2) exchanges the auth code for tokens
	// 3) encrypts + stores tokens
	// 4) marks the integration as connected
	var req ExchangeRequest

	// r.Body is a stream of bytes, we need to decode it into a struct using json.NewDecoder
	// NewDecoder lets you parse the stream without loading the entire body into memory
	// Decode() populates the struct fields based on JSON keys (like userId, code, redirectUri)
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	// Validate the request fields
	if req.UserID == "" || req.Code == "" || req.RedirectURI == "" {
		http.Error(w, "missing fields", http.StatusBadRequest)
		return
	}

	// Validate the redirect URI
	// req.RedirectURI is the redirect URI from the request (https://localhost:3003/integrations/whoop/callback)
	// s.RedirectURL is the redirect URI from the environment variable from the server (https://localhost:3003/integrations/whoop/callback)
	if req.RedirectURI != s.RedirectURL {
		http.Error(w, "invalid redirect_uri", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	token, err := s.exchangeToken(ctx, req.Code, req.RedirectURI)
	if err != nil {
		// We check s.Logger != nil to avoid a nil pointer panic.
		// In Go, calling a method on a nil pointer (like s.Logger.Printf) will crash the program, this guard makes logging optional — if no logger was injected, the handler still works its just a safety check
		if s.Logger != nil {
			s.Logger.Printf("whoop token exchange failed: %v", err)
		}
		http.Error(w, "token exchange failed", http.StatusBadGateway)
		return
	}

	// Encrypt tokens before storing them
	// Encrypt the access token before storing it in the database (limit the blast radius in case the database is compromised)
	var accessEnc string
	if token.AccessToken != "" {
		enc, err := Encrypt(token.AccessToken) // encrypt the access token before storing it in the database (limit the blast radius in case the database is compromised)
		if err != nil {
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
			http.Error(w, "encrypt failed", http.StatusInternalServerError)
			return
		}
		refreshEnc = &enc
	}

	expiresAt := time.Now().Add(time.Duration(token.ExpiresIn) * time.Second)

	// Upsert integration + store tokens
	integrationID, err := s.DB.UpsertIntegration(ctx, req.UserID, "whoop")
	if err != nil {
		log.Printf("whoop db error (upsert integration): %v", err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	log.Printf("integration created for user: %s, %s", req.UserID, integrationID)

	// Add the encrypted tokens to the database
	if err := s.DB.UpsertIntegrationToken(ctx, integrationID, accessEnc, refreshEnc, expiresAt, strings.Fields(token.Scope)); err != nil {
		log.Printf("whoop db error (upsert token): %v", err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	log.Printf("integration tokens stored for user: %s, %s", req.UserID, integrationID)

	// Mark the integration as connected
	if err := s.DB.MarkIntegrationConnected(ctx, integrationID); err != nil {
		log.Printf("whoop db error (mark connected): %v", err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	// TODO: enqueue initial sync job

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (s *Service) SyncHandler(w http.ResponseWriter, r *http.Request) {
	// This handler:
	// 1) validates input
	// 2) checks integration + token presence
	// 3) (TODO) fetches WHOOP data
	// 4) updates last_sync_at
	var req SyncRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	if req.UserID == "" {
		http.Error(w, "missing fields", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	integration, err := s.DB.GetIntegration(ctx, req.UserID, "whoop")
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			http.Error(w, "integration not found", http.StatusNotFound)
			return
		}
		log.Printf("whoop db error (get integration): %v", err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	if integration.Status != "connected" {
		http.Error(w, "integration not connected", http.StatusConflict)
		return
	}

	hasToken, err := s.DB.HasIntegrationToken(ctx, integration.ID)
	if err != nil {
		log.Printf("whoop db error (check token): %v", err)
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	if !hasToken {
		http.Error(w, "missing token", http.StatusBadRequest)
		return
	}

	// TODO: fetch WHOOP data and persist records

	if err := s.DB.UpdateIntegrationLastSync(ctx, integration.ID, time.Now()); err != nil {
		log.Printf("whoop db error (update last sync): %v", err)
		http.Error(w, "db error", http.StatusInternalServerError)
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
