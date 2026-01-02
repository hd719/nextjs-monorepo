-- Setup Row Level Security (RLS) for friends table
-- Migration: 043_setup_rls_friends.sql
-- Description: Enables RLS and creates security policies for friends access control

-- Enable Row Level Security on friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read relationships where they are user_id or friend_id
CREATE POLICY "Users can view their own friend relationships"
ON friends FOR SELECT
USING (
  auth.uid() = user_id OR
  auth.uid() = friend_id
);

-- Policy: Users can insert friend requests (as user_id or friend_id)
CREATE POLICY "Users can create friend relationships"
ON friends FOR INSERT
WITH CHECK (
  (auth.uid() = user_id OR auth.uid() = friend_id) AND
  auth.uid() = requested_by
);

-- Policy: Users can update relationships where they are involved
CREATE POLICY "Users can update their own friend relationships"
ON friends FOR UPDATE
USING (
  auth.uid() = user_id OR
  auth.uid() = friend_id
)
WITH CHECK (
  auth.uid() = user_id OR
  auth.uid() = friend_id
);

-- Policy: Users can delete relationships where they are involved
CREATE POLICY "Users can delete their own friend relationships"
ON friends FOR DELETE
USING (
  auth.uid() = user_id OR
  auth.uid() = friend_id
);

-- Add policy comments for documentation
COMMENT ON POLICY "Users can view their own friend relationships" ON friends
IS 'Allows users to read relationships where they are involved (as user_id or friend_id)';

COMMENT ON POLICY "Users can create friend relationships" ON friends
IS 'Allows users to create friend requests (must be the requester)';

COMMENT ON POLICY "Users can update their own friend relationships" ON friends
IS 'Allows users to update relationships they are involved in (e.g., accept/block)';

COMMENT ON POLICY "Users can delete their own friend relationships" ON friends
IS 'Allows users to delete relationships they are involved in';
