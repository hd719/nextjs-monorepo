-- Create food_items table with complete schema
-- Migration: 005_create_food_items_table.sql
-- Description: Creates the food_items table for shared food database with nutrition information

CREATE TABLE food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  barcode text UNIQUE,
  serving_size_g numeric NOT NULL,
  serving_size_unit text,
  calories_per_100g numeric NOT NULL,
  protein_g numeric NOT NULL,
  carbs_g numeric NOT NULL,
  fat_g numeric NOT NULL,
  fiber_g numeric,
  sugar_g numeric,
  sodium_mg numeric,
  source text NOT NULL CHECK (source IN ('usda', 'edamam', 'open_food_facts', 'user', 'cookbook')),
  source_id text,
  verified boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE food_items IS 'Shared food database with nutrition information (like USDA FoodData Central)';
COMMENT ON COLUMN food_items.id IS 'Primary key UUID';
COMMENT ON COLUMN food_items.name IS 'Food item name (indexed for search)';
COMMENT ON COLUMN food_items.brand IS 'Brand name if applicable';
COMMENT ON COLUMN food_items.barcode IS 'UPC/EAN barcode for scanning (unique)';
COMMENT ON COLUMN food_items.serving_size_g IS 'Standard serving size in grams';
COMMENT ON COLUMN food_items.serving_size_unit IS 'Unit description (e.g., "1 cup", "1 piece")';
COMMENT ON COLUMN food_items.calories_per_100g IS 'Calories per 100g';
COMMENT ON COLUMN food_items.protein_g IS 'Protein per 100g';
COMMENT ON COLUMN food_items.carbs_g IS 'Carbohydrates per 100g';
COMMENT ON COLUMN food_items.fat_g IS 'Fat per 100g';
COMMENT ON COLUMN food_items.fiber_g IS 'Fiber per 100g';
COMMENT ON COLUMN food_items.sugar_g IS 'Sugar per 100g';
COMMENT ON COLUMN food_items.sodium_mg IS 'Sodium per 100g in milligrams';
COMMENT ON COLUMN food_items.source IS 'Data source: usda, edamam, open_food_facts, user, or cookbook';
COMMENT ON COLUMN food_items.source_id IS 'External API ID for reference';
COMMENT ON COLUMN food_items.verified IS 'Admin-verified accuracy';
COMMENT ON COLUMN food_items.created_by IS 'References auth.users(id) if user-created';
COMMENT ON COLUMN food_items.created_at IS 'Timestamp when food item was created';
COMMENT ON COLUMN food_items.updated_at IS 'Timestamp when food item was last updated (auto-updated via trigger)';
