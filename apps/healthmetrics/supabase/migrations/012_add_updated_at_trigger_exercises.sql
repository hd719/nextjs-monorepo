-- Add automatic updated_at timestamp trigger for exercises table
-- Migration: 012_add_updated_at_trigger_exercises.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to exercises table (function already exists from migration 004)
CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_exercises_updated_at ON exercises
IS 'Automatically updates updated_at column when exercise is modified';
