-- Setup Row Level Security (RLS) for recipes table
-- Migration: 003_setup_rls.sql
-- Description: Enables RLS and creates security policies for recipe access control

-- Enable Row Level Security on recipes table
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published recipes (public access)
CREATE POLICY "Public recipes are viewable by everyone"
ON recipes FOR SELECT
USING (is_published = true);

-- Policy: Users can read their own recipes (including drafts)
CREATE POLICY "Users can view their own recipes"
ON recipes FOR SELECT
USING (auth.uid() = owner_id);

-- Policy: Users can insert their own recipes
CREATE POLICY "Users can insert their own recipes"
ON recipes FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own recipes
CREATE POLICY "Users can update their own recipes"
ON recipes FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can delete their own recipes
CREATE POLICY "Users can delete their own recipes"
ON recipes FOR DELETE
USING (auth.uid() = owner_id);

-- Add policy comments for documentation
COMMENT ON POLICY "Public recipes are viewable by everyone" ON recipes
IS 'Allows public access to published recipes for the main website';

COMMENT ON POLICY "Users can view their own recipes" ON recipes
IS 'Allows recipe owners to see all their recipes including drafts';

COMMENT ON POLICY "Users can insert their own recipes" ON recipes
IS 'Allows authenticated users to create new recipes';

COMMENT ON POLICY "Users can update their own recipes" ON recipes
IS 'Allows recipe owners to edit their own recipes';

COMMENT ON POLICY "Users can delete their own recipes" ON recipes
IS 'Allows recipe owners to delete their own recipes';
