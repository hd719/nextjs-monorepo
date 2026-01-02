-- Add performance indexes for weight_entries table
-- Migration: 022_add_indexes_weight_entries.sql
-- Description: Creates indexes for optimal query performance on weight_entries table

-- Composite index for user's weight history queries (most common query pattern)
CREATE INDEX idx_weight_entries_user_date ON weight_entries (user_id, date DESC);

-- Index for date range queries
CREATE INDEX idx_weight_entries_date ON weight_entries (date);
