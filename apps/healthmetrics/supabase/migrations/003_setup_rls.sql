-- Setup Row Level Security (RLS) for users table
-- Migration: 003_setup_rls.sql
-- Description: Enables RLS and creates security policies for user profile access control

-- Enable Row Level Security on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can insert their own profile (id must match auth.uid())
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users cannot delete their own profile (prevent accidental deletion)
-- Only admins can delete profiles (handled via service role or admin function)
-- If deletion is needed, it should cascade from auth.users deletion

-- Add policy comments for documentation
COMMENT ON POLICY "Users can view their own profile" ON users
IS 'Allows users to read their own profile data';

COMMENT ON POLICY "Users can insert their own profile" ON users
IS 'Allows authenticated users to create their profile with id matching their auth.uid()';

COMMENT ON POLICY "Users can update their own profile" ON users
IS 'Allows users to update their own profile data';
