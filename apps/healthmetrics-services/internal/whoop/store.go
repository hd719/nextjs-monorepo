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

type IntegrationTokenRecord struct {
	AccessTokenEncrypted  string
	RefreshTokenEncrypted *string
	ExpiresAt             *time.Time
	Scopes                []string
}

type ConnectedIntegration struct {
	ID     string
	UserID string
}

type IntegrationSleepRecord struct {
	IntegrationID         string
	ExternalID            string
	StartAt               time.Time
	EndAt                 time.Time
	LocalDate             time.Time
	SourceTzOffsetMinutes int
	DurationSeconds       int
	SleepScore            *int
	IsNap                 bool
	IsPrimary             bool
	Extras                *string
}

type IntegrationRecoveryRecord struct {
	IntegrationID         string
	ExternalID            string
	LocalDate             time.Time
	SourceTzOffsetMinutes int
	RecoveryScore         *int
	HrvRmssdMs            *float64
	RestingHrBpm          *int
	Spo2Pct               *float64
	Extras                *string
}

type IntegrationWorkoutRecord struct {
	IntegrationID         string
	ExternalID            string
	StartAt               time.Time
	EndAt                 time.Time
	LocalDate             time.Time
	SourceTzOffsetMinutes int
	SportName             *string
	Strain                *float64
	CaloriesKcal          *float64
	DistanceKm            *float64
	Extras                *string
}

type IntegrationCycleRecord struct {
	IntegrationID         string
	ExternalID            string
	StartAt               time.Time
	EndAt                 time.Time
	LocalDate             time.Time
	SourceTzOffsetMinutes int
	DayStrain             *float64
	Kilojoules            *float64
	AvgHrBpm              *int
	MaxHrBpm              *int
	Extras                *string
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
	// Cast provider to the enum type to satisfy Postgres.
	// Example: $2::"IntegrationProvider" -> 'whoop'::"IntegrationProvider"
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
	// Upsert tokens by integration_id so we keep a single row per integration.
	// On refresh, this replaces the existing encrypted tokens + expiry.
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
	// Simple status flip so UI can show "Connected".
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
	// Look up integration by user + provider (unique constraint in Prisma).
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
	// Lightweight existence check to guard missing token rows.
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
	// Update last_sync_at so FE can display the last successful sync time.
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

// GetIntegrationToken loads the encrypted tokens for an integration.
func (s *Store) GetIntegrationToken(ctx context.Context, integrationID string) (IntegrationTokenRecord, error) {
	// Load encrypted tokens + expiry for API calls.
	const query = `
		SELECT access_token_encrypted, refresh_token_encrypted, expires_at, scopes
		FROM integration_token
		WHERE integration_id = $1
		LIMIT 1
	`

	var record IntegrationTokenRecord
	err := s.pool.QueryRow(ctx, query, integrationID).Scan(
		&record.AccessTokenEncrypted,
		&record.RefreshTokenEncrypted,
		&record.ExpiresAt,
		&record.Scopes,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return IntegrationTokenRecord{}, ErrNotFound
		}
		return IntegrationTokenRecord{}, fmt.Errorf("get integration token: %w", err)
	}
	return record, nil
}

// UpsertIntegrationRawEvent stores raw WHOOP payloads by resource type + source id.
func (s *Store) UpsertIntegrationRawEvent(ctx context.Context, integrationID, resourceType, sourceID string, payload []byte) error {
	// Store raw WHOOP payloads. Unique key is (integration_id, source_id, resource_type).
	// Upsert prevents duplicates on repeated syncs.
	const query = `
		INSERT INTO integration_raw_event (
			integration_id,
			resource_type,
			payload,
			source_id
		) VALUES ($1, $2, $3, $4)
		ON CONFLICT (integration_id, source_id, resource_type) DO UPDATE
		SET payload = EXCLUDED.payload
	`

	if _, err := s.pool.Exec(ctx, query, integrationID, resourceType, payload, sourceID); err != nil {
		return fmt.Errorf("upsert raw event: %w", err)
	}
	return nil
}

