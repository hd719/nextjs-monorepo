-- Setup Row Level Security (RLS) for recipe_cache table
-- Migration: 027_setup_rls_recipe_cache.sql
-- Description: Enables RLS and creates security policies for recipe_cache access control

-- Enable Row Level Security on recipe_cache table
ALTER TABLE recipe_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read recipe cache (public read access)
CREATE POLICY "Recipe cache is viewable by everyone"
ON recipe_cache FOR SELECT
USING (true);

-- Policy: Authenticated users can insert/update recipe cache (for syncing from cookbook app)
CREATE POLICY "Authenticated users can manage recipe cache"
ON recipe_cache FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add policy comments for documentation
COMMENT ON POLICY "Recipe cache is viewable by everyone" ON recipe_cache
IS 'Allows public read access to cached recipe nutrition data';

COMMENT ON POLICY "Authenticated users can manage recipe cache" ON recipe_cache
IS 'Allows authenticated users to insert/update/delete recipe cache entries';
