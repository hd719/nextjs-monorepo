-- Add performance indexes for recipes table
-- Migration: 002_add_indexes.sql
-- Description: Creates indexes for optimal query performance on recipes table

-- Index for public recipe listings (published recipes ordered by publish date)
CREATE INDEX idx_recipes_published_listing
ON recipes (is_published, published_at DESC)
WHERE is_published = true;

-- Index for slug lookups (SEO-friendly URLs)
CREATE INDEX idx_recipes_slug ON recipes (slug);

-- Index for user-specific queries (admin dashboard)
CREATE INDEX idx_recipes_owner_id ON recipes (owner_id);

-- Index for category filtering
CREATE INDEX idx_recipes_category ON recipes (category) WHERE category IS NOT NULL;

-- Index for cuisine filtering
CREATE INDEX idx_recipes_cuisine ON recipes (cuisine) WHERE cuisine IS NOT NULL;

-- Composite index for user recipes with status
CREATE INDEX idx_recipes_owner_status ON recipes (owner_id, is_published, updated_at DESC);
