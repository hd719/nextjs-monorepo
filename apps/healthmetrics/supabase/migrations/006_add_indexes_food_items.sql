-- Add performance indexes for food_items table
-- Migration: 006_add_indexes_food_items.sql
-- Description: Creates indexes for optimal query performance on food_items table

-- Index for name searches (full-text search)
CREATE INDEX idx_food_items_name ON food_items USING gin(to_tsvector('english', name));

-- Index for brand searches
CREATE INDEX idx_food_items_brand ON food_items (brand) WHERE brand IS NOT NULL;

-- Index for barcode lookups (unique constraint already creates index, but explicit for clarity)
-- Note: Unique constraint on barcode already creates an index

-- Index for user-created foods
CREATE INDEX idx_food_items_created_by ON food_items (created_by) WHERE created_by IS NOT NULL;

-- Index for verified foods
CREATE INDEX idx_food_items_verified ON food_items (verified) WHERE verified = true;

-- Index for source filtering
CREATE INDEX idx_food_items_source ON food_items (source);
