-- Create meal_plans table with complete schema
-- Migration: 033_create_meal_plans_table.sql
-- Description: Creates the meal_plans table for weekly meal planning

CREATE TABLE meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_item_id uuid REFERENCES food_items(id) ON DELETE SET NULL,
  recipe_id text,
  quantity_g numeric NOT NULL,
  servings numeric DEFAULT 1.0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Ensure at least one of food_item_id or recipe_id is provided
  CONSTRAINT meal_plans_food_or_recipe_check CHECK (
    (food_item_id IS NOT NULL) OR (recipe_id IS NOT NULL)
  )
);

-- Add comments for documentation
COMMENT ON TABLE meal_plans IS 'User''s planned meals for the week';
COMMENT ON COLUMN meal_plans.id IS 'Primary key UUID';
COMMENT ON COLUMN meal_plans.user_id IS 'References auth.users(id) - user who created this meal plan';
COMMENT ON COLUMN meal_plans.week_start_date IS 'Monday of the week';
COMMENT ON COLUMN meal_plans.day_of_week IS 'Day of week: 0=Monday, 1=Tuesday, ..., 6=Sunday';
COMMENT ON COLUMN meal_plans.meal_type IS 'Meal type: breakfast, lunch, dinner, or snack';
COMMENT ON COLUMN meal_plans.food_item_id IS 'References food_items(id) - can reference food items';
COMMENT ON COLUMN meal_plans.recipe_id IS 'External recipe ID from cookbook app (stored as text, no FK constraint)';
COMMENT ON COLUMN meal_plans.quantity_g IS 'Planned quantity in grams';
COMMENT ON COLUMN meal_plans.servings IS 'Number of servings';
COMMENT ON COLUMN meal_plans.notes IS 'Meal planning notes';
COMMENT ON COLUMN meal_plans.created_at IS 'Timestamp when meal plan entry was created';
COMMENT ON COLUMN meal_plans.updated_at IS 'Timestamp when meal plan entry was last updated (auto-updated via trigger)';
