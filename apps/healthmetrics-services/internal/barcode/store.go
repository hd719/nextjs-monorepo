package barcode

import (
	"context"      // request-scoped context for DB calls
	"database/sql" // NullFloat64/NullString for nullable DB columns
	"errors"
	"fmt" // formatted errors
	"regexp"
	"strconv"
	"strings"
	"time" // timestamps + updated_at

	"github.com/jackc/pgx/v5"         // ErrNoRows check
	"github.com/jackc/pgx/v5/pgxpool" // DB pool type
	"github.com/openfoodfacts/openfoodfacts-go"
)

var servingSizeRegex = regexp.MustCompile(`^\s*([0-9]+(?:\.[0-9]+)?)\s*(g)\s*$`) // accept "30 g" or "30g"

func parseServingSize(raw string) (float64, string) {
	// Default to 100g when parsing fails.
	defaultValue := 100.0
	defaultUnit := "g"

	trimmed := strings.TrimSpace(strings.ToLower(raw))
	if trimmed == "" {
		return defaultValue, defaultUnit
	}

	matches := servingSizeRegex.FindStringSubmatch(trimmed)
	if len(matches) != 3 {
		return defaultValue, defaultUnit
	}

	value, err := strconv.ParseFloat(matches[1], 64)
	if err != nil || value <= 0 {
		return defaultValue, defaultUnit
	}

	unit := matches[2]
	return value, unit
}

// In Go float64 and string are value types, so they always have a default value (0 and ""). They can’t be nil
// To represent “missing,” you use a pointer (*float64, *string) or a nullable wrapper (sql.NullFloat64, sql.NullString).
// A *float64 can be nil, which JSON will emit as null.
// nullFloat64ToPtr converts a nullable float into a *float64 for JSON
// Example:
//
//	value=sql.NullFloat64{Float64: 12.5, Valid: true}  -> *float64(12.5)
//	value=sql.NullFloat64{Valid: false}                -> nil
func nullFloat64ToPtr(value sql.NullFloat64) *float64 {
	if !value.Valid { // NULL in DB means unknown
		return nil
	}
	v := value.Float64 // copy the float value
	return &v          // return pointer so JSON can emit a number
}

// nullStringToValue converts a nullable string into a plain string
// Example:
//
//	value=sql.NullString{String: "250 g", Valid: true} -> "250 g"
//	value=sql.NullString{Valid: false}                 -> ""
func nullStringToValue(value sql.NullString) string {
	if !value.Valid { // NULL in DB means empty string for now
		return ""
	}
	return value.String // return the DB string
}

// getFoodItemByBarcode loads a cached food item and updated_at by barcode.
func getFoodItemByBarcode(ctx context.Context, pool *pgxpool.Pool, barcode string) (FoodItem, time.Time, bool, error) {
	const query = `
		SELECT
			id,
			barcode,
			name,
			brand,
			-- COALESCE picks the first non-NULL value, so we default unit to "g" when missing.
			serving_size_g::text || COALESCE(serving_size_unit, 'g') AS serving_size,
			-- Cast to float8 (double precision) so pgx can scan cleanly into Go float64.
			calories_per_100g::float8,
			protein_g::float8,
			carbs_g::float8,
			fat_g::float8,
			fiber_g::float8,
			sugar_g::float8,
			(sodium_mg / 1000.0)::float8 AS sodium_g,
			updated_at
		FROM food_items
		WHERE barcode = $1
		LIMIT 1
	` // SQL query for cached food item (sodium mg -> g)

	var (
		id          string          // food_items.id
		dbBarcode   string          // food_items.barcode
		name        string          // food_items.name
		brand       sql.NullString  // nullable brand
		servingSize string          // composed serving size string
		calories    float64         // calories_per_100g
		protein     float64         // protein_g
		carbs       float64         // carbs_g
		fat         float64         // fat_g
		fiber       sql.NullFloat64 // fiber_g (nullable)
		sugar       sql.NullFloat64 // sugar_g (nullable)
		sodium      sql.NullFloat64 // sodium_g (nullable)
		updatedAt   time.Time       // updated_at
	)

	err := pool.QueryRow(ctx, query, barcode).Scan(
		&id,          // scan id
		&dbBarcode,   // scan barcode
		&name,        // scan name
		&brand,       // scan brand (nullable)
		&servingSize, // scan serving size string
		&calories,    // scan calories
		&protein,     // scan protein
		&carbs,       // scan carbs
		&fat,         // scan fat
		&fiber,       // scan fiber (nullable)
		&sugar,       // scan sugar (nullable)
		&sodium,      // scan sodium (nullable)
		&updatedAt,   // scan updated_at
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) { // no cached row exists
			return FoodItem{}, time.Time{}, false, nil
		}
		return FoodItem{}, time.Time{}, false, fmt.Errorf("query food_items: %w", err)
	}

	item := FoodItem{
		ID:          id,                       // set ID
		Barcode:     dbBarcode,                // set barcode
		Name:        name,                     // set name
		Brand:       nullStringToValue(brand), // set brand or empty
		ServingSize: servingSize,              // use DB serving size
		Nutrients: FoodItemNutrients{
			CaloriesKcal: calories,                 // per-100g kcal
			ProteinG:     protein,                  // per-100g protein
			CarbsG:       carbs,                    // per-100g carbs
			FatG:         fat,                      // per-100g fat
			FiberG:       nullFloat64ToPtr(fiber),  // nullable fiber
			SugarG:       nullFloat64ToPtr(sugar),  // nullable sugar
			SodiumG:      nullFloat64ToPtr(sodium), // nullable sodium (g)
		},
		ImageUrl: "", // DB doesn't store image URL yet
	}

	return item, updatedAt, true, nil // found cached item
}

