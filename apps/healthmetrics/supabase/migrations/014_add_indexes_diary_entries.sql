-- Add performance indexes for diary_entries table
-- Migration: 014_add_indexes_diary_entries.sql
-- Description: Creates indexes for optimal query performance on diary_entries table

-- Composite index for user's daily diary queries (most common query pattern)
CREATE INDEX idx_diary_entries_user_date ON diary_entries (user_id, date DESC);

-- Index for food_item lookups
CREATE INDEX idx_diary_entries_food_item_id ON diary_entries (food_item_id);

-- Index for meal_type filtering within a day
CREATE INDEX idx_diary_entries_meal_type ON diary_entries (meal_type);
