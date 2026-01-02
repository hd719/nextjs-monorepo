-- Add automatic updated_at timestamp trigger for recipe_cache table
-- Migration: 028_add_updated_at_trigger_recipe_cache.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to recipe_cache table (function already exists from migration 004)
CREATE TRIGGER update_recipe_cache_updated_at
    BEFORE UPDATE ON recipe_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_recipe_cache_updated_at ON recipe_cache
IS 'Automatically updates updated_at column when recipe cache entry is modified';
