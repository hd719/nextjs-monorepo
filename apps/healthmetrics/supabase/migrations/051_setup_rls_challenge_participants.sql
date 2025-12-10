-- Setup Row Level Security (RLS) for challenge_participants table
-- Migration: 051_setup_rls_challenge_participants.sql
-- Description: Enables RLS and creates security policies for challenge_participants access control

-- Enable Row Level Security on challenge_participants table
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all participants in challenges they're participating in or challenges they created
CREATE POLICY "Users can view participants in their challenges"
ON challenge_participants FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM challenges
    WHERE challenges.id = challenge_participants.challenge_id
    AND challenges.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM challenges
    WHERE challenges.id = challenge_participants.challenge_id
    AND challenges.is_public = true
  )
);

-- Policy: Users can join challenges (insert themselves as participants)
CREATE POLICY "Users can join challenges"
ON challenge_participants FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  auth.uid() = user_id
);

-- Policy: Users can update their own participation progress
CREATE POLICY "Users can update their own participation"
ON challenge_participants FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can leave challenges (delete their participation)
CREATE POLICY "Users can leave challenges"
ON challenge_participants FOR DELETE
USING (auth.uid() = user_id);

-- Add policy comments for documentation
COMMENT ON POLICY "Users can view participants in their challenges" ON challenge_participants
IS 'Allows users to view all participants in challenges they''re in, challenges they created, or public challenges';

COMMENT ON POLICY "Users can join challenges" ON challenge_participants
IS 'Allows users to join challenges (insert themselves as participants)';

COMMENT ON POLICY "Users can update their own participation" ON challenge_participants
IS 'Allows users to update their own progress in challenges';

COMMENT ON POLICY "Users can leave challenges" ON challenge_participants
IS 'Allows users to leave challenges (delete their participation)';
