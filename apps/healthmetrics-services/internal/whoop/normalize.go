package whoop

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
)

// normalizeWhoopRecord maps a raw WHOOP record into provider-agnostic tables.
// We store full payload JSON in extras so we can support future providers with extra fields.
func (s *Service) normalizeWhoopRecord(ctx context.Context, integrationID, resourceType string, record map[string]any, extras string) error {
	switch resourceType {
	case resourceSleep:
		return s.normalizeSleep(ctx, integrationID, record, extras)
	case resourceRecovery:
		return s.normalizeRecovery(ctx, integrationID, record, extras)
	case resourceWorkout:
		return s.normalizeWorkout(ctx, integrationID, record, extras)
	case resourceCycle:
		return s.normalizeCycle(ctx, integrationID, record, extras)
	default:
		return nil
	}
}

func (s *Service) normalizeSleep(ctx context.Context, integrationID string, record map[string]any, extras string) error {
	startStr := getString(record, "start")
	endStr := getString(record, "end")
	if startStr == "" || endStr == "" {
		return nil
	}

	startAt, err := parseTime(startStr)
	if err != nil {
		return fmt.Errorf("parse sleep start: %w", err)
	}
	endAt, err := parseTime(endStr)
	if err != nil {
		return fmt.Errorf("parse sleep end: %w", err)
	}

	tzOffsetMinutes := parseTimezoneOffsetMinutes(getString(record, "timezone_offset"))
	localDate := localDateFrom(startAt, tzOffsetMinutes)

	durationSeconds := int(endAt.Sub(startAt).Seconds())
	if durationSeconds < 0 {
		durationSeconds = 0
	}

	scoreMap := getMap(record, "score")
	sleepScoreValue, sleepScoreOk := getFloatValue(scoreMap, "sleep_performance_percentage")
	sleepScore := intPtrFromFloat(sleepScoreValue, sleepScoreOk)

	isNap := getBool(record, "nap")

	externalID := anyToString(record["id"])
	if externalID == "" {
		return nil
	}

	extrasCopy := extras
	return s.DB.UpsertIntegrationSleep(ctx, IntegrationSleepRecord{
		IntegrationID:         integrationID,
		ExternalID:            externalID,
		StartAt:               startAt,
		EndAt:                 endAt,
		LocalDate:             localDate,
		SourceTzOffsetMinutes: tzOffsetMinutes,
		DurationSeconds:       durationSeconds,
		SleepScore:            sleepScore,
		IsNap:                 isNap,
		IsPrimary:             false, // set in UpdatePrimarySleep after all rows are upserted
		Extras:                &extrasCopy,
	})
}

func (s *Service) normalizeRecovery(ctx context.Context, integrationID string, record map[string]any, extras string) error {
	createdAtStr := getString(record, "created_at")
	if createdAtStr == "" {
		return nil
	}
	createdAt, err := parseTime(createdAtStr)
	if err != nil {
		return fmt.Errorf("parse recovery created_at: %w", err)
	}

	tzOffsetMinutes := parseTimezoneOffsetMinutes(getString(record, "timezone_offset"))
	localDate := localDateFrom(createdAt, tzOffsetMinutes)

	scoreMap := getMap(record, "score")
	recoveryScoreValue, recoveryScoreOk := getFloatValue(scoreMap, "recovery_score")
	recoveryScore := intPtrFromFloat(recoveryScoreValue, recoveryScoreOk)
	hrvValue, hrvOk := getFloatValue(scoreMap, "hrv_rmssd_milli")
	hrv := floatPtr(hrvValue, hrvOk)
	spo2Value, spo2Ok := getFloatValue(scoreMap, "spo2_percentage")
	spo2 := floatPtr(spo2Value, spo2Ok)
	restingHrValue, restingHrOk := getFloatValue(scoreMap, "resting_heart_rate")
	restingHR := intPtrFromFloat(restingHrValue, restingHrOk)

	externalID := anyToString(record["cycle_id"])
	if externalID == "" {
		externalID = anyToString(record["id"])
	}
	if externalID == "" {
		return nil
	}

	extrasCopy := extras
	return s.DB.UpsertIntegrationRecovery(ctx, IntegrationRecoveryRecord{
		IntegrationID:         integrationID,
		ExternalID:            externalID,
		LocalDate:             localDate,
		SourceTzOffsetMinutes: tzOffsetMinutes,
		RecoveryScore:         recoveryScore,
		HrvRmssdMs:            hrv,
		RestingHrBpm:          restingHR,
		Spo2Pct:               spo2,
		Extras:                &extrasCopy,
	})
}

