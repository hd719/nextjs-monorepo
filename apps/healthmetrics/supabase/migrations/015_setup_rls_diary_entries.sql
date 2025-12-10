-- Setup Row Level Security (RLS) for diary_entries table
-- Migration: 015_setup_rls_diary_entries.sql
-- Description: Enables RLS and creates security policies for diary_entries access control

-- Enable Row Level Security on diary_entries table
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own diary entries
CREATE POLICY "Users can view their own diary entries"
ON diary_entries FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own diary entries
CREATE POLICY "Users can insert their own diary entries"
ON diary_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own diary entries
CREATE POLICY "Users can update their own diary entries"
ON diary_entries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own diary entries
CREATE POLICY "Users can delete their own diary entries"
ON diary_entries FOR DELETE
USING (auth.uid() = user_id);

-- Add policy comments for documentation
COMMENT ON POLICY "Users can view their own diary entries" ON diary_entries
IS 'Allows users to read their own food diary entries';

COMMENT ON POLICY "Users can insert their own diary entries" ON diary_entries
IS 'Allows users to create new diary entries';

COMMENT ON POLICY "Users can update their own diary entries" ON diary_entries
IS 'Allows users to update their own diary entries';

COMMENT ON POLICY "Users can delete their own diary entries" ON diary_entries
IS 'Allows users to delete their own diary entries';
