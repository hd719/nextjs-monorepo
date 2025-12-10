-- Add automatic updated_at timestamp trigger for meal_plans table
-- Migration: 036_add_updated_at_trigger_meal_plans.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to meal_plans table (function already exists from migration 004)
CREATE TRIGGER update_meal_plans_updated_at
    BEFORE UPDATE ON meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_meal_plans_updated_at ON meal_plans
IS 'Automatically updates updated_at column when meal plan entry is modified';
