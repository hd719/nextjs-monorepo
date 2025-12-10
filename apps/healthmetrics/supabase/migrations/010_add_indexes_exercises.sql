-- Add performance indexes for exercises table
-- Migration: 010_add_indexes_exercises.sql
-- Description: Creates indexes for optimal query performance on exercises table

-- Index for name searches (full-text search)
CREATE INDEX idx_exercises_name ON exercises USING gin(to_tsvector('english', name));

-- Index for category filtering
CREATE INDEX idx_exercises_category ON exercises (category);

-- Index for user-created exercises
CREATE INDEX idx_exercises_created_by ON exercises (created_by) WHERE created_by IS NOT NULL;

-- Index for verified exercises
CREATE INDEX idx_exercises_verified ON exercises (verified) WHERE verified = true;

-- Index for difficulty filtering
CREATE INDEX idx_exercises_difficulty ON exercises (difficulty) WHERE difficulty IS NOT NULL;
