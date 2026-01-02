-- Setup Row Level Security (RLS) for food_items table
-- Migration: 007_setup_rls_food_items.sql
-- Description: Enables RLS and creates security policies for food_items access control

-- Enable Row Level Security on food_items table
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read food items (public read access)
CREATE POLICY "Food items are viewable by everyone"
ON food_items FOR SELECT
USING (true);

-- Policy: Users can insert their own food items (source='user', created_by=user_id)
CREATE POLICY "Users can insert their own food items"
ON food_items FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  source = 'user' AND
  created_by = auth.uid()
);

-- Policy: Users can update their own food items
CREATE POLICY "Users can update their own food items"
ON food_items FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Policy: Admins can insert/update/delete any food items
-- Note: Admin check requires a function to check users.is_admin
-- For now, we'll use service role for admin operations
-- This can be enhanced with a function later

-- Add policy comments for documentation
COMMENT ON POLICY "Food items are viewable by everyone" ON food_items
IS 'Allows public read access to all food items';

COMMENT ON POLICY "Users can insert their own food items" ON food_items
IS 'Allows authenticated users to create custom food items with source=user';

COMMENT ON POLICY "Users can update their own food items" ON food_items
IS 'Allows users to update food items they created';