// UpsertIntegrationSleep stores normalized sleep data (one row per sleep session).
func (s *Store) UpsertIntegrationSleep(ctx context.Context, data IntegrationSleepRecord) error {
	// Sleep rows are unique per integration + external_id (WHOOP sleep id).
	const query = `
		INSERT INTO integration_sleep (
			integration_id,
			external_id,
			start_at,
			end_at,
			local_date,
			source_tz_offset_minutes,
			duration_seconds,
			sleep_score,
			is_nap,
			is_primary,
			extras
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
		ON CONFLICT (integration_id, external_id) DO UPDATE
		SET
			start_at = EXCLUDED.start_at,
			end_at = EXCLUDED.end_at,
			local_date = EXCLUDED.local_date,
			source_tz_offset_minutes = EXCLUDED.source_tz_offset_minutes,
			duration_seconds = EXCLUDED.duration_seconds,
			sleep_score = EXCLUDED.sleep_score,
			is_nap = EXCLUDED.is_nap,
			is_primary = EXCLUDED.is_primary,
			extras = EXCLUDED.extras,
			updated_at = now()
	`

	if _, err := s.pool.Exec(
		ctx,
		query,
		data.IntegrationID,
		data.ExternalID,
		data.StartAt,
		data.EndAt,
		data.LocalDate,
		data.SourceTzOffsetMinutes,
		data.DurationSeconds,
		data.SleepScore,
		data.IsNap,
		data.IsPrimary,
		data.Extras,
	); err != nil {
		return fmt.Errorf("upsert integration sleep: %w", err)
	}
	return nil
}

// UpdatePrimarySleep marks the longest sleep per local_date as primary.
func (s *Store) UpdatePrimarySleep(ctx context.Context, integrationID string) error {
	// We rank sleeps by duration per local_date and set is_primary on the longest row.
	const query = `
		WITH ranked AS (
			SELECT
				id,
				ROW_NUMBER() OVER (
					PARTITION BY integration_id, local_date
					ORDER BY duration_seconds DESC
				) AS rn
			FROM integration_sleep
			WHERE integration_id = $1
		)
		UPDATE integration_sleep AS s
		SET is_primary = (ranked.rn = 1)
		FROM ranked
		WHERE s.id = ranked.id
	`

	if _, err := s.pool.Exec(ctx, query, integrationID); err != nil {
		return fmt.Errorf("update primary sleep: %w", err)
	}
	return nil
}

// UpsertIntegrationRecovery stores normalized recovery data (one row per recovery day).
func (s *Store) UpsertIntegrationRecovery(ctx context.Context, data IntegrationRecoveryRecord) error {
	// Recovery rows are unique per integration + external_id (WHOOP cycle_id).
	const query = `
		INSERT INTO integration_recovery (
			integration_id,
			external_id,
			local_date,
			source_tz_offset_minutes,
			recovery_score,
			hrv_rmssd_ms,
			resting_hr_bpm,
			spo2_pct,
			extras
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
		ON CONFLICT (integration_id, external_id) DO UPDATE
		SET
			local_date = EXCLUDED.local_date,
			source_tz_offset_minutes = EXCLUDED.source_tz_offset_minutes,
			recovery_score = EXCLUDED.recovery_score,
			hrv_rmssd_ms = EXCLUDED.hrv_rmssd_ms,
			resting_hr_bpm = EXCLUDED.resting_hr_bpm,
			spo2_pct = EXCLUDED.spo2_pct,
			extras = EXCLUDED.extras,
			updated_at = now()
	`

	if _, err := s.pool.Exec(
		ctx,
		query,
		data.IntegrationID,
		data.ExternalID,
		data.LocalDate,
		data.SourceTzOffsetMinutes,
		data.RecoveryScore,
		data.HrvRmssdMs,
		data.RestingHrBpm,
		data.Spo2Pct,
		data.Extras,
	); err != nil {
		return fmt.Errorf("upsert integration recovery: %w", err)
	}
	return nil
}

// UpsertIntegrationWorkout stores normalized workout data (one row per workout).
func (s *Store) UpsertIntegrationWorkout(ctx context.Context, data IntegrationWorkoutRecord) error {
	// Workout rows are unique per integration + external_id (WHOOP workout id).
	const query = `
		INSERT INTO integration_workout (
			integration_id,
			external_id,
			start_at,
			end_at,
			local_date,
			source_tz_offset_minutes,
			sport_name,
			strain,
			calories_kcal,
			distance_km,
			extras
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
		ON CONFLICT (integration_id, external_id) DO UPDATE
		SET
			start_at = EXCLUDED.start_at,
			end_at = EXCLUDED.end_at,
			local_date = EXCLUDED.local_date,
			source_tz_offset_minutes = EXCLUDED.source_tz_offset_minutes,
			sport_name = EXCLUDED.sport_name,
			strain = EXCLUDED.strain,
			calories_kcal = EXCLUDED.calories_kcal,
			distance_km = EXCLUDED.distance_km,
			extras = EXCLUDED.extras,
			updated_at = now()
	`

	if _, err := s.pool.Exec(
		ctx,
		query,
		data.IntegrationID,
		data.ExternalID,
		data.StartAt,
		data.EndAt,
		data.LocalDate,
		data.SourceTzOffsetMinutes,
		data.SportName,
		data.Strain,
		data.CaloriesKcal,
		data.DistanceKm,
		data.Extras,
	); err != nil {
		return fmt.Errorf("upsert integration workout: %w", err)
	}
	return nil
}

