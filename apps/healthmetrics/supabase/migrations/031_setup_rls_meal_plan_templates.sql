-- Setup Row Level Security (RLS) for meal_plan_templates table
-- Migration: 031_setup_rls_meal_plan_templates.sql
-- Description: Enables RLS and creates security policies for meal_plan_templates access control

-- Enable Row Level Security on meal_plan_templates table
ALTER TABLE meal_plan_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own templates and public templates
CREATE POLICY "Users can view their own and public templates"
ON meal_plan_templates FOR SELECT
USING (
  auth.uid() = user_id OR
  is_public = true
);

-- Policy: Users can insert their own templates
CREATE POLICY "Users can insert their own templates"
ON meal_plan_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own templates
CREATE POLICY "Users can update their own templates"
ON meal_plan_templates FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete their own templates"
ON meal_plan_templates FOR DELETE
USING (auth.uid() = user_id);

-- Add policy comments for documentation
COMMENT ON POLICY "Users can view their own and public templates" ON meal_plan_templates
IS 'Allows users to read their own templates and public templates shared by others';

COMMENT ON POLICY "Users can insert their own templates" ON meal_plan_templates
IS 'Allows users to create new meal plan templates';

COMMENT ON POLICY "Users can update their own templates" ON meal_plan_templates
IS 'Allows users to update their own templates';

COMMENT ON POLICY "Users can delete their own templates" ON meal_plan_templates
IS 'Allows users to delete their own templates';
