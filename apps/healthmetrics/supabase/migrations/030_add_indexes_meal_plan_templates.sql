-- Add performance indexes for meal_plan_templates table
-- Migration: 030_add_indexes_meal_plan_templates.sql
-- Description: Creates indexes for optimal query performance on meal_plan_templates table

-- Index for user's templates
CREATE INDEX idx_meal_plan_templates_user_id ON meal_plan_templates (user_id);

-- Index for public templates
CREATE INDEX idx_meal_plan_templates_is_public ON meal_plan_templates (is_public) WHERE is_public = true;

-- Index for name searches
CREATE INDEX idx_meal_plan_templates_name ON meal_plan_templates (name);
