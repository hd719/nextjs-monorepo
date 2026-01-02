-- Create goals table with complete schema
-- Migration: 037_create_goals_table.sql
-- Description: Creates the goals table for tracking user fitness and nutrition goals

CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'nutrition')),
  title text NOT NULL,
  target_value numeric,
  target_unit text,
  start_date date NOT NULL,
  target_date date,
  current_value numeric,
  is_active boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Ensure target_date is after start_date if both are provided
  CONSTRAINT goals_date_check CHECK (
    target_date IS NULL OR target_date >= start_date
  )
);

-- Add comments for documentation
COMMENT ON TABLE goals IS 'Track user''s fitness and nutrition goals';
COMMENT ON COLUMN goals.id IS 'Primary key UUID';
COMMENT ON COLUMN goals.user_id IS 'References auth.users(id) - user who created this goal';
COMMENT ON COLUMN goals.goal_type IS 'Goal type: weight_loss, weight_gain, muscle_gain, endurance, strength, or nutrition';
COMMENT ON COLUMN goals.title IS 'Goal title/description';
COMMENT ON COLUMN goals.target_value IS 'Target value (weight, calories, etc.)';
COMMENT ON COLUMN goals.target_unit IS 'Unit of measurement';
COMMENT ON COLUMN goals.start_date IS 'Goal start date';
COMMENT ON COLUMN goals.target_date IS 'Target completion date';
COMMENT ON COLUMN goals.current_value IS 'Current progress value';
COMMENT ON COLUMN goals.is_active IS 'Whether goal is currently active';
COMMENT ON COLUMN goals.is_completed IS 'Whether goal has been achieved';
COMMENT ON COLUMN goals.completed_at IS 'When goal was completed';
COMMENT ON COLUMN goals.notes IS 'Goal notes';
COMMENT ON COLUMN goals.created_at IS 'Timestamp when goal was created';
COMMENT ON COLUMN goals.updated_at IS 'Timestamp when goal was last updated (auto-updated via trigger)';
