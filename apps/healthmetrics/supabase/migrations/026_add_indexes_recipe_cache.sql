-- Add performance indexes for recipe_cache table
-- Migration: 026_add_indexes_recipe_cache.sql
-- Description: Creates indexes for optimal query performance on recipe_cache table

-- Unique index on recipe_id (already enforced by UNIQUE constraint, but explicit for clarity)
-- Note: UNIQUE constraint on recipe_id already creates an index

-- Index for recipe_slug lookups
CREATE INDEX idx_recipe_cache_recipe_slug ON recipe_cache (recipe_slug);

-- Index for last_synced_at (to find stale cache entries)
CREATE INDEX idx_recipe_cache_last_synced_at ON recipe_cache (last_synced_at);
