-- Create challenges table with complete schema
-- Migration: 045_create_challenges_table.sql
-- Description: Creates the challenges table for community fitness challenges

CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL CHECK (challenge_type IN ('weight_loss', 'steps', 'workouts', 'nutrition', 'custom')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  target_value numeric,
  target_unit text,
  is_public boolean DEFAULT false,
  max_participants integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Ensure end_date is after or equal to start_date
  CONSTRAINT challenges_date_check CHECK (end_date >= start_date)
);

-- Add comments for documentation
COMMENT ON TABLE challenges IS 'Fitness challenges that users can join';
COMMENT ON COLUMN challenges.id IS 'Primary key UUID';
COMMENT ON COLUMN challenges.created_by IS 'References auth.users(id) - user who created this challenge';
COMMENT ON COLUMN challenges.title IS 'Challenge title';
COMMENT ON COLUMN challenges.description IS 'Challenge description';
COMMENT ON COLUMN challenges.challenge_type IS 'Challenge type: weight_loss, steps, workouts, nutrition, or custom';
COMMENT ON COLUMN challenges.start_date IS 'Challenge start date';
COMMENT ON COLUMN challenges.end_date IS 'Challenge end date (must be >= start_date)';
COMMENT ON COLUMN challenges.target_value IS 'Target value for challenge';
COMMENT ON COLUMN challenges.target_unit IS 'Unit of measurement';
COMMENT ON COLUMN challenges.is_public IS 'Whether challenge is public (readable by all)';
COMMENT ON COLUMN challenges.max_participants IS 'Maximum number of participants';
COMMENT ON COLUMN challenges.created_at IS 'Timestamp when challenge was created';
COMMENT ON COLUMN challenges.updated_at IS 'Timestamp when challenge was last updated (auto-updated via trigger)';
