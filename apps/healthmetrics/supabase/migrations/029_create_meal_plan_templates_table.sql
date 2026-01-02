-- Create meal_plan_templates table with complete schema
-- Migration: 029_create_meal_plan_templates_table.sql
-- Description: Creates the meal_plan_templates table for reusable meal plan templates

CREATE TABLE meal_plan_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  meals jsonb NOT NULL,
  total_calories numeric,
  total_protein_g numeric,
  total_carbs_g numeric,
  total_fat_g numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE meal_plan_templates IS 'Reusable meal plan templates that users can apply to their meal plans';
COMMENT ON COLUMN meal_plan_templates.id IS 'Primary key UUID';
COMMENT ON COLUMN meal_plan_templates.user_id IS 'References auth.users(id) - user who created this template';
COMMENT ON COLUMN meal_plan_templates.name IS 'Template name';
COMMENT ON COLUMN meal_plan_templates.description IS 'Template description';
COMMENT ON COLUMN meal_plan_templates.is_public IS 'Whether template is publicly shareable';
COMMENT ON COLUMN meal_plan_templates.meals IS 'Array of meal objects with food_item_id, recipe_id, quantity_g, servings, meal_type, day_of_week (JSONB)';
COMMENT ON COLUMN meal_plan_templates.total_calories IS 'Total calories for the template';
COMMENT ON COLUMN meal_plan_templates.total_protein_g IS 'Total protein in grams';
COMMENT ON COLUMN meal_plan_templates.total_carbs_g IS 'Total carbs in grams';
COMMENT ON COLUMN meal_plan_templates.total_fat_g IS 'Total fat in grams';
COMMENT ON COLUMN meal_plan_templates.created_at IS 'Timestamp when template was created';
COMMENT ON COLUMN meal_plan_templates.updated_at IS 'Timestamp when template was last updated (auto-updated via trigger)';
