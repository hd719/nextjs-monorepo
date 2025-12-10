-- Add automatic updated_at timestamp trigger for friends table
-- Migration: 044_add_updated_at_trigger_friends.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to friends table (function already exists from migration 004)
CREATE TRIGGER update_friends_updated_at
    BEFORE UPDATE ON friends
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_friends_updated_at ON friends
IS 'Automatically updates updated_at column when friend relationship is modified';