// UpsertIntegrationCycle stores normalized cycle data (one row per cycle).
func (s *Store) UpsertIntegrationCycle(ctx context.Context, data IntegrationCycleRecord) error {
	// Cycle rows are unique per integration + external_id (WHOOP cycle id).
	const query = `
		INSERT INTO integration_cycle (
			integration_id,
			external_id,
			start_at,
			end_at,
			local_date,
			source_tz_offset_minutes,
			day_strain,
			kilojoules,
			avg_hr_bpm,
			max_hr_bpm,
			extras
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
		ON CONFLICT (integration_id, external_id) DO UPDATE
		SET
			start_at = EXCLUDED.start_at,
			end_at = EXCLUDED.end_at,
			local_date = EXCLUDED.local_date,
			source_tz_offset_minutes = EXCLUDED.source_tz_offset_minutes,
			day_strain = EXCLUDED.day_strain,
			kilojoules = EXCLUDED.kilojoules,
			avg_hr_bpm = EXCLUDED.avg_hr_bpm,
			max_hr_bpm = EXCLUDED.max_hr_bpm,
			extras = EXCLUDED.extras,
			updated_at = now()
	`

	if _, err := s.pool.Exec(
		ctx,
		query,
		data.IntegrationID,
		data.ExternalID,
		data.StartAt,
		data.EndAt,
		data.LocalDate,
		data.SourceTzOffsetMinutes,
		data.DayStrain,
		data.Kilojoules,
		data.AvgHrBpm,
		data.MaxHrBpm,
		data.Extras,
	); err != nil {
		return fmt.Errorf("upsert integration cycle: %w", err)
	}
	return nil
}

// UpsertIntegrationConnection stores provider user id when available.
func (s *Store) UpsertIntegrationConnection(ctx context.Context, integrationID, providerUserID string) error {
	// Store provider user id (when available) for auditing / debugging.
	const query = `
		INSERT INTO integration_connection (
			integration_id,
			provider_user_id
		) VALUES ($1, $2)
		ON CONFLICT (integration_id) DO UPDATE
		SET provider_user_id = EXCLUDED.provider_user_id
	`

	if _, err := s.pool.Exec(ctx, query, integrationID, providerUserID); err != nil {
		return fmt.Errorf("upsert integration connection: %w", err)
	}
	return nil
}

// UpsertIntegrationLastError stores the last sync error for troubleshooting.
func (s *Store) UpsertIntegrationLastError(ctx context.Context, integrationID string, lastError *string) error {
	// Upsert into integration_connection so UI can surface last_error if needed.
	const query = `
		INSERT INTO integration_connection (
			integration_id,
			last_error
		) VALUES ($1, $2)
		ON CONFLICT (integration_id) DO UPDATE
		SET last_error = EXCLUDED.last_error
	`

	if _, err := s.pool.Exec(ctx, query, integrationID, lastError); err != nil {
		return fmt.Errorf("upsert integration last error: %w", err)
	}
	return nil
}

// DeleteIntegrationTokens removes stored tokens on disconnect.
func (s *Store) DeleteIntegrationTokens(ctx context.Context, integrationID string) error {
	// Remove stored tokens on disconnect (data remains).
	const query = `
		DELETE FROM integration_token
		WHERE integration_id = $1
	`
	if _, err := s.pool.Exec(ctx, query, integrationID); err != nil {
		return fmt.Errorf("delete integration tokens: %w", err)
	}
	return nil
}

// MarkIntegrationDisconnected updates the integration status.
func (s *Store) MarkIntegrationDisconnected(ctx context.Context, integrationID string) error {
	// Flip status back to disconnected (UI will show Disconnect state).
	const query = `
		UPDATE integration
		SET status = 'disconnected', updated_at = now()
		WHERE id = $1
	`
	if _, err := s.pool.Exec(ctx, query, integrationID); err != nil {
		return fmt.Errorf("mark integration disconnected: %w", err)
	}
	return nil
}

// ListConnectedIntegrations returns all connected integrations for a provider.
func (s *Store) ListConnectedIntegrations(ctx context.Context, provider string) ([]ConnectedIntegration, error) {
	// We only schedule syncs for integrations marked as "connected".
	const query = `
		SELECT id, user_id
		FROM integration
		WHERE provider = $1::"IntegrationProvider" AND status = 'connected'
	`

	rows, err := s.pool.Query(ctx, query, provider)
	if err != nil {
		return nil, fmt.Errorf("list integrations: %w", err)
	}
	defer rows.Close()

	var items []ConnectedIntegration
	for rows.Next() {
		var row ConnectedIntegration
		if err := rows.Scan(&row.ID, &row.UserID); err != nil {
			return nil, fmt.Errorf("scan integration: %w", err)
		}
		items = append(items, row)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("iterate integrations: %w", rows.Err())
	}
	return items, nil
}
