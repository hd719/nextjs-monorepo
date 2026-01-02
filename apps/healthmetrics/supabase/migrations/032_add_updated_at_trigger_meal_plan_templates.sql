-- Add automatic updated_at timestamp trigger for meal_plan_templates table
-- Migration: 032_add_updated_at_trigger_meal_plan_templates.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to meal_plan_templates table (function already exists from migration 004)
CREATE TRIGGER update_meal_plan_templates_updated_at
    BEFORE UPDATE ON meal_plan_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_meal_plan_templates_updated_at ON meal_plan_templates
IS 'Automatically updates updated_at column when meal plan template is modified';
