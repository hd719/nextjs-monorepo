-- Add performance indexes for meal_plans table
-- Migration: 034_add_indexes_meal_plans.sql
-- Description: Creates indexes for optimal query performance on meal_plans table

-- Composite index for user's weekly meal plan queries (most common query pattern)
CREATE INDEX idx_meal_plans_user_week ON meal_plans (user_id, week_start_date, day_of_week, meal_type);

-- Index for food_item lookups
CREATE INDEX idx_meal_plans_food_item_id ON meal_plans (food_item_id) WHERE food_item_id IS NOT NULL;

-- Index for recipe_id lookups
CREATE INDEX idx_meal_plans_recipe_id ON meal_plans (recipe_id) WHERE recipe_id IS NOT NULL;
