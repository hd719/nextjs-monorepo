-- Add performance indexes for goals table
-- Migration: 038_add_indexes_goals.sql
-- Description: Creates indexes for optimal query performance on goals table

-- Composite index for user's active goals (most common query pattern)
CREATE INDEX idx_goals_user_active ON goals (user_id, is_active) WHERE is_active = true;

-- Index for goal_type filtering
CREATE INDEX idx_goals_goal_type ON goals (goal_type);

-- Index for completed goals
CREATE INDEX idx_goals_completed ON goals (user_id, is_completed) WHERE is_completed = true;
