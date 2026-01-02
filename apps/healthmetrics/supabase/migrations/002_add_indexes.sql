-- Add performance indexes for users table
-- Migration: 002_add_indexes.sql
-- Description: Creates indexes for optimal query performance on users table

-- Index for admin queries (filtering admin users)
CREATE INDEX idx_users_is_admin ON users (is_admin) WHERE is_admin = true;

-- Index for display_name searches (if needed for user search functionality)
CREATE INDEX idx_users_display_name ON users (display_name) WHERE display_name IS NOT NULL;

-- Note: Primary key (id) is automatically indexed by PostgreSQL
-- Note: Foreign key to auth.users(id) doesn't need an index as it's the primary key
