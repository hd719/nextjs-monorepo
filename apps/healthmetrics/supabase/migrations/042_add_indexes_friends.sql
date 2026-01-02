-- Add performance indexes for friends table
-- Migration: 042_add_indexes_friends.sql
-- Description: Creates indexes for optimal query performance on friends table

-- Composite index for user's friends list (most common query pattern)
CREATE INDEX idx_friends_user_status ON friends (user_id, status);

-- Index for friend_id lookups (reverse relationships)
CREATE INDEX idx_friends_friend_id ON friends (friend_id);

-- Index for requested_by lookups
CREATE INDEX idx_friends_requested_by ON friends (requested_by);

-- Note: Unique constraint on (user_id, friend_id) already creates an index
