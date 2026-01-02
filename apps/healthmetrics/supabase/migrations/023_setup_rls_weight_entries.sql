-- Setup Row Level Security (RLS) for weight_entries table
-- Migration: 023_setup_rls_weight_entries.sql
-- Description: Enables RLS and creates security policies for weight_entries access control

-- Enable Row Level Security on weight_entries table
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own weight entries
CREATE POLICY "Users can view their own weight entries"
ON weight_entries FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own weight entries
CREATE POLICY "Users can insert their own weight entries"
ON weight_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own weight entries
CREATE POLICY "Users can update their own weight entries"
ON weight_entries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own weight entries
CREATE POLICY "Users can delete their own weight entries"
ON weight_entries FOR DELETE
USING (auth.uid() = user_id);

-- Add policy comments for documentation
COMMENT ON POLICY "Users can view their own weight entries" ON weight_entries
IS 'Allows users to read their own weight and measurement history';

COMMENT ON POLICY "Users can insert their own weight entries" ON weight_entries
IS 'Allows users to create new weight/measurement entries';

COMMENT ON POLICY "Users can update their own weight entries" ON weight_entries
IS 'Allows users to update their own weight/measurement entries';

COMMENT ON POLICY "Users can delete their own weight entries" ON weight_entries
IS 'Allows users to delete their own weight/measurement entries';
