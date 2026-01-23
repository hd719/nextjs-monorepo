package whoop

import (
	"context"
	"encoding/base64"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"
)

type tokenCall struct {
	integrationID string
	accessEnc     string
	refreshEnc    *string
	expiresAt     time.Time
	scopes        []string
}

type rawEventCall struct {
	resourceType string
	sourceID     string
}

// fakeDB is a minimal in-memory DB stub that records sync side-effects.
type fakeDB struct {
	hasToken bool

	tokenRecord IntegrationTokenRecord

	upsertTokenCalls []tokenCall
	rawEvents        []rawEventCall
	lastSyncAt       *time.Time
	providerUserID   string
}

func (f *fakeDB) UpsertIntegration(ctx context.Context, userID, provider string) (string, error) {
	return "integration_1", nil
}

func (f *fakeDB) UpsertIntegrationToken(ctx context.Context, integrationID string, accessEnc string, refreshEnc *string, expiresAt time.Time, scopes []string) error {
	f.upsertTokenCalls = append(f.upsertTokenCalls, tokenCall{
		integrationID: integrationID,
		accessEnc:     accessEnc,
		refreshEnc:    refreshEnc,
		expiresAt:     expiresAt,
		scopes:        scopes,
	})
	return nil
}

func (f *fakeDB) MarkIntegrationConnected(ctx context.Context, integrationID string) error {
	return nil
}

func (f *fakeDB) GetIntegration(ctx context.Context, userID, provider string) (IntegrationRecord, error) {
	return IntegrationRecord{ID: "integration_1", Status: "connected"}, nil
}

func (f *fakeDB) HasIntegrationToken(ctx context.Context, integrationID string) (bool, error) {
	return f.hasToken, nil
}

func (f *fakeDB) UpdateIntegrationLastSync(ctx context.Context, integrationID string, syncedAt time.Time) error {
	f.lastSyncAt = &syncedAt
	return nil
}

func (f *fakeDB) GetIntegrationToken(ctx context.Context, integrationID string) (IntegrationTokenRecord, error) {
	return f.tokenRecord, nil
}

func (f *fakeDB) UpsertIntegrationRawEvent(ctx context.Context, integrationID, resourceType, sourceID string, payload []byte) error {
	f.rawEvents = append(f.rawEvents, rawEventCall{
		resourceType: resourceType,
		sourceID:     sourceID,
	})
	return nil
}

func (f *fakeDB) UpsertIntegrationSleep(ctx context.Context, data IntegrationSleepRecord) error {
	return nil
}

func (f *fakeDB) UpsertIntegrationRecovery(ctx context.Context, data IntegrationRecoveryRecord) error {
	return nil
}

func (f *fakeDB) UpsertIntegrationWorkout(ctx context.Context, data IntegrationWorkoutRecord) error {
	return nil
}

func (f *fakeDB) UpsertIntegrationCycle(ctx context.Context, data IntegrationCycleRecord) error {
	return nil
}

func (f *fakeDB) UpdatePrimarySleep(ctx context.Context, integrationID string) error {
	return nil
}

func (f *fakeDB) UpsertIntegrationLastError(ctx context.Context, integrationID string, lastError *string) error {
	return nil
}

func (f *fakeDB) UpsertIntegrationConnection(ctx context.Context, integrationID, providerUserID string) error {
	f.providerUserID = providerUserID
	return nil
}

func (f *fakeDB) DeleteIntegrationTokens(ctx context.Context, integrationID string) error {
	return nil
}

func (f *fakeDB) MarkIntegrationDisconnected(ctx context.Context, integrationID string) error {
	return nil
}

type stubTransport struct{}

func (s *stubTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	switch req.URL.Host {
	case "token.local":
		return jsonResponse(200, `{"access_token":"new_access","refresh_token":"new_refresh","expires_in":3600,"scope":"read:profile offline","token_type":"bearer"}`), nil
	case "api.prod.whoop.com":
		path := req.URL.Path
		switch {
		case strings.Contains(path, "/v2/user/profile/basic"):
			return jsonResponse(200, `{"id":"profile_1","user_id":"whoop_user_1"}`), nil
		case strings.Contains(path, "/v2/user/measurement/body"):
			return jsonResponse(200, `{"id":"body_1"}`), nil
		case strings.Contains(path, "/v2/cycle"):
			return jsonResponse(200, `{"records":[{"id":"cycle_1"}],"next_token":""}`), nil
		case strings.Contains(path, "/v2/recovery"):
			return jsonResponse(200, `{"records":[{"id":"recovery_1"}],"next_token":""}`), nil
		case strings.Contains(path, "/v2/activity/sleep"):
			return jsonResponse(200, `{"records":[{"id":"sleep_1"}],"next_token":""}`), nil
		case strings.Contains(path, "/v2/activity/workout"):
			return jsonResponse(200, `{"records":[{"id":"workout_1"}],"next_token":""}`), nil
		default:
			return jsonResponse(404, `{"error":"not found"}`), nil
		}
	default:
		return jsonResponse(404, `{"error":"unknown host"}`), nil
	}
}

