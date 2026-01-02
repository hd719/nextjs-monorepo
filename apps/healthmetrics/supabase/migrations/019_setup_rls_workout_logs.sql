-- Setup Row Level Security (RLS) for workout_logs table
-- Migration: 019_setup_rls_workout_logs.sql
-- Description: Enables RLS and creates security policies for workout_logs access control

-- Enable Row Level Security on workout_logs table
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own workout logs
CREATE POLICY "Users can view their own workout logs"
ON workout_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own workout logs
CREATE POLICY "Users can insert their own workout logs"
ON workout_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own workout logs
CREATE POLICY "Users can update their own workout logs"
ON workout_logs FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own workout logs
CREATE POLICY "Users can delete their own workout logs"
ON workout_logs FOR DELETE
USING (auth.uid() = user_id);

-- Add policy comments for documentation
COMMENT ON POLICY "Users can view their own workout logs" ON workout_logs
IS 'Allows users to read their own workout history';

COMMENT ON POLICY "Users can insert their own workout logs" ON workout_logs
IS 'Allows users to create new workout logs';

COMMENT ON POLICY "Users can update their own workout logs" ON workout_logs
IS 'Allows users to update their own workout logs';

COMMENT ON POLICY "Users can delete their own workout logs" ON workout_logs
IS 'Allows users to delete their own workout logs';
