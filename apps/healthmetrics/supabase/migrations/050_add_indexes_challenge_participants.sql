-- Add performance indexes for challenge_participants table
-- Migration: 050_add_indexes_challenge_participants.sql
-- Description: Creates indexes for optimal query performance on challenge_participants table

-- Composite index for leaderboard queries (challenge_id, current_value DESC)
CREATE INDEX idx_challenge_participants_leaderboard ON challenge_participants (challenge_id, current_value DESC NULLS LAST);

-- Index for user's challenge list
CREATE INDEX idx_challenge_participants_user_id ON challenge_participants (user_id);

-- Index for challenge lookups
CREATE INDEX idx_challenge_participants_challenge_id ON challenge_participants (challenge_id);

-- Index for rank queries
CREATE INDEX idx_challenge_participants_rank ON challenge_participants (challenge_id, rank) WHERE rank IS NOT NULL;

-- Note: Unique constraint on (challenge_id, user_id) already creates an index
