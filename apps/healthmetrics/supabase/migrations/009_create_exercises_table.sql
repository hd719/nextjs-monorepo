-- Create exercises table with complete schema
-- Migration: 009_create_exercises_table.sql
-- Description: Creates the exercises table for public exercise database with MET values

CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('cardio', 'strength', 'flexibility', 'sports', 'other')),
  muscle_groups text[],
  met_value numeric NOT NULL,
  description text,
  instructions text[],
  equipment text[],
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  source text DEFAULT 'user' CHECK (source IN ('usda', 'user', 'verified')),
  verified boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE exercises IS 'Public exercise database with MET values and calorie calculations';
COMMENT ON COLUMN exercises.id IS 'Primary key UUID';
COMMENT ON COLUMN exercises.name IS 'Exercise name (indexed for search)';
COMMENT ON COLUMN exercises.category IS 'Exercise category: cardio, strength, flexibility, sports, or other';
COMMENT ON COLUMN exercises.muscle_groups IS 'Array of muscle groups (e.g., [''chest'', ''triceps''])';
COMMENT ON COLUMN exercises.met_value IS 'Metabolic Equivalent of Task (for calorie calculation)';
COMMENT ON COLUMN exercises.description IS 'Exercise description';
COMMENT ON COLUMN exercises.instructions IS 'Array of instruction steps';
COMMENT ON COLUMN exercises.equipment IS 'Required equipment (e.g., [''dumbbells'', ''bench''])';
COMMENT ON COLUMN exercises.difficulty IS 'Difficulty level: beginner, intermediate, or advanced';
COMMENT ON COLUMN exercises.source IS 'Data source: usda, user, or verified';
COMMENT ON COLUMN exercises.verified IS 'Admin-verified accuracy';
COMMENT ON COLUMN exercises.created_by IS 'References auth.users(id) if user-created';
COMMENT ON COLUMN exercises.created_at IS 'Timestamp when exercise was created';
COMMENT ON COLUMN exercises.updated_at IS 'Timestamp when exercise was last updated (auto-updated via trigger)';
