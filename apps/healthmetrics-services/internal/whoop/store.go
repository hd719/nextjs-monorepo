package whoop

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("not found")

type IntegrationRecord struct {
	ID     string
	Status string
}

// Store implements the whoop.DB interface using pgxpool.
type Store struct {
	pool *pgxpool.Pool
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

// UpsertIntegration creates or updates the integration row and returns its id (integration_id)
func (s *Store) UpsertIntegration(ctx context.Context, userID, provider string) (string, error) {
	// $2::integration_provider means take the second parameter and cast it to the integration_provider enum type 'whoop'::integration_provider (enum type is a list of allowed values)
	const query = `
		INSERT INTO integration (user_id, provider, status)
		VALUES ($1, $2::"IntegrationProvider", 'disconnected')
		ON CONFLICT (user_id, provider) DO UPDATE
		SET updated_at = now()
		RETURNING id
	`

	var id string
	if err := s.pool.QueryRow(ctx, query, userID, provider).Scan(&id); err != nil {
		return "", fmt.Errorf("upsert integration: %w", err)
	}
	return id, nil
}

// Example flow:
// 1) UpsertIntegration("user_123","whoop") -> returns integration_id "int_abc"
// 2) UpsertIntegrationToken("int_abc", access, refresh, expires, scopes) -> stores tokens for that integration
// UpsertIntegrationToken stores encrypted tokens for the integration.
func (s *Store) UpsertIntegrationToken(
	ctx context.Context,
	integrationID string,
	accessEnc string,
	refreshEnc *string,
	expiresAt time.Time,
	scopes []string,
) error {
	const query = `
		INSERT INTO integration_token (
			integration_id,
			access_token_encrypted,
			refresh_token_encrypted,
			expires_at,
			scopes
		) VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (integration_id) DO UPDATE
		SET
			-- EXCLUDED refers to the row we attempted to insert (the incoming values).
			-- Example: EXCLUDED.access_token_encrypted is the new encrypted token.
			access_token_encrypted = EXCLUDED.access_token_encrypted,
			refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
			expires_at = EXCLUDED.expires_at,
			scopes = EXCLUDED.scopes,
			updated_at = now()
	`
	// Exec is enough here because we don't need a returned row/ID (unlike UpsertIntegration).
	_, err := s.pool.Exec(ctx, query, integrationID, accessEnc, refreshEnc, expiresAt, scopes)
	if err != nil {
		return fmt.Errorf("upsert integration token: %w", err)
	}
	return nil
}

// MarkIntegrationConnected marks integration status as connected.
func (s *Store) MarkIntegrationConnected(ctx context.Context, integrationID string) error {
	const query = `
		UPDATE integration
		SET status = 'connected', updated_at = now()
		WHERE id = $1
	`
	if _, err := s.pool.Exec(ctx, query, integrationID); err != nil {
		return fmt.Errorf("mark integration connected: %w", err)
	}
	return nil
}

// GetIntegration fetches the integration id + status for a user/provider.
func (s *Store) GetIntegration(ctx context.Context, userID, provider string) (IntegrationRecord, error) {
	const query = `
		SELECT id, status
		FROM integration
		WHERE user_id = $1 AND provider = $2::"IntegrationProvider"
		LIMIT 1
	`

	var record IntegrationRecord
	err := s.pool.QueryRow(ctx, query, userID, provider).Scan(&record.ID, &record.Status)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return IntegrationRecord{}, ErrNotFound
		}
		return IntegrationRecord{}, fmt.Errorf("get integration: %w", err)
	}
	return record, nil
}

// HasIntegrationToken confirms a token row exists for the integration.
func (s *Store) HasIntegrationToken(ctx context.Context, integrationID string) (bool, error) {
	const query = `
		SELECT 1
		FROM integration_token
		WHERE integration_id = $1
		LIMIT 1
	`

	var exists int
	err := s.pool.QueryRow(ctx, query, integrationID).Scan(&exists)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return false, nil
		}
		return false, fmt.Errorf("check integration token: %w", err)
	}

	return true, nil
}

// UpdateIntegrationLastSync updates last_sync_at after a successful sync.
func (s *Store) UpdateIntegrationLastSync(ctx context.Context, integrationID string, syncedAt time.Time) error {
	const query = `
		UPDATE integration
		SET last_sync_at = $2, updated_at = now()
		WHERE id = $1
	`
	if _, err := s.pool.Exec(ctx, query, integrationID, syncedAt); err != nil {
		return fmt.Errorf("update last sync: %w", err)
	}
	return nil
}
