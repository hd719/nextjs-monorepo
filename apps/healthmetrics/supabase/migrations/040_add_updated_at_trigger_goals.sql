-- Add automatic updated_at timestamp trigger for goals table
-- Migration: 040_add_updated_at_trigger_goals.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to goals table (function already exists from migration 004)
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_goals_updated_at ON goals
IS 'Automatically updates updated_at column when goal is modified';
