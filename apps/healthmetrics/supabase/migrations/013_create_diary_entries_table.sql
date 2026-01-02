-- Create diary_entries table with complete schema
-- Migration: 013_create_diary_entries_table.sql
-- Description: Creates the diary_entries table for daily food consumption tracking

CREATE TABLE diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  food_item_id uuid NOT NULL REFERENCES food_items(id) ON DELETE RESTRICT,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
  quantity_g numeric NOT NULL,
  servings numeric DEFAULT 1.0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE diary_entries IS 'User''s daily food consumption tracking';
COMMENT ON COLUMN diary_entries.id IS 'Primary key UUID';
COMMENT ON COLUMN diary_entries.user_id IS 'References auth.users(id) - user who logged this entry';
COMMENT ON COLUMN diary_entries.date IS 'Date of consumption';
COMMENT ON COLUMN diary_entries.food_item_id IS 'References food_items(id) - must always reference a food_item';
COMMENT ON COLUMN diary_entries.meal_type IS 'Meal type: breakfast, lunch, dinner, snack, or other';
COMMENT ON COLUMN diary_entries.quantity_g IS 'Amount consumed in grams';
COMMENT ON COLUMN diary_entries.servings IS 'Number of servings (calculated from quantity_g)';
COMMENT ON COLUMN diary_entries.notes IS 'User notes about this entry';
COMMENT ON COLUMN diary_entries.created_at IS 'Timestamp when entry was created';
COMMENT ON COLUMN diary_entries.updated_at IS 'Timestamp when entry was last updated (auto-updated via trigger)';
