-- Add automatic updated_at timestamp trigger for weight_entries table
-- Migration: 024_add_updated_at_trigger_weight_entries.sql
-- Description: Adds trigger to automatically update the updated_at column (uses existing reusable function)

-- Add trigger to weight_entries table (function already exists from migration 004)
CREATE TRIGGER update_weight_entries_updated_at
    BEFORE UPDATE ON weight_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TRIGGER update_weight_entries_updated_at ON weight_entries
IS 'Automatically updates updated_at column when weight entry is modified';
