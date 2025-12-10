-- Create challenge_participants table with complete schema
-- Migration: 049_create_challenge_participants_table.sql
-- Description: Creates the challenge_participants table for tracking challenge participation

CREATE TABLE challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_value numeric,
  rank integer,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Unique constraint to prevent duplicate participation
  CONSTRAINT challenge_participants_unique UNIQUE (challenge_id, user_id)
);

-- Add comments for documentation
COMMENT ON TABLE challenge_participants IS 'Tracks which users are participating in which challenges (many-to-many)';
COMMENT ON COLUMN challenge_participants.id IS 'Primary key UUID';
COMMENT ON COLUMN challenge_participants.challenge_id IS 'References challenges(id) - challenge being participated in';
COMMENT ON COLUMN challenge_participants.user_id IS 'References auth.users(id) - user participating in challenge';
COMMENT ON COLUMN challenge_participants.current_value IS 'User''s current progress value';
COMMENT ON COLUMN challenge_participants.rank IS 'User''s rank in challenge (calculated)';
COMMENT ON COLUMN challenge_participants.joined_at IS 'When user joined the challenge';
COMMENT ON COLUMN challenge_participants.created_at IS 'Timestamp when participation record was created';
COMMENT ON COLUMN challenge_participants.updated_at IS 'Timestamp when participation record was last updated (auto-updated via trigger)';
