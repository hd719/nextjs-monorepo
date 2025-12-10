-- Add automatic updated_at timestamp trigger for diary_entries table
-- Migration: 016_add_updated_at_trigger_diary_entries.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to diary_entries table (function already exists from migration 004)
CREATE TRIGGER update_diary_entries_updated_at
    BEFORE UPDATE ON diary_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_diary_entries_updated_at ON diary_entries
IS 'Automatically updates updated_at column when diary entry is modified';
