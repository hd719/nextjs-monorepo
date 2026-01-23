package whoop

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
)

const whoopAPIBase = "https://api.prod.whoop.com/developer"

const (
	resourceProfile         = "profile"
	resourceBodyMeasurement = "body_measurement"
	resourceCycle           = "cycle"
	resourceRecovery        = "recovery"
	resourceSleep           = "sleep"
	resourceWorkout         = "workout"
)

type collectionResponse struct {
	Records   []map[string]any `json:"records"`
	NextToken string           `json:"next_token"`
}

func (s *Service) fetchAndStoreWhoopData(ctx context.Context, integrationID, accessToken string) error {
	// High-level sync:
	// 1) Fetch single-object endpoints (profile/body)
	// 2) Fetch collection endpoints (cycles/recovery/sleep/workout)
	// 3) Store everything as raw JSON in integration_raw_event
	// Profile (single object)
	profilePayload, err := s.fetchWhoopObject(ctx, accessToken, "/v2/user/profile/basic")
	if err != nil {
		return fmt.Errorf("profile fetch: %w", err)
	}
	profileID := extractSourceID(profilePayload, "profile")
	profileBytes, err := json.Marshal(profilePayload)
	if err != nil {
		return fmt.Errorf("profile encode: %w", err)
	}
	if err := s.DB.UpsertIntegrationRawEvent(ctx, integrationID, resourceProfile, profileID, profileBytes); err != nil {
		return fmt.Errorf("profile store: %w", err)
	}
	// Use provider user id (if returned) to populate integration_connection.
	if userID, ok := profilePayload["user_id"]; ok {
		if providerID := anyToString(userID); providerID != "" {
			_ = s.DB.UpsertIntegrationConnection(ctx, integrationID, providerID)
		}
	}

	// Body measurement (single object)
	bodyPayload, err := s.fetchWhoopObject(ctx, accessToken, "/v2/user/measurement/body")
	if err != nil {
		return fmt.Errorf("body measurement fetch: %w", err)
	}
	bodyID := extractSourceID(bodyPayload, "body")
	bodyBytes, err := json.Marshal(bodyPayload)
	if err != nil {
		return fmt.Errorf("body measurement encode: %w", err)
	}
	if err := s.DB.UpsertIntegrationRawEvent(ctx, integrationID, resourceBodyMeasurement, bodyID, bodyBytes); err != nil {
		return fmt.Errorf("body measurement store: %w", err)
	}

	// Collections
	// These endpoints return paginated records with next_token.
	if err := s.fetchWhoopCollection(ctx, integrationID, accessToken, "/v2/cycle", resourceCycle); err != nil {
		return fmt.Errorf("cycle fetch: %w", err)
	}
	if err := s.fetchWhoopCollection(ctx, integrationID, accessToken, "/v2/recovery", resourceRecovery); err != nil {
		return fmt.Errorf("recovery fetch: %w", err)
	}
	if err := s.fetchWhoopCollection(ctx, integrationID, accessToken, "/v2/activity/sleep", resourceSleep); err != nil {
		return fmt.Errorf("sleep fetch: %w", err)
	}
	if err := s.fetchWhoopCollection(ctx, integrationID, accessToken, "/v2/activity/workout", resourceWorkout); err != nil {
		return fmt.Errorf("workout fetch: %w", err)
	}

	return nil
}

func (s *Service) fetchWhoopObject(ctx context.Context, accessToken, path string) (map[string]any, error) {
	// Single-object endpoints return one JSON object (map).
	body, err := s.fetchWhoop(ctx, accessToken, path, url.Values{})
	if err != nil {
		return nil, err
	}
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, err
	}
	return payload, nil
}

func (s *Service) fetchWhoopCollection(ctx context.Context, integrationID, accessToken, path, resourceType string) error {
	// Collection endpoints return a list of records + next_token for pagination.
	// We cap pages to avoid over-fetching on initial sync.
	const pageLimit = 25
	const maxPages = 5

	nextToken := ""
	for page := 0; page < maxPages; page++ {
		params := url.Values{}
		params.Set("limit", strconv.Itoa(pageLimit))
		if nextToken != "" {
			params.Set("next_token", nextToken)
		}

		body, err := s.fetchWhoop(ctx, accessToken, path, params)
		if err != nil {
			return err
		}

		var payload collectionResponse
		if err := json.Unmarshal(body, &payload); err != nil {
			return err
		}

		for _, record := range payload.Records {
			sourceID := extractSourceID(record, resourceType)
			if sourceID == "" {
				continue
			}
			// Store each record as raw JSON (jsonb).
			recordBytes, err := json.Marshal(record)
			if err != nil {
				return err
			}
			if err := s.DB.UpsertIntegrationRawEvent(ctx, integrationID, resourceType, sourceID, recordBytes); err != nil {
				return err
			}

			// Normalize into provider-agnostic tables (sleep/recovery/workout/cycle).
			if err := s.normalizeWhoopRecord(ctx, integrationID, resourceType, record, string(recordBytes)); err != nil {
				return err
			}
		}

		if payload.NextToken == "" {
			break
		}
		nextToken = payload.NextToken
	}

	// After all sleep rows are upserted, mark the longest sleep per day as primary.
	if resourceType == resourceSleep {
		if err := s.DB.UpdatePrimarySleep(ctx, integrationID); err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) fetchWhoop(ctx context.Context, accessToken, path string, params url.Values) ([]byte, error) {
	// Build full URL + query params.
	endpoint := fmt.Sprintf("%s%s", whoopAPIBase, path)
	if len(params) > 0 {
		endpoint = endpoint + "?" + params.Encode()
	}

	req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
	if err != nil {
		s.recordWhoopAPIMetrics(err)
		return nil, err
	}
	// WHOOP uses Bearer auth.
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")

	resp, err := s.HTTPClient.Do(req)
	if err != nil {
		s.recordWhoopAPIMetrics(err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		err := errors.New("whoop unauthorized")
		s.recordWhoopAPIMetrics(err)
		return nil, err
	}
	if resp.StatusCode >= 400 {
		err := fmt.Errorf("whoop api error: %s", resp.Status)
		s.recordWhoopAPIMetrics(err)
		return nil, err
	}

	payload, err := io.ReadAll(resp.Body)
	if err != nil {
		s.recordWhoopAPIMetrics(err)
		return nil, err
	}

	s.recordWhoopAPIMetrics(nil)
	return payload, nil
}

func extractSourceID(record map[string]any, fallback string) string {
	if id, ok := record["id"]; ok {
		if value := anyToString(id); value != "" {
			return value
		}
	}
	if id, ok := record["cycle_id"]; ok {
		if value := anyToString(id); value != "" {
			return value
		}
	}
	if id, ok := record["sleep_id"]; ok {
		if value := anyToString(id); value != "" {
			return value
		}
	}
	if id, ok := record["workout_id"]; ok {
		if value := anyToString(id); value != "" {
			return value
		}
	}
	if fallback != "" {
		return fallback
	}
	return ""
}

func anyToString(value any) string {
	switch v := value.(type) {
	case string:
		return v
	case float64:
		return strconv.FormatInt(int64(v), 10)
	case int64:
		return strconv.FormatInt(v, 10)
	case int:
		return strconv.Itoa(v)
	case json.Number:
		return v.String()
	default:
		return ""
	}
}
