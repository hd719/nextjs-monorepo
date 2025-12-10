-- Add performance indexes for challenges table
-- Migration: 046_add_indexes_challenges.sql
-- Description: Creates indexes for optimal query performance on challenges table

-- Index for creator lookups
CREATE INDEX idx_challenges_created_by ON challenges (created_by);

-- Index for public challenges
CREATE INDEX idx_challenges_is_public ON challenges (is_public) WHERE is_public = true;

-- Composite index for date range queries
CREATE INDEX idx_challenges_dates ON challenges (start_date, end_date);

-- Index for challenge_type filtering
CREATE INDEX idx_challenges_challenge_type ON challenges (challenge_type);
