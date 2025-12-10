-- Add automatic updated_at timestamp trigger for workout_logs table
-- Migration: 020_add_updated_at_trigger_workout_logs.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to workout_logs table (function already exists from migration 004)
CREATE TRIGGER update_workout_logs_updated_at
    BEFORE UPDATE ON workout_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_workout_logs_updated_at ON workout_logs
IS 'Automatically updates updated_at column when workout log is modified';
