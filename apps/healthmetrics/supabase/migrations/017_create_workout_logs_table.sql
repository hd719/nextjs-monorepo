-- Create workout_logs table with complete schema
-- Migration: 017_create_workout_logs_table.sql
-- Description: Creates the workout_logs table for exercise/workout history tracking

CREATE TABLE workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  date date NOT NULL,
  duration_minutes integer NOT NULL,
  calories_burned integer,
  sets integer,
  reps integer,
  weight_kg numeric,
  distance_km numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE workout_logs IS 'User''s exercise/workout history';
COMMENT ON COLUMN workout_logs.id IS 'Primary key UUID';
COMMENT ON COLUMN workout_logs.user_id IS 'References auth.users(id) - user who logged this workout';
COMMENT ON COLUMN workout_logs.exercise_id IS 'References exercises(id) - must always reference an exercise';
COMMENT ON COLUMN workout_logs.date IS 'Date of workout';
COMMENT ON COLUMN workout_logs.duration_minutes IS 'Duration in minutes';
COMMENT ON COLUMN workout_logs.calories_burned IS 'Calculated calories burned';
COMMENT ON COLUMN workout_logs.sets IS 'Number of sets (for strength training)';
COMMENT ON COLUMN workout_logs.reps IS 'Reps per set (for strength training)';
COMMENT ON COLUMN workout_logs.weight_kg IS 'Weight used in kg (for strength training)';
COMMENT ON COLUMN workout_logs.distance_km IS 'Distance covered in km (for cardio)';
COMMENT ON COLUMN workout_logs.notes IS 'User notes';
COMMENT ON COLUMN workout_logs.created_at IS 'Timestamp when workout was logged';
COMMENT ON COLUMN workout_logs.updated_at IS 'Timestamp when workout was last updated (auto-updated via trigger)';
