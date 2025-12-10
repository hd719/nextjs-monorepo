-- Add automatic updated_at timestamp trigger for challenges table
-- Migration: 048_add_updated_at_trigger_challenges.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to challenges table (function already exists from migration 004)
CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_challenges_updated_at ON challenges
IS 'Automatically updates updated_at column when challenge is modified';
