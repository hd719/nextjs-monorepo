# Sprint 0: Foundation & Setup (v0)

**Goal**: Establish core infrastructure, database schema, design system, and development environment

## Overview

Sprint 0 focuses on setting up the foundational infrastructure before building features. This includes database architecture, design system, authentication setup, and basic project structure that will support all future development.

---

## Database Architecture (Supabase)

**Core Tables**:

- `users` - User profiles and preferences (includes admin flag)
- `food_items` - Food database with nutrition data (includes user-created custom foods)
- `diary_entries` - Daily food logs (must reference food_items)
- `exercises` - Exercise database (includes user-created custom exercises)
- `workout_logs` - Exercise tracking (must reference exercises)
- `weight_entries` - Weight and body measurements
- `meal_plans` - Weekly meal planning
- `meal_plan_templates` - Reusable meal plan templates
- `goals` - User fitness goals
- `friends` - Social connections
- `challenges` - Community challenges
- `challenge_participants` - Users participating in challenges
- `recipe_cache` - Cached cookbook recipe nutrition data

**RLS Policies**: User-specific data access with shared public food database

**Migrations**: Version-controlled SQL migrations in `supabase/migrations/`

---

### Detailed Table Schemas

#### 1. `users` - User Profiles and Preferences

**Purpose**: Extends Supabase auth.users with fitness-specific profile data and preferences

**Columns**:
- `id` (uuid, PK) - References `auth.users(id)` ON DELETE CASCADE
- `display_name` (text) - User's display name
- `avatar_url` (text, nullable) - Profile picture URL (Supabase Storage)
- `date_of_birth` (date, nullable) - For age calculations and BMR
- `gender` (text, nullable) - 'male', 'female', 'other' (for BMR calculations)
- `height_cm` (numeric, nullable) - Height in centimeters
- `activity_level` (text, nullable) - 'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'
- `goal_type` (text, nullable) - 'lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle'
- `target_weight_kg` (numeric, nullable) - Target weight in kilograms
- `daily_calorie_goal` (integer, nullable) - Daily calorie target
- `daily_protein_goal_g` (integer, nullable) - Daily protein target in grams
- `daily_carb_goal_g` (integer, nullable) - Daily carb target in grams
- `daily_fat_goal_g` (integer, nullable) - Daily fat target in grams
- `units_preference` (text, default 'metric') - 'metric' or 'imperial'
- `timezone` (text, default 'UTC') - User's timezone
- `is_admin` (boolean, default false) - Whether user has admin privileges
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: One-to-one with auth.users. Stores user preferences and goals. Admin users can verify food_items and exercises, and manage the public database.

---

#### 2. `food_items` - Public Food Database

**Purpose**: Shared food database with nutrition information (like USDA FoodData Central)

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `name` (text, NOT NULL) - Food item name (indexed for search)
- `brand` (text, nullable) - Brand name if applicable
- `barcode` (text, unique, nullable) - UPC/EAN barcode for scanning
- `serving_size_g` (numeric, NOT NULL) - Standard serving size in grams
- `serving_size_unit` (text) - Unit description (e.g., "1 cup", "1 piece")
- `calories_per_100g` (numeric, NOT NULL) - Calories per 100g
- `protein_g` (numeric, NOT NULL) - Protein per 100g
- `carbs_g` (numeric, NOT NULL) - Carbohydrates per 100g
- `fat_g` (numeric, NOT NULL) - Fat per 100g
- `fiber_g` (numeric, nullable) - Fiber per 100g
- `sugar_g` (numeric, nullable) - Sugar per 100g
- `sodium_mg` (numeric, nullable) - Sodium per 100g in milligrams
- `source` (text, NOT NULL) - 'usda', 'edamam', 'open_food_facts', 'user', 'cookbook'
- `source_id` (text, nullable) - External API ID for reference
- `verified` (boolean, default false) - Admin-verified accuracy
- `created_by` (uuid, nullable) - References `auth.users(id)` if user-created
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: 
- Public read access, admin write access. Full-text search on name and brand.
- **Custom Foods**: Users can create custom food items (source='user', created_by=user_id). All foods must exist in food_items before being used in diary_entries. This ensures data consistency, enables reuse, and allows for future sharing/verification.
- Admin users can verify user-created foods (verified=true).