func jsonResponse(status int, payload string) *http.Response {
	return &http.Response{
		StatusCode: status,
		Status:     http.StatusText(status),
		Header:     http.Header{"Content-Type": []string{"application/json"}},
		Body:       io.NopCloser(strings.NewReader(payload)),
	}
}

func setEncryptionKey(t *testing.T) {
	key := make([]byte, 32)
	for i := range key {
		key[i] = byte(i + 1)
	}
	t.Setenv("WHOOP_TOKEN_ENCRYPTION_KEY", base64.StdEncoding.EncodeToString(key))
}

func TestSyncIntegration_Success_NoRefresh(t *testing.T) {
	setEncryptionKey(t)

	accessEnc, err := Encrypt("access_token")
	if err != nil {
		t.Fatalf("encrypt access token: %v", err)
	}

	tokenRecord := IntegrationTokenRecord{
		AccessTokenEncrypted: accessEnc,
		ExpiresAt:            ptrTime(time.Now().Add(10 * time.Minute)),
		Scopes:               []string{"read:profile"},
	}

	db := &fakeDB{
		hasToken:    true,
		tokenRecord: tokenRecord,
	}

	service := &Service{
		DB:         db,
		HTTPClient: &http.Client{Transport: &stubTransport{}},
	}

	if err := service.SyncIntegration(context.Background(), "user_1", "integration_1"); err != nil {
		t.Fatalf("sync integration: %v", err)
	}

	if len(db.rawEvents) != 6 {
		t.Fatalf("expected 6 raw events, got %d", len(db.rawEvents))
	}

	if db.lastSyncAt == nil {
		t.Fatalf("expected lastSyncAt to be set")
	}

	if db.providerUserID != "whoop_user_1" {
		t.Fatalf("expected provider user id to be stored, got %q", db.providerUserID)
	}

	if len(db.upsertTokenCalls) != 0 {
		t.Fatalf("did not expect token refresh, got %d upserts", len(db.upsertTokenCalls))
	}
}

func TestSyncIntegration_RefreshesExpiredToken(t *testing.T) {
	setEncryptionKey(t)

	accessEnc, err := Encrypt("expired_access")
	if err != nil {
		t.Fatalf("encrypt access token: %v", err)
	}
	refreshEnc, err := Encrypt("refresh_token")
	if err != nil {
		t.Fatalf("encrypt refresh token: %v", err)
	}

	tokenRecord := IntegrationTokenRecord{
		AccessTokenEncrypted:  accessEnc,
		RefreshTokenEncrypted: &refreshEnc,
		ExpiresAt:             ptrTime(time.Now().Add(-1 * time.Minute)),
		Scopes:                []string{"read:profile", "offline"},
	}

	db := &fakeDB{
		hasToken:    true,
		tokenRecord: tokenRecord,
	}

	service := &Service{
		DB:           db,
		HTTPClient:   &http.Client{Transport: &stubTransport{}},
		TokenURL:     "https://token.local/oauth/oauth2/token",
		ClientID:     "client",
		ClientSecret: "secret",
	}

	if err := service.SyncIntegration(context.Background(), "user_1", "integration_1"); err != nil {
		t.Fatalf("sync integration: %v", err)
	}

	if len(db.upsertTokenCalls) != 1 {
		t.Fatalf("expected token refresh upsert, got %d", len(db.upsertTokenCalls))
	}

	decrypted, err := Decrypt(db.upsertTokenCalls[0].accessEnc)
	if err != nil {
		t.Fatalf("decrypt refreshed token: %v", err)
	}
	if decrypted != "new_access" {
		t.Fatalf("expected refreshed access token, got %q", decrypted)
	}
}

func TestSyncIntegration_MissingToken(t *testing.T) {
	setEncryptionKey(t)

	db := &fakeDB{hasToken: false}
	service := &Service{
		DB:         db,
		HTTPClient: &http.Client{Transport: &stubTransport{}},
	}

	if err := service.SyncIntegration(context.Background(), "user_1", "integration_1"); err == nil {
		t.Fatalf("expected missing token error")
	}
}

func ptrTime(value time.Time) *time.Time {
	return &value
}
