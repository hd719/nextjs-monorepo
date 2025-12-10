-- Add performance indexes for workout_logs table
-- Migration: 018_add_indexes_workout_logs.sql
-- Description: Creates indexes for optimal query performance on workout_logs table

-- Composite index for user's workout history queries (most common query pattern)
CREATE INDEX idx_workout_logs_user_date ON workout_logs (user_id, date DESC);

-- Index for exercise lookups
CREATE INDEX idx_workout_logs_exercise_id ON workout_logs (exercise_id);

-- Index for date range queries
CREATE INDEX idx_workout_logs_date ON workout_logs (date);