---

#### 3. `diary_entries` - Daily Food Logs

**Purpose**: User's daily food consumption tracking

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL) - References `auth.users(id)` ON DELETE CASCADE
- `date` (date, NOT NULL) - Date of consumption
- `food_item_id` (uuid, NOT NULL) - References `food_items(id)`
- `meal_type` (text, NOT NULL) - 'breakfast', 'lunch', 'dinner', 'snack', 'other'
- `quantity_g` (numeric, NOT NULL) - Amount consumed in grams
- `servings` (numeric, default 1.0) - Number of servings (calculated from quantity_g)
- `notes` (text, nullable) - User notes about this entry
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: 
- User-specific, indexed on (user_id, date). Allows multiple entries per day.
- **Food Reference**: Must always reference a food_item_id. Users create custom foods in food_items first, then log them here.

---

#### 4. `exercises` - Exercise Database

**Purpose**: Public exercise database with MET values and calorie calculations

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `name` (text, NOT NULL) - Exercise name (indexed for search)
- `category` (text, NOT NULL) - 'cardio', 'strength', 'flexibility', 'sports', 'other'
- `muscle_groups` (text[], nullable) - Array of muscle groups (e.g., ['chest', 'triceps'])
- `met_value` (numeric, NOT NULL) - Metabolic Equivalent of Task (for calorie calculation)
- `description` (text, nullable) - Exercise description
- `instructions` (text[], nullable) - Array of instruction steps
- `equipment` (text[], nullable) - Required equipment (e.g., ['dumbbells', 'bench'])
- `difficulty` (text, nullable) - 'beginner', 'intermediate', 'advanced'
- `source` (text, default 'user') - 'usda', 'user', 'verified'
- `verified` (boolean, default false) - Admin-verified accuracy
- `created_by` (uuid, nullable) - References `auth.users(id)` if user-created
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: 
- Public read access. MET values used for calorie burn calculations.
- **Custom Exercises**: Users can create custom exercises (source='user', created_by=user_id). All exercises must exist in exercises before being used in workout_logs. This ensures data consistency, enables reuse, and allows for future sharing/verification.
- Admin users can verify user-created exercises (verified=true).

---

#### 5. `workout_logs` - Exercise Tracking

**Purpose**: User's exercise/workout history

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL) - References `auth.users(id)` ON DELETE CASCADE
- `exercise_id` (uuid, NOT NULL) - References `exercises(id)`
- `date` (date, NOT NULL) - Date of workout
- `duration_minutes` (integer, NOT NULL) - Duration in minutes
- `calories_burned` (integer, nullable) - Calculated calories burned
- `sets` (integer, nullable) - Number of sets (for strength training)
- `reps` (integer, nullable) - Reps per set (for strength training)
- `weight_kg` (numeric, nullable) - Weight used in kg (for strength training)
- `distance_km` (numeric, nullable) - Distance covered in km (for cardio)
- `notes` (text, nullable) - User notes
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: 
- User-specific, indexed on (user_id, date). Flexible schema for different exercise types.
- **Exercise Reference**: Must always reference an exercise_id. Users create custom exercises in exercises first, then log them here.

---

#### 6. `weight_entries` - Weight and Body Measurements

**Purpose**: Track user's weight and body measurements over time

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL) - References `auth.users(id)` ON DELETE CASCADE
- `date` (date, NOT NULL) - Date of measurement
- `weight_kg` (numeric, nullable) - Weight in kilograms
- `body_fat_percentage` (numeric, nullable) - Body fat percentage
- `muscle_mass_kg` (numeric, nullable) - Muscle mass in kg
- `waist_cm` (numeric, nullable) - Waist circumference in cm
- `hips_cm` (numeric, nullable) - Hip circumference in cm
- `chest_cm` (numeric, nullable) - Chest circumference in cm
- `thigh_cm` (numeric, nullable) - Thigh circumference in cm
- `bicep_cm` (numeric, nullable) - Bicep circumference in cm
- `photo_url` (text, nullable) - Progress photo URL (Supabase Storage)
- `notes` (text, nullable) - User notes
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: User-specific, indexed on (user_id, date). One entry per user per date.

---

#### 7. `meal_plans` - Weekly Meal Planning

