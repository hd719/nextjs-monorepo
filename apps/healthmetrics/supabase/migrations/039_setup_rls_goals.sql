-- Setup Row Level Security (RLS) for goals table
-- Migration: 039_setup_rls_goals.sql
-- Description: Enables RLS and creates security policies for goals access control

-- Enable Row Level Security on goals table
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own goals
CREATE POLICY "Users can view their own goals"
ON goals FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own goals
CREATE POLICY "Users can insert their own goals"
ON goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own goals
CREATE POLICY "Users can update their own goals"
ON goals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own goals
CREATE POLICY "Users can delete their own goals"
ON goals FOR DELETE
USING (auth.uid() = user_id);

-- Add policy comments for documentation
COMMENT ON POLICY "Users can view their own goals" ON goals
IS 'Allows users to read their own fitness goals';

COMMENT ON POLICY "Users can insert their own goals" ON goals
IS 'Allows users to create new goals';

COMMENT ON POLICY "Users can update their own goals" ON goals
IS 'Allows users to update their own goals';

COMMENT ON POLICY "Users can delete their own goals" ON goals
IS 'Allows users to delete their own goals';
