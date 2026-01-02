-- Create users table with complete schema
-- Migration: 001_create_users_table.sql
-- Description: Creates the users table that extends Supabase auth.users with fitness-specific profile data and preferences

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  height_cm numeric,
  activity_level text CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  goal_type text CHECK (goal_type IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle')),
  target_weight_kg numeric,
  daily_calorie_goal integer,
  daily_protein_goal_g integer,
  daily_carb_goal_g integer,
  daily_fat_goal_g integer,
  units_preference text DEFAULT 'metric' CHECK (units_preference IN ('metric', 'imperial')),
  timezone text DEFAULT 'UTC',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Extends Supabase auth.users with fitness-specific profile data and preferences';
COMMENT ON COLUMN users.id IS 'References auth.users(id) - one-to-one relationship';
COMMENT ON COLUMN users.display_name IS 'User''s display name for the application';
COMMENT ON COLUMN users.avatar_url IS 'Profile picture URL stored in Supabase Storage';
COMMENT ON COLUMN users.date_of_birth IS 'User''s date of birth for age calculations and BMR';
COMMENT ON COLUMN users.gender IS 'User''s gender: male, female, or other (for BMR calculations)';
COMMENT ON COLUMN users.height_cm IS 'User''s height in centimeters';
COMMENT ON COLUMN users.activity_level IS 'Activity level: sedentary, lightly_active, moderately_active, very_active, or extremely_active';
COMMENT ON COLUMN users.goal_type IS 'Fitness goal: lose_weight, maintain_weight, gain_weight, or build_muscle';
COMMENT ON COLUMN users.target_weight_kg IS 'Target weight in kilograms';
COMMENT ON COLUMN users.daily_calorie_goal IS 'Daily calorie target';
COMMENT ON COLUMN users.daily_protein_goal_g IS 'Daily protein target in grams';
COMMENT ON COLUMN users.daily_carb_goal_g IS 'Daily carbohydrate target in grams';
COMMENT ON COLUMN users.daily_fat_goal_g IS 'Daily fat target in grams';
COMMENT ON COLUMN users.units_preference IS 'Preferred unit system: metric or imperial';
COMMENT ON COLUMN users.timezone IS 'User''s timezone for date/time calculations';
COMMENT ON COLUMN users.is_admin IS 'Whether user has admin privileges (can verify food_items and exercises, manage public database)';
COMMENT ON COLUMN users.created_at IS 'Timestamp when user profile was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when user profile was last updated (auto-updated via trigger)';