**Purpose**: User's planned meals for the week

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL) - References `auth.users(id)` ON DELETE CASCADE
- `week_start_date` (date, NOT NULL) - Monday of the week
- `day_of_week` (integer, NOT NULL) - 0=Monday, 6=Sunday
- `meal_type` (text, NOT NULL) - 'breakfast', 'lunch', 'dinner', 'snack'
- `food_item_id` (uuid, nullable) - References `food_items(id)`
- `recipe_id` (uuid, nullable) - References cookbook recipe (external)
- `quantity_g` (numeric, NOT NULL) - Planned quantity in grams
- `servings` (numeric, default 1.0) - Number of servings
- `notes` (text, nullable) - Meal planning notes
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: User-specific, indexed on (user_id, week_start_date, day_of_week). Can reference food items or cookbook recipes.

---

#### 8. `meal_plan_templates` - Reusable Meal Plan Templates

**Purpose**: Reusable meal plan templates that users can apply to their meal plans

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL) - References `auth.users(id)` ON DELETE CASCADE
- `name` (text, NOT NULL) - Template name
- `description` (text, nullable) - Template description
- `is_public` (boolean, default false) - Whether template is publicly shareable
- `meals` (jsonb, NOT NULL) - Array of meal objects with food_item_id, recipe_id, quantity_g, servings, meal_type, day_of_week
- `total_calories` (numeric, nullable) - Total calories for the template
- `total_protein_g` (numeric, nullable) - Total protein in grams
- `total_carbs_g` (numeric, nullable) - Total carbs in grams
- `total_fat_g` (numeric, nullable) - Total fat in grams
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: 
- User-specific templates, can be made public for sharing.
- `meals` JSONB structure: `[{day_of_week: 0, meal_type: 'breakfast', food_item_id: uuid, quantity_g: 100, servings: 1}, ...]`
- Templates can be applied to create meal_plans for a specific week.

---

#### 9. `goals` - User Fitness Goals

**Purpose**: Track user's fitness and nutrition goals

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL) - References `auth.users(id)` ON DELETE CASCADE
- `goal_type` (text, NOT NULL) - 'weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'nutrition'
- `title` (text, NOT NULL) - Goal title/description
- `target_value` (numeric, nullable) - Target value (weight, calories, etc.)
- `target_unit` (text, nullable) - Unit of measurement
- `start_date` (date, NOT NULL) - Goal start date
- `target_date` (date, nullable) - Target completion date
- `current_value` (numeric, nullable) - Current progress value
- `is_active` (boolean, default true) - Whether goal is currently active
- `is_completed` (boolean, default false) - Whether goal has been achieved
- `completed_at` (timestamptz, nullable) - When goal was completed
- `notes` (text, nullable) - Goal notes
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: User-specific, indexed on (user_id, is_active). Flexible schema for different goal types.

---

#### 10. `friends` - Social Connections

**Purpose**: User friend relationships for social features

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL) - References `auth.users(id)` ON DELETE CASCADE
- `friend_id` (uuid, NOT NULL) - References `auth.users(id)` ON DELETE CASCADE
- `status` (text, NOT NULL) - 'pending', 'accepted', 'blocked'
- `requested_by` (uuid, NOT NULL) - Who sent the friend request
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: User-specific, unique constraint on (user_id, friend_id). Bidirectional relationships.

---

#### 11. `challenges` - Community Challenges

**Purpose**: Fitness challenges that users can join

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `created_by` (uuid, NOT NULL) - References `auth.users(id)`
- `title` (text, NOT NULL) - Challenge title
- `description` (text, nullable) - Challenge description
- `challenge_type` (text, NOT NULL) - 'weight_loss', 'steps', 'workouts', 'nutrition', 'custom'
- `start_date` (date, NOT NULL) - Challenge start date
- `end_date` (date, NOT NULL) - Challenge end date
- `target_value` (numeric, nullable) - Target value for challenge
- `target_unit` (text, nullable) - Unit of measurement
- `is_public` (boolean, default false) - Whether challenge is public
- `max_participants` (integer, nullable) - Maximum number of participants
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: Public read if is_public=true. Uses challenge_participants table for many-to-many relationship.

---

#### 12. `challenge_participants` - Challenge Participation

