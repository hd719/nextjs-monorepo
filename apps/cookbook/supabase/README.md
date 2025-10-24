# Supabase Database Migrations

This directory contains SQL migration files for the cookbook application database schema.

## Migration Files

1. **001_create_recipes_table.sql** - Creates the main recipes table with all required columns
2. **002_add_indexes.sql** - Adds performance indexes for optimal query performance
3. **003_setup_rls.sql** - Enables Row Level Security and creates access policies
4. **004_add_updated_at_trigger.sql** - Adds automatic timestamp updating

## How to Run Migrations

### Option 1: Supabase CLI (Recommended)
```bash
# Install Supabase CLI if not already installed
pnpm install -g supabase

# Initialize Supabase in your project (if not done)
supabase init

# Run all migrations
supabase db push
```

### Option 2: Manual Execution
Run each migration file in order through the Supabase Dashboard SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file content in numerical order
4. Execute each migration

### Option 3: Direct SQL Execution
```sql
-- Run in Supabase SQL Editor or psql
\i 001_create_recipes_table.sql
\i 002_add_indexes.sql
\i 003_setup_rls.sql
\i 004_add_updated_at_trigger.sql
```

## Verification

After running migrations, verify the setup:

```sql
-- Check table exists
SELECT * FROM information_schema.tables WHERE table_name = 'recipes';

-- Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'recipes';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'recipes';

-- Check policies
SELECT policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'recipes';
```

## Schema Overview

The `recipes` table includes:
- **id**: UUID primary key
- **owner_id**: References auth.users(id) 
- **title**: Recipe title
- **slug**: SEO-friendly URL slug (unique)
- **description**: Recipe description
- **ingredients**: JSONB array of ingredients
- **steps**: JSONB array of cooking steps
- **images**: JSONB array of image URLs
- **category**: Recipe category (e.g., "Breakfast")
- **cuisine**: Recipe cuisine (e.g., "Italian")
- **servings**: Number of servings
- **prep_minutes**: Preparation time in minutes
- **cook_minutes**: Cooking time in minutes
- **is_published**: Whether recipe is public
- **published_at**: When recipe was published
- **created_at**: When recipe was created
- **updated_at**: When recipe was last updated (auto-updated)

## Security

Row Level Security (RLS) policies ensure:
- ✅ Anyone can read published recipes
- ✅ Users can read their own drafts
- ✅ Users can only modify their own recipes
- ❌ Users cannot access other users' drafts
- ❌ Unauthenticated users cannot modify data
