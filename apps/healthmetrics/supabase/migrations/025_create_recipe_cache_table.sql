-- Create recipe_cache table with complete schema
-- Migration: 025_create_recipe_cache_table.sql
-- Description: Creates the recipe_cache table for cached cookbook recipe nutrition data

CREATE TABLE recipe_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL UNIQUE,
  recipe_slug text NOT NULL,
  servings integer NOT NULL,
  total_calories numeric NOT NULL,
  calories_per_serving numeric NOT NULL,
  protein_g numeric NOT NULL,
  carbs_g numeric NOT NULL,
  fat_g numeric NOT NULL,
  fiber_g numeric,
  sugar_g numeric,
  sodium_mg numeric,
  ingredients_breakdown jsonb,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE recipe_cache IS 'Cache nutrition data from cookbook app recipes';
COMMENT ON COLUMN recipe_cache.id IS 'Primary key UUID';
COMMENT ON COLUMN recipe_cache.recipe_id IS 'External recipe ID from cookbook app (unique)';
COMMENT ON COLUMN recipe_cache.recipe_slug IS 'Recipe slug for reference';
COMMENT ON COLUMN recipe_cache.servings IS 'Number of servings';
COMMENT ON COLUMN recipe_cache.total_calories IS 'Total calories for recipe';
COMMENT ON COLUMN recipe_cache.calories_per_serving IS 'Calories per serving';
COMMENT ON COLUMN recipe_cache.protein_g IS 'Total protein in grams';
COMMENT ON COLUMN recipe_cache.carbs_g IS 'Total carbs in grams';
COMMENT ON COLUMN recipe_cache.fat_g IS 'Total fat in grams';
COMMENT ON COLUMN recipe_cache.fiber_g IS 'Total fiber in grams';
COMMENT ON COLUMN recipe_cache.sugar_g IS 'Total sugar in grams';
COMMENT ON COLUMN recipe_cache.sodium_mg IS 'Total sodium in milligrams';
COMMENT ON COLUMN recipe_cache.ingredients_breakdown IS 'Detailed nutrition per ingredient (JSONB)';
COMMENT ON COLUMN recipe_cache.last_synced_at IS 'When nutrition was last calculated';
COMMENT ON COLUMN recipe_cache.created_at IS 'Timestamp when cache entry was created';
COMMENT ON COLUMN recipe_cache.updated_at IS 'Timestamp when cache entry was last updated (auto-updated via trigger)';