func (s *Service) normalizeCycle(ctx context.Context, integrationID string, record map[string]any, extras string) error {
	startStr := getString(record, "start")
	endStr := getString(record, "end")
	if startStr == "" || endStr == "" {
		return nil
	}
	startAt, err := parseTime(startStr)
	if err != nil {
		return fmt.Errorf("parse cycle start: %w", err)
	}
	endAt, err := parseTime(endStr)
	if err != nil {
		return fmt.Errorf("parse cycle end: %w", err)
	}

	tzOffsetMinutes := parseTimezoneOffsetMinutes(getString(record, "timezone_offset"))
	localDate := localDateFrom(startAt, tzOffsetMinutes)

	scoreMap := getMap(record, "score")
	dayStrainValue, dayStrainOk := getFloatValue(scoreMap, "strain")
	dayStrain := floatPtr(dayStrainValue, dayStrainOk)
	kilojoulesValue, kilojoulesOk := getFloatValue(scoreMap, "kilojoule")
	kilojoules := floatPtr(kilojoulesValue, kilojoulesOk)
	avgHrValue, avgHrOk := getFloatValue(scoreMap, "average_heart_rate")
	avgHR := intPtrFromFloat(avgHrValue, avgHrOk)
	maxHrValue, maxHrOk := getFloatValue(scoreMap, "max_heart_rate")
	maxHR := intPtrFromFloat(maxHrValue, maxHrOk)

	externalID := anyToString(record["id"])
	if externalID == "" {
		return nil
	}

	extrasCopy := extras
	return s.DB.UpsertIntegrationCycle(ctx, IntegrationCycleRecord{
		IntegrationID:         integrationID,
		ExternalID:            externalID,
		StartAt:               startAt,
		EndAt:                 endAt,
		LocalDate:             localDate,
		SourceTzOffsetMinutes: tzOffsetMinutes,
		DayStrain:             dayStrain,
		Kilojoules:            kilojoules,
		AvgHrBpm:              avgHR,
		MaxHrBpm:              maxHR,
		Extras:                &extrasCopy,
	})
}

func (s *Service) normalizeWorkout(ctx context.Context, integrationID string, record map[string]any, extras string) error {
	startStr := getString(record, "start")
	endStr := getString(record, "end")
	if startStr == "" || endStr == "" {
		return nil
	}

	startAt, err := parseTime(startStr)
	if err != nil {
		return fmt.Errorf("parse workout start: %w", err)
	}
	endAt, err := parseTime(endStr)
	if err != nil {
		return fmt.Errorf("parse workout end: %w", err)
	}

	tzOffsetMinutes := parseTimezoneOffsetMinutes(getString(record, "timezone_offset"))
	localDate := localDateFrom(startAt, tzOffsetMinutes)

	scoreMap := getMap(record, "score")
	strainValue, strainOk := getFloatValue(scoreMap, "strain")
	strain := floatPtr(strainValue, strainOk)
	kilojoules, kjOk := getFloatValue(scoreMap, "kilojoule")
	calories := floatPtrWithOk(convertKilojoulesToKcal(kilojoules), kjOk)
	distanceMeters, distOk := getFloatValue(scoreMap, "distance_meter")
	distanceKm := floatPtrWithOk(convertMetersToKm(distanceMeters), distOk)

	sportName := getString(record, "sport_name")
	var sportNamePtr *string
	if sportName != "" {
		sportNamePtr = &sportName
	}

	externalID := anyToString(record["id"])
	if externalID == "" {
		return nil
	}

	extrasCopy := extras
	return s.DB.UpsertIntegrationWorkout(ctx, IntegrationWorkoutRecord{
		IntegrationID:         integrationID,
		ExternalID:            externalID,
		StartAt:               startAt,
		EndAt:                 endAt,
		LocalDate:             localDate,
		SourceTzOffsetMinutes: tzOffsetMinutes,
		SportName:             sportNamePtr,
		Strain:                strain,
		CaloriesKcal:          calories,
		DistanceKm:            distanceKm,
		Extras:                &extrasCopy,
	})
}

func parseTime(value string) (time.Time, error) {
	return time.Parse(time.RFC3339Nano, value)
}

func parseTimezoneOffsetMinutes(value string) int {
	if value == "" || value == "Z" {
		return 0
	}
	sign := 1
	if strings.HasPrefix(value, "-") {
		sign = -1
		value = strings.TrimPrefix(value, "-")
	} else if strings.HasPrefix(value, "+") {
		value = strings.TrimPrefix(value, "+")
	}

	parts := strings.Split(value, ":")
	if len(parts) != 2 {
		return 0
	}

	hours, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0
	}
	minutes, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0
	}

	return sign * (hours*60 + minutes)
}

func localDateFrom(value time.Time, offsetMinutes int) time.Time {
	local := value.Add(time.Duration(offsetMinutes) * time.Minute)
	return time.Date(local.Year(), local.Month(), local.Day(), 0, 0, 0, 0, time.UTC)
}

func getString(record map[string]any, key string) string {
	value, ok := record[key]
	if !ok {
		return ""
	}
	if str, ok := value.(string); ok {
		return str
	}
	return ""
}

func getBool(record map[string]any, key string) bool {
	value, ok := record[key]
	if !ok {
		return false
	}
	if b, ok := value.(bool); ok {
		return b
	}
	return false
}

func getFloatValue(record map[string]any, key string) (float64, bool) {
	value, ok := record[key]
	if !ok || value == nil {
		return 0, false
	}
	switch v := value.(type) {
	case float64:
		return v, true
	case json.Number:
		f, err := v.Float64()
		if err != nil {
			return 0, false
		}
		return f, true
	default:
		return 0, false
	}
}

func getMap(record map[string]any, key string) map[string]any {
	value, ok := record[key]
	if !ok {
		return map[string]any{}
	}
	if m, ok := value.(map[string]any); ok {
		return m
	}
	return map[string]any{}
}

func intPtrFromFloat(value float64, ok bool) *int {
	if !ok {
		return nil
	}
	result := int(math.Round(value))
	return &result
}

func floatPtr(value float64, ok bool) *float64 {
	if !ok {
		return nil
	}
	return &value
}

func floatPtrWithOk(value float64, ok bool) *float64 {
	if !ok {
		return nil
	}
	return &value
}

func convertMetersToKm(value float64) float64 {
	if value == 0 {
		return 0
	}
	return value / 1000
}

func convertKilojoulesToKcal(value float64) float64 {
	if value == 0 {
		return 0
	}
	return value / 4.184
}
