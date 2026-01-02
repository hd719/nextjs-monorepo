-- Setup Row Level Security (RLS) for meal_plans table
-- Migration: 035_setup_rls_meal_plans.sql
-- Description: Enables RLS and creates security policies for meal_plans access control

-- Enable Row Level Security on meal_plans table
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own meal plans
CREATE POLICY "Users can view their own meal plans"
ON meal_plans FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own meal plans
CREATE POLICY "Users can insert their own meal plans"
ON meal_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own meal plans
CREATE POLICY "Users can update their own meal plans"
ON meal_plans FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own meal plans
CREATE POLICY "Users can delete their own meal plans"
ON meal_plans FOR DELETE
USING (auth.uid() = user_id);

-- Add policy comments for documentation
COMMENT ON POLICY "Users can view their own meal plans" ON meal_plans
IS 'Allows users to read their own meal plans';

COMMENT ON POLICY "Users can insert their own meal plans" ON meal_plans
IS 'Allows users to create new meal plan entries';

COMMENT ON POLICY "Users can update their own meal plans" ON meal_plans
IS 'Allows users to update their own meal plans';

COMMENT ON POLICY "Users can delete their own meal plans" ON meal_plans
IS 'Allows users to delete their own meal plans';
