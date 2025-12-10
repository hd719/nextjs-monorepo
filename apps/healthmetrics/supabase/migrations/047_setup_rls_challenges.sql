-- Setup Row Level Security (RLS) for challenges table
-- Migration: 047_setup_rls_challenges.sql
-- Description: Enables RLS and creates security policies for challenges access control

-- Enable Row Level Security on challenges table
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read public challenges, users can read challenges they created
CREATE POLICY "Public challenges are viewable by everyone, private by creator"
ON challenges FOR SELECT
USING (
  is_public = true OR
  auth.uid() = created_by
);

-- Policy: Authenticated users can create challenges
CREATE POLICY "Authenticated users can create challenges"
ON challenges FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  auth.uid() = created_by
);

-- Policy: Challenge creators can update their challenges
CREATE POLICY "Challenge creators can update their challenges"
ON challenges FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Policy: Challenge creators can delete their challenges
CREATE POLICY "Challenge creators can delete their challenges"
ON challenges FOR DELETE
USING (auth.uid() = created_by);

-- Add policy comments for documentation
COMMENT ON POLICY "Public challenges are viewable by everyone, private by creator" ON challenges
IS 'Allows public read access to public challenges, and creators can read their own private challenges';

COMMENT ON POLICY "Authenticated users can create challenges" ON challenges
IS 'Allows authenticated users to create new challenges';

COMMENT ON POLICY "Challenge creators can update their challenges" ON challenges
IS 'Allows challenge creators to update their own challenges';

COMMENT ON POLICY "Challenge creators can delete their challenges" ON challenges
IS 'Allows challenge creators to delete their own challenges';
