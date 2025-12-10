-- Add automatic updated_at timestamp trigger
-- Migration: 004_add_updated_at_trigger.sql
-- Description: Creates function and trigger to automatically update the updated_at column

-- Create function to update updated_at column (reusable for other tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON FUNCTION update_updated_at_column()
IS 'Automatically updates the updated_at timestamp when a row is modified. Reusable function for all tables.';

COMMENT ON TRIGGER update_users_updated_at ON users
IS 'Automatically updates updated_at column when user profile is modified';
