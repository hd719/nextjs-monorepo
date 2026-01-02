-- Create friends table with complete schema
-- Migration: 041_create_friends_table.sql
-- Description: Creates the friends table for user friend relationships

CREATE TABLE friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Ensure user_id and friend_id are different
  CONSTRAINT friends_different_users_check CHECK (user_id != friend_id),
  -- Unique constraint to prevent duplicate relationships
  CONSTRAINT friends_unique_relationship UNIQUE (user_id, friend_id)
);

-- Add comments for documentation
COMMENT ON TABLE friends IS 'User friend relationships for social features';
COMMENT ON COLUMN friends.id IS 'Primary key UUID';
COMMENT ON COLUMN friends.user_id IS 'References auth.users(id) - first user in the relationship';
COMMENT ON COLUMN friends.friend_id IS 'References auth.users(id) - second user in the relationship';
COMMENT ON COLUMN friends.status IS 'Relationship status: pending, accepted, or blocked';
COMMENT ON COLUMN friends.requested_by IS 'References auth.users(id) - who sent the friend request';
COMMENT ON COLUMN friends.created_at IS 'Timestamp when relationship was created';
COMMENT ON COLUMN friends.updated_at IS 'Timestamp when relationship was last updated (auto-updated via trigger)';
