-- Setup Row Level Security (RLS) for exercises table
-- Migration: 011_setup_rls_exercises.sql
-- Description: Enables RLS and creates security policies for exercises access control

-- Enable Row Level Security on exercises table
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read exercises (public read access)
CREATE POLICY "Exercises are viewable by everyone"
ON exercises FOR SELECT
USING (true);

-- Policy: Users can insert their own exercises (source='user', created_by=user_id)
CREATE POLICY "Users can insert their own exercises"
ON exercises FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  source = 'user' AND
  created_by = auth.uid()
);

-- Policy: Users can update their own exercises
CREATE POLICY "Users can update their own exercises"
ON exercises FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Add policy comments for documentation
COMMENT ON POLICY "Exercises are viewable by everyone" ON exercises
IS 'Allows public read access to all exercises';

COMMENT ON POLICY "Users can insert their own exercises" ON exercises
IS 'Allows authenticated users to create custom exercises with source=user';

COMMENT ON POLICY "Users can update their own exercises" ON exercises
IS 'Allows users to update exercises they created';
