-- Add automatic updated_at timestamp trigger for food_items table
-- Migration: 008_add_updated_at_trigger_food_items.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to food_items table (function already exists from migration 004)
CREATE TRIGGER update_food_items_updated_at
    BEFORE UPDATE ON food_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_food_items_updated_at ON food_items
IS 'Automatically updates updated_at column when food item is modified';
