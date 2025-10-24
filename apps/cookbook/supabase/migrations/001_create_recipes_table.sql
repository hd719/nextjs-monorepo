-- Create recipes table with complete schema
-- Migration: 001_create_recipes_table.sql
-- Description: Creates the main recipes table with all required fields for the cookbook application

CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  ingredients jsonb DEFAULT '[]'::jsonb,
  steps jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  category text,
  cuisine text,
  servings int,
  prep_minutes int,
  cook_minutes int,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE recipes IS 'Stores all recipe data for the cookbook application';
COMMENT ON COLUMN recipes.owner_id IS 'References the user who created this recipe';
COMMENT ON COLUMN recipes.slug IS 'SEO-friendly URL slug, must be unique';
COMMENT ON COLUMN recipes.ingredients IS 'Array of ingredient objects/strings stored as JSONB';
COMMENT ON COLUMN recipes.steps IS 'Array of cooking step strings stored as JSONB';
COMMENT ON COLUMN recipes.images IS 'Array of image URLs stored as JSONB';
COMMENT ON COLUMN recipes.is_published IS 'Whether recipe is visible to public users';
COMMENT ON COLUMN recipes.published_at IS 'Timestamp when recipe was first published';
