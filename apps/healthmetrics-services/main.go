package main

import (
	"errors"
	"fmt"
	"regexp"
	"time"

	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"github.com/openfoodfacts/openfoodfacts-go"
)

type FoodItemNutrients struct {
	CaloriesKcal float64 `json:"calories_kcal"`
	ProteinG     float64 `json:"protein_g"`
	CarbsG       float64 `json:"carbs_g"`
	FatG         float64 `json:"fat_g"`
	FiberG       float64 `json:"fiber_g"`
	SugarG       float64 `json:"sugar_g"`
	SodiumG      float64 `json:"sodium_g"`
}

type FoodItem struct {
	ID          string            `json:"id"`
	Barcode     string            `json:"barcode"`
	Name        string            `json:"name"`
	Brand       string            `json:"brand"`
	ServingSize string            `json:"serving_size"`
	Nutrients   FoodItemNutrients `json:"nutrients"`
	ImageUrl    string            `json:"image_url"`
}

func supportsChecksum(length int) bool {
	switch length {
	case 8, 12, 13, 14:
		return true
	default:
		return false
	}
}

func isValidChecksum(code string) bool {
	sum := 0
	// UPC/EAN checksum: alternate weights 3 and 1 from the right, excluding the check digit.
	weight := 3

	// Steps:
	// len(code) - 2 to 0 (right to left, excluding check digit which is last digit).
	// The rightmost non-check digit (second-to-last overall) is position 1 (odd) by definition.
	for i := len(code) - 2; i >= 0; i-- {
		// a string is a slice of bytes in Go
		// code[i] is a byte (ASCII) not value. Example: '5'(53) - '0'(48) = 5.
		digit := int(code[i] - '0')
		sum += digit * weight
		if weight == 3 {
			weight = 1
		} else {
			weight = 3
		}
	}

	// sum is the total across all digits except the check digit
	// sum = 44 → 44 % 10 = 4 → 10 - 4 = 6 → 6 % 10 = 6
	// sum = 50 → 50 % 10 = 0 → 10 - 0 = 10 → 10 % 10 = 0
	checkDigit := (10 - (sum % 10)) % 10
	return checkDigit == int(code[len(code)-1]-'0')
}

func main() {
	router := gin.Default()
	router.Use(requestid.New())
	router.Use(func(c *gin.Context) {
		if requestID := requestid.Get(c); requestID != "" {
			c.Header("X-Request-Id", requestID)
		}
		c.Next()
	})
	api := openfoodfacts.NewClient("world", "", "")

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"message":   "Health check successful",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// This comes from the frontend when the user scans a barcode
	router.GET("/v1/barcodes/:code", func(c *gin.Context) {
		barcode := c.Param("code")
		isDigitOnly := regexp.MustCompile("^[0-9]+$").MatchString
		isBarCodeValid := len(barcode) >= 8 && len(barcode) <= 14 && isDigitOnly(barcode)

		if !isBarCodeValid {
			c.JSON(400, gin.H{"error": map[string]interface{}{
				"code":    "INVALID_BARCODE",
				"message": "Barcode must be 8-14 digits",
			}})
			return
		}
		if supportsChecksum(len(barcode)) && !isValidChecksum(barcode) {
			c.JSON(400, gin.H{"error": map[string]interface{}{
				"code":    "INVALID_BARCODE",
				"message": "Invalid barcode checksum",
			}})
			return
		}

		// Make external API call to OpenFoodFacts
		product, err := api.Product(barcode)
		if err != nil {
			// ErrNoProduct is a sentinel error value (errors.New), so use errors.Is to detect it even if the library wraps the error.
			// ErrNoProduct is an error returned by Client.Product when the product could not be retrieved successfully.
			if errors.Is(err, openfoodfacts.ErrNoProduct) {
				c.JSON(404, gin.H{"error": map[string]interface{}{
					"code":    "NOT_FOUND",
					"message": "Product not found",
				}})
				return
			}
			c.JSON(502, gin.H{"error": map[string]interface{}{
				"code":    "UPSTREAM_ERROR",
				"message": fmt.Sprintf("Failed to fetch product from OpenFoodFacts: %v", err),
			}})
			return
		}

		// Need to transform the OpenFoodFacts response into the FoodItem struct
		foodItem := FoodItem{
			ID:          product.Id,
			Barcode:     product.Code,
			Name:        product.ProductName,
			Brand:       product.Brands,
			ServingSize: product.ServingSize,
			Nutrients: FoodItemNutrients{
				CaloriesKcal: product.Nutriments.Energy100G,
				ProteinG:     product.Nutriments.Proteins100G,
				CarbsG:       product.Nutriments.Carbohydrates100G,
				FatG:         product.Nutriments.Fat100G,
				FiberG:       product.Nutriments.Fiber100G,
				SugarG:       product.Nutriments.Sugars100G,
				SodiumG:      product.Nutriments.Sodium100G,
			},
			ImageUrl: product.ImageURL.String(),
		}

		c.JSON(200, foodItem)
	})
	router.Run() // listens on 0.0.0.0:8080 by default
}