**Purpose**: Tracks which users are participating in which challenges (many-to-many)

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `challenge_id` (uuid, NOT NULL) - References `challenges(id)` ON DELETE CASCADE
- `user_id` (uuid, NOT NULL) - References `auth.users(id)` ON DELETE CASCADE
- `current_value` (numeric, nullable) - User's current progress value
- `rank` (integer, nullable) - User's rank in challenge (calculated)
- `joined_at` (timestamptz, default now())
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: 
- Unique constraint on (challenge_id, user_id) to prevent duplicate participation.
- Indexed on (challenge_id) for leaderboard queries.
- Indexed on (user_id) for user's challenge list.

---

#### 13. `recipe_cache` - Cached Cookbook Recipe Nutrition

**Purpose**: Cache nutrition data from cookbook app recipes

**Columns**:
- `id` (uuid, PK, default gen_random_uuid())
- `recipe_id` (uuid, NOT NULL) - External recipe ID from cookbook app
- `recipe_slug` (text, NOT NULL) - Recipe slug for reference
- `servings` (integer, NOT NULL) - Number of servings
- `total_calories` (numeric, NOT NULL) - Total calories for recipe
- `calories_per_serving` (numeric, NOT NULL) - Calories per serving
- `protein_g` (numeric, NOT NULL) - Total protein in grams
- `carbs_g` (numeric, NOT NULL) - Total carbs in grams
- `fat_g` (numeric, NOT NULL) - Total fat in grams
- `fiber_g` (numeric, nullable) - Total fiber in grams
- `sugar_g` (numeric, nullable) - Total sugar in grams
- `sodium_mg` (numeric, nullable) - Total sodium in milligrams
- `ingredients_breakdown` (jsonb, nullable) - Detailed nutrition per ingredient
- `last_synced_at` (timestamptz, default now()) - When nutrition was last calculated
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Notes**: Public read access. Cached to avoid recalculating recipe nutrition on every request. Unique on recipe_id.

---

### Schema Design Notes

**Common Patterns**:
- All tables have `created_at` and `updated_at` timestamps
- User-specific tables reference `auth.users(id)` with ON DELETE CASCADE
- Use `numeric` for precise decimal values (weights, measurements)
- Use `integer` for whole numbers (calories, minutes, counts)
- Use `text[]` for arrays of strings (muscle groups, equipment)
- Use `jsonb` for flexible structured data (ingredients breakdown, meal plan templates)

**Admin & Verification**:
- `users.is_admin` flag controls admin privileges
- Admin users can verify user-created `food_items` and `exercises` (set `verified=true`)
- Admin users have write access to public `food_items` and `exercises` tables
- Regular users can only create items with `source='user'` and `created_by=user_id`

**Custom Items Strategy**:
- **Food Items**: All foods must exist in `food_items` before being logged in `diary_entries`
  - Users create custom foods in `food_items` with `source='user'` and `created_by=user_id`
  - This ensures data consistency, enables reuse, and allows future sharing/verification
- **Exercises**: All exercises must exist in `exercises` before being logged in `workout_logs`
  - Users create custom exercises in `exercises` with `source='user'` and `created_by=user_id`
  - Same benefits as custom foods: consistency, reuse, and verification potential

**Indexing Strategy**:
- Primary keys are automatically indexed
- Foreign keys should be indexed for join performance
- Composite indexes on (user_id, date) for time-series queries
- Full-text search indexes on food_items.name and exercises.name
- Unique constraints where needed (barcode, user_id + friend_id)

**Data Types**:
- `uuid` for all primary keys and foreign keys
- `date` for date-only fields (no time component)
- `timestamptz` for timestamps with timezone
- `numeric` for precise decimal calculations (avoid float)
- `text` for strings (PostgreSQL text is efficient)
- `boolean` for true/false flags
- `text[]` for arrays
- `jsonb` for flexible JSON data

### Database Setup Tasks

- [ ] **Supabase Local Development**
  - [ ] Initialize Supabase project (`supabase init`)
  - [ ] Configure `supabase/config.toml` (matching cookbook app pattern)
  - [ ] Set up local Supabase instance (`supabase start`)
  - [ ] Verify database connection and Studio access