// upsertFoodItem writes the upstream product into food_items for caching.
func upsertFoodItem(ctx context.Context, pool *pgxpool.Pool, product *openfoodfacts.Product, barcode string, servingSizeG float64, servingSizeUnit string) error {
	if product == nil { // guard: we cannot write a nil product
		return fmt.Errorf("product is nil")
	}
	if barcode == "" { // guard: barcode is required for the cache key
		return fmt.Errorf("barcode is empty")
	}

	// Optional nutrients: use nil when missing so DB stores NULL instead of 0.
	fiber := floatOrNil(product.Nutriments.Fiber100G)  // fiber per 100g (nullable)
	sugar := floatOrNil(product.Nutriments.Sugars100G) // sugar per 100g (nullable)

	// Convert sodium from g -> mg for DB storage (store NULL if missing).
	var sodiumMg *float64 // nullable sodium in mg
	if product.Nutriments.Sodium100G != 0 {
		value := product.Nutriments.Sodium100G * 1000 // 1g = 1000mg
		sodiumMg = &value                             // pointer -> NULL if missing
	}

	// Use NULL for brand if empty so DB keeps the column nullable.
	var brand *string // nullable brand
	if product.Brands != "" {
		brand = &product.Brands // pointer to real brand string
	}

	// Source id: prefer upstream ID, fallback to barcode if empty.
	sourceID := product.Id
	if sourceID == "" {
		sourceID = barcode
	}

	// Insert or update cached item by barcode (only for open_food_facts rows).
	const query = `
		INSERT INTO food_items (
			name,
			brand,
			barcode,
			serving_size_g,
			serving_size_unit,
			calories_per_100g,
			protein_g,
			carbs_g,
			fat_g,
			fiber_g,
			sugar_g,
			sodium_mg,
			source,
			source_id,
			verified,
			created_by
		) VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10, $11, $12,
			'open_food_facts', $13, false, NULL
		)
		ON CONFLICT (barcode) DO UPDATE SET
			name = EXCLUDED.name,
			brand = EXCLUDED.brand,
			serving_size_g = EXCLUDED.serving_size_g,
			serving_size_unit = EXCLUDED.serving_size_unit,
			calories_per_100g = EXCLUDED.calories_per_100g,
			protein_g = EXCLUDED.protein_g,
			carbs_g = EXCLUDED.carbs_g,
			fat_g = EXCLUDED.fat_g,
			fiber_g = EXCLUDED.fiber_g,
			sugar_g = EXCLUDED.sugar_g,
			sodium_mg = EXCLUDED.sodium_mg,
			source = EXCLUDED.source,
			source_id = EXCLUDED.source_id,
			updated_at = now()
		WHERE food_items.source = 'open_food_facts'
	`

	_, err := pool.Exec(
		ctx,   // request-scoped context
		query, // SQL upsert statement
		product.ProductName,                 // name
		brand,                               // brand (nullable)
		barcode,                             // barcode (unique key)
		servingSizeG,                        // serving size value (g)
		servingSizeUnit,                     // serving size unit ("g")
		product.Nutriments.Energy100G,       // calories per 100g
		product.Nutriments.Proteins100G,     // protein per 100g
		product.Nutriments.Carbohydrates100G, // carbs per 100g
		product.Nutriments.Fat100G,          // fat per 100g
		fiber,                               // fiber per 100g (nullable)
		sugar,                               // sugar per 100g (nullable)
		sodiumMg,                            // sodium in mg (nullable)
		sourceID,                            // upstream source id
	)

	if err != nil {
		return fmt.Errorf("upsert food_items: %w", err) // wrap DB error for logging
	}

	return nil // success
}
