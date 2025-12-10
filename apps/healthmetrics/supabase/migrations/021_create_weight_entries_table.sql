-- Create weight_entries table with complete schema
-- Migration: 021_create_weight_entries_table.sql
-- Description: Creates the weight_entries table for tracking weight and body measurements

CREATE TABLE weight_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  weight_kg numeric,
  body_fat_percentage numeric,
  muscle_mass_kg numeric,
  waist_cm numeric,
  hips_cm numeric,
  chest_cm numeric,
  thigh_cm numeric,
  bicep_cm numeric,
  photo_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE weight_entries IS 'Track user''s weight and body measurements over time';
COMMENT ON COLUMN weight_entries.id IS 'Primary key UUID';
COMMENT ON COLUMN weight_entries.user_id IS 'References auth.users(id) - user who logged this measurement';
COMMENT ON COLUMN weight_entries.date IS 'Date of measurement';
COMMENT ON COLUMN weight_entries.weight_kg IS 'Weight in kilograms';
COMMENT ON COLUMN weight_entries.body_fat_percentage IS 'Body fat percentage';
COMMENT ON COLUMN weight_entries.muscle_mass_kg IS 'Muscle mass in kg';
COMMENT ON COLUMN weight_entries.waist_cm IS 'Waist circumference in cm';
COMMENT ON COLUMN weight_entries.hips_cm IS 'Hip circumference in cm';
COMMENT ON COLUMN weight_entries.chest_cm IS 'Chest circumference in cm';
COMMENT ON COLUMN weight_entries.thigh_cm IS 'Thigh circumference in cm';
COMMENT ON COLUMN weight_entries.bicep_cm IS 'Bicep circumference in cm';
COMMENT ON COLUMN weight_entries.photo_url IS 'Progress photo URL (Supabase Storage)';
COMMENT ON COLUMN weight_entries.notes IS 'User notes';
COMMENT ON COLUMN weight_entries.created_at IS 'Timestamp when entry was created';
COMMENT ON COLUMN weight_entries.updated_at IS 'Timestamp when entry was last updated (auto-updated via trigger)';