- [ ] **Core Table Migrations**
  - [ ] `001_create_users_table.sql` - User profiles and preferences
  - [ ] `002_create_food_items_table.sql` - Public food database with nutrition data
  - [ ] `003_create_diary_entries_table.sql` - Daily food logging
  - [ ] `004_create_exercises_table.sql` - Exercise database
  - [ ] `005_create_workout_logs_table.sql` - Exercise tracking
  - [ ] `006_create_weight_entries_table.sql` - Weight and body measurements
- [ ] `007_create_meal_plans_table.sql` - Weekly meal planning
- [ ] `008_create_meal_plan_templates_table.sql` - Reusable meal plan templates
- [ ] `009_create_goals_table.sql` - User fitness goals
- [ ] `010_create_friends_table.sql` - Social connections
- [ ] `011_create_challenges_table.sql` - Community challenges
- [ ] `012_create_challenge_participants_table.sql` - Challenge participation tracking
- [ ] `013_create_recipe_cache_table.sql` - Cached cookbook recipe nutrition

- [ ] **Indexes & Performance**
  - [ ] Add indexes for frequently queried columns (user_id, date, food_id, etc.)
  - [ ] Add full-text search indexes for food items
  - [ ] Add composite indexes for common query patterns

- [ ] **Row Level Security (RLS)**
  - [ ] Enable RLS on all user-specific tables
  - [ ] Create policies for user data access (SELECT, INSERT, UPDATE, DELETE)
  - [ ] Create policies for public food database (read-only for all, write for admins)
  - [ ] Test RLS policies with different user roles

- [ ] **Database Functions & Triggers**
  - [ ] `updated_at` trigger for all tables (matching cookbook pattern)
  - [ ] Function to calculate daily nutrition totals
  - [ ] Function to calculate calorie burn from exercises
  - [ ] Function to sync recipe nutrition from cookbook API

- [ ] **Storage Buckets**
  - [ ] Create `progress-photos` bucket (private, user-specific)
  - [ ] Create `meal-images` bucket (private, user-specific)
  - [ ] Set up RLS policies for storage buckets

---

## Design System Setup (shadcn/ui)

**Goal**: Establish a consistent, accessible component library with a fitness-focused visual identity

### Visual Design Direction

#### Design Philosophy
- **Data-Driven & Clean**: Prioritize clarity and readability for nutrition/exercise data
- **Motivational & Energetic**: Use color and typography to inspire action
- **Modern & Professional**: Balance approachability with credibility
- **Accessible**: WCAG AA compliance for all users
- **Mobile-First**: Optimized for quick logging on mobile devices

#### Color Palette Strategy

**Primary Colors** (Fitness/Health Theme):
- **Option 1: Energetic Green** (Health & Growth)
  - Primary: Vibrant green (#22C55E, #16A34A) - represents health, growth, progress
  - Accent: Blue (#3B82F6) - represents trust, stability
  - Success: Green shades for positive metrics
  - Warning: Orange/Amber for approaching limits
  - Destructive: Red for over-limit indicators

- **Option 2: Active Blue** (Energy & Movement)
  - Primary: Energetic blue (#2563EB, #1D4ED8) - represents energy, movement
  - Accent: Teal/Cyan (#06B6D4) - represents freshness, vitality
  - Success: Green for achievements
  - Warning: Amber for attention
  - Destructive: Red for warnings

- **Option 3: Balanced Neutral** (Clean & Professional)
  - Primary: Deep slate/gray (#0F172A, #1E293B) - professional, data-focused
  - Accent: Vibrant accent color (green/blue) for CTAs and highlights
  - Similar to cookbook but with fitness accent colors

**Recommendation**: **Option 1 (Energetic Green)** - Most aligned with health/fitness, positive associations, good contrast

**Color Usage Guidelines**:
- **Primary Green**: Main actions, progress indicators, positive metrics
- **Accent Blue**: Secondary actions, links, informational elements
- **Success Green**: Goal achievements, completed tasks, positive trends
- **Warning Amber**: Approaching daily limits, attention needed
- **Destructive Red**: Over daily limits, negative trends, errors
- **Neutral Grays**: Backgrounds, borders, text hierarchy

#### Typography

**Font Choices**:
- **Primary**: Inter (clean, modern, excellent readability) - matching cookbook
- **Display/Headings**: Consider Geist or Inter variable for headings
- **Monospace**: For numbers/metrics (optional, for data tables)

**Typography Scale**:
- `text-xs` (12px) - Labels, captions, fine print
- `text-sm` (14px) - Secondary text, form labels
- `text-base` (16px) - Body text, default
- `text-lg` (18px) - Emphasized body, card titles
- `text-xl` (20px) - Section headings
- `text-2xl` (24px) - Page headings
- `text-3xl` (30px) - Hero headings
- `text-4xl` (36px) - Large displays (dashboard stats)

**Font Weights**:
- Regular (400) - Body text
- Medium (500) - Emphasized text, labels
- Semibold (600) - Headings, important text
- Bold (700) - Strong emphasis, stats

#### Spacing & Layout

**Spacing Scale** (Tailwind default):
- `0.5` (2px) - Tight spacing
- `1` (4px) - Compact spacing
- `2` (8px) - Default spacing
- `4` (16px) - Comfortable spacing
- `6` (24px) - Section spacing
- `8` (32px) - Large section spacing
- `12` (48px) - Page section spacing
- `16` (64px) - Major section spacing

**Border Radius**:
- `sm` (2px) - Small elements, badges
- `md` (4px) - Buttons, inputs
- `lg` (8px) - Cards, containers
- `xl` (12px) - Large cards, modals
- `2xl` (16px) - Hero sections, special containers

**Container Max Widths**:
- Mobile: Full width with padding
- Tablet: 768px max
- Desktop: 1280px max (matching cookbook)
- Wide: 1536px max

#### Component Patterns

**Cards**:
- Clean white/dark backgrounds with subtle shadows
- Rounded corners (lg or xl)
- Hover effects for interactivity
- Clear hierarchy with spacing

**Data Display**:
- Large, readable numbers for metrics
- Color-coded progress indicators
- Clear labels and units
- Responsive tables for nutrition logs

**Forms**:
- Clear labels above inputs
- Inline validation feedback
- Quick-add buttons for common actions
- Barcode scanner integration

**Navigation**:
- Bottom navigation on mobile (quick access)
- Sidebar on desktop
- Clear active states
- Icon + text labels

### shadcn/ui Configuration

- [ ] **Initial Setup**
  - [ ] Install shadcn/ui CLI (`bunx shadcn@latest init`)
  - [ ] Create `components.json` configuration file
  - [ ] Configure Tailwind CSS with shadcn variables (matching cookbook pattern)
  - [ ] Set up CSS variables for theming (light/dark mode support)
  - [ ] Create `src/lib/utils.ts` with `cn()` helper function

- [ ] **Core UI Components** (Essential for v0)
  - [ ] `button` - Primary actions and interactions
  - [ ] `input` - Form inputs and text fields
  - [ ] `label` - Form labels
  - [ ] `card` - Content containers
  - [ ] `badge` - Status indicators and tags
  - [ ] `alert` - Notifications and messages
  - [ ] `dialog` - Modal dialogs
  - [ ] `dropdown-menu` - Context menus
  - [ ] `form` - Form wrapper with validation
  - [ ] `textarea` - Multi-line text input
  - [ ] `checkbox` - Boolean inputs
  - [ ] `toast` - Toast notifications

- [ ] **Additional Components** (For future phases)
  - [ ] `table` - Data tables (nutrition logs, exercise history)
  - [ ] `tabs` - Tabbed interfaces
  - [ ] `select` - Dropdown selects
  - [ ] `calendar` - Date picker for diary entries
  - [ ] `progress` - Progress bars (goal tracking)
  - [ ] `slider` - Range inputs (serving sizes, weights)
  - [ ] `chart` - Data visualization (nutrition trends, weight graphs)

- [ ] **Theme Configuration**
  - [ ] Define color palette (consider fitness/health theme)
  - [ ] Set up dark mode support
  - [ ] Configure typography scale
  - [ ] Set spacing and border radius tokens
  - [ ] Create custom component variants if needed

- [ ] **Design Tokens**
  - [ ] Document color usage guidelines
  - [ ] Define spacing scale
  - [ ] Set typography hierarchy
  - [ ] Create icon system (using lucide-react, matching cookbook)

---

### App Layout & UI Patterns

#### Overall Layout Structure

**Mobile Layout**:
- **Header**: Logo, profile, notifications
- **Main Content**: Scrollable content area
- **Bottom Navigation**: Fixed bottom nav with 5 main sections
  - Dashboard/Home
  - Diary (Food logging)
  - Exercise
  - Progress (Weight/Measurements)
  - Profile/Settings

**Desktop Layout**:
- **Sidebar Navigation**: Collapsible sidebar with main sections
- **Top Bar**: Search, notifications, profile menu
- **Main Content**: Dashboard-style grid or list view
- **Right Panel** (optional): Quick stats, goals, recent activity

#### Key UI Patterns

**1. Dashboard/Home Screen**:
- **Daily Summary Card**: 
  - Large calorie count (consumed vs goal)
  - Macro breakdown (protein, carbs, fat) with progress bars
  - Quick stats (water, steps, exercise minutes)
- **Quick Actions**: 
  - "Add Food" button (prominent)
  - "Log Exercise" button
  - "Add Weight" button
- **Recent Activity Feed**: 
  - Recent food entries
  - Recent workouts
  - Goal progress updates

**2. Food Diary Screen**:
- **Date Selector**: Calendar picker at top
- **Meal Sections**: 
  - Breakfast, Lunch, Dinner, Snacks
  - Each section shows:
    - Total calories for meal
    - List of foods with quantities
    - Quick edit/delete actions
- **Add Food Flow**:
  - Search bar (prominent)
  - Barcode scanner button
  - Quick add from recent foods
  - Create custom food option

**3. Exercise Logging Screen**:
- **Exercise Search**: Quick search for exercises
- **Recent Exercises**: Quick add from history
- **Exercise Categories**: Filter by cardio, strength, etc.
- **Log Form**: 
  - Exercise selection
  - Duration (for cardio)
  - Sets/Reps/Weight (for strength)
  - Calculated calories burned

**4. Progress/Weight Tracking**:
- **Weight Chart**: Line graph showing weight over time
- **Measurement Cards**: 
  - Current weight (large display)
  - Body measurements (waist, hips, etc.)
  - Progress photos timeline
- **Add Entry Form**: Quick weight/measurement entry

**5. Data Visualization**:
- **Nutrition Trends**: 
  - Weekly/monthly calorie trends
  - Macro distribution charts
  - Daily averages
- **Exercise Analytics**:
  - Workout frequency
  - Calories burned trends
  - Exercise type distribution
- **Weight Progress**:
  - Weight loss/gain graph
  - Goal progress indicators
  - Projected completion dates

#### Component-Specific Patterns

**Progress Indicators**:
- Circular progress for daily goals (calories, macros)
- Linear progress bars for meal totals
- Color-coded: Green (on track), Amber (approaching limit), Red (over limit)

**Metric Cards**:
- Large number display (calories, weight, etc.)
- Label below
- Optional trend indicator (↑↓)
- Optional comparison (vs goal, vs yesterday)

**Food/Exercise Cards**:
- Image/icon on left
- Name and details in center
- Quick action button on right
- Hover/edit states

**Quick Add Buttons**:
- Floating action button (mobile) or prominent button (desktop)
- Icon + text
- Smooth animations on click

#### Responsive Breakpoints

- **Mobile**: < 640px - Single column, bottom nav
- **Tablet**: 640px - 1024px - Two columns possible, side nav
- **Desktop**: > 1024px - Multi-column layouts, sidebar nav
- **Wide**: > 1280px - Max content width, optimal spacing

#### Dark Mode Considerations

- **Light Mode**: 
  - Clean white backgrounds
  - High contrast text
  - Subtle shadows for depth
- **Dark Mode**:
  - Dark gray backgrounds (#0F172A, #1E293B)
  - Light text with good contrast
  - Accent colors remain vibrant
  - Reduced shadows, more subtle borders

#### Accessibility Features

- **Color Contrast**: WCAG AA compliant (4.5:1 for text)
- **Focus States**: Clear visible focus indicators
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels
- **Touch Targets**: Minimum 44x44px for mobile
- **Text Scaling**: Supports up to 200% zoom

---

## Authentication & Supabase Client Setup

- [ ] **Supabase Client Configuration**
  - [ ] Install `@supabase/supabase-js` and `@supabase/ssr`
  - [ ] Create `src/lib/supabase/client.ts` for client-side operations
  - [ ] Create `src/lib/supabase/server.ts` for server-side operations (TanStack Start server functions)
  - [ ] Set up environment variable management (1Password pattern)
  - [ ] Create `.env.development.local` template

- [ ] **Authentication Middleware**
  - [ ] Create auth middleware for TanStack Start routes
  - [ ] Set up protected route pattern (`_authenticated` layout)
  - [ ] Create public route pattern (`_public` layout)
  - [ ] Implement session management
  - [ ] Add auth state provider/context

- [ ] **Auth Pages** (Basic structure for v0)
  - [ ] Login page route
  - [ ] Sign up page route
  - [ ] Password reset page route
  - [ ] Auth error handling

---

## Project Structure & Configuration

- [ ] **Directory Structure**
  - [ ] `src/lib/` - Utilities, Supabase clients, helpers
  - [ ] `src/components/ui/` - shadcn/ui components
  - [ ] `src/components/` - Feature components
  - [ ] `src/routes/` - TanStack Start routes
  - [ ] `src/types/` - TypeScript type definitions
  - [ ] `src/schemas/` - Zod validation schemas
  - [ ] `supabase/migrations/` - Database migrations
  - [ ] `supabase/seed.sql` - Seed data (optional)

- [ ] **TypeScript Configuration**
  - [ ] Set up path aliases (`@/` for src)
  - [ ] Configure strict mode
  - [ ] Add type definitions for Supabase generated types

- [ ] **Environment Variables**
  - [ ] Document required environment variables
  - [ ] Set up 1Password integration pattern (matching cookbook)
  - [ ] Create `.env.example` file
  - [ ] Configure development vs production env handling

- [ ] **Development Scripts**
  - [ ] Update `package.json` scripts for Supabase local dev
  - [ ] Add script for running migrations
  - [ ] Add script for resetting database
  - [ ] Document development workflow

---

## Additional v0 Considerations

### What Else Should Be in v0?

1. **Basic Route Structure**
   - [ ] Root layout with navigation skeleton
   - [ ] Protected route wrapper (`_authenticated.tsx`)
   - [ ] Public route wrapper (`_public.tsx`)
   - [ ] Dashboard placeholder route
   - [ ] 404 error page

2. **Type Definitions**
   - [ ] Database types (generate from Supabase or define manually)
   - [ ] API response types
   - [ ] Form data types
   - [ ] Component prop types

3. **Validation Schemas (Zod)**
   - [ ] User profile schema
   - [ ] Food entry schema
   - [ ] Exercise log schema
   - [ ] Weight entry schema
   - [ ] Goal schema

4. **Utility Functions**
   - [ ] Date formatting helpers
   - [ ] Nutrition calculation helpers
   - [ ] Unit conversion helpers (lbs to kg, etc.)
   - [ ] Calorie calculation helpers

5. **Error Handling**
   - [ ] Global error boundary
   - [ ] Route-level error boundaries
   - [ ] API error handling patterns
   - [ ] User-friendly error messages

6. **Loading States**
   - [ ] Skeleton loaders for common patterns
   - [ ] Loading spinners
   - [ ] Route-level loading states

7. **Testing Setup** (Optional for v0)
   - [ ] Vitest configuration (already in project)
   - [ ] Test utilities
   - [ ] Example test for a component

8. **Documentation**
   - [ ] Update README with setup instructions
   - [ ] Document database schema
   - [ ] Document component usage
   - [ ] Development workflow guide

---

## v0 Deliverables

- ✅ Supabase local development environment running
- ✅ All core database tables created with migrations
- ✅ RLS policies implemented and tested
- ✅ shadcn/ui design system configured
- ✅ Essential UI components installed
- ✅ Supabase client configured (client + server)
- ✅ Authentication middleware and route protection
- ✅ Basic project structure established
- ✅ Environment variables configured
- ✅ Development scripts documented

## v0 Definition of Done

- Can run `supabase start` and access local database
- Can run `pnpm dev` and see application with basic layout
- Database migrations run successfully
- RLS policies prevent unauthorized data access
- shadcn/ui components render correctly
- Authentication flow works (login/signup)
- Protected routes redirect unauthenticated users
- TypeScript types are properly configured
- No linter errors in setup code
