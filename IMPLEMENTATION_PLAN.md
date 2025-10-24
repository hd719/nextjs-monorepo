# 🍳 Cookbook Admin Dashboard Implementation Plan

## Overview
Transform the existing cookbook app from mock data to a full-featured recipe management system with Supabase backend, admin dashboard, and public recipe pages.

**Current State**: Basic auth + mock data + incomplete forms
**Target State**: Full CRUD admin dashboard + public recipe site + database backend

---

## 🗄️ **PHASE 1: Database Foundation**

### **DB-001: Create Supabase Recipes Table**
**Story**: As a developer, I need a recipes table to store recipe data in Supabase
**Acceptance Criteria**:
- [ ] Create `recipes` table with exact schema from requirements
- [ ] Add indexes for performance (published_at, slug, owner_id)
- [ ] Add updated_at trigger
- [ ] Verify table creation in Supabase dashboard

**SQL Schema**:
```sql
create table recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  title text not null,
  slug text unique not null,
  description text,
  ingredients jsonb default '[]'::jsonb,
  steps jsonb default '[]'::jsonb,
  images jsonb default '[]'::jsonb,
  category text,
  cuisine text,
  servings int,
  prep_minutes int,
  cook_minutes int,
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Files Changed**: `supabase/migrations/001_create_recipes_table.sql`

---

### **DB-002: Add Database Indexes**
**Story**: As a system, I need optimized queries for recipe lookups
**Acceptance Criteria**:
- [ ] Add index on `(is_published, published_at desc)` for public listings
- [ ] Add index on `slug` for SEO-friendly URLs
- [ ] Add index on `owner_id` for user-specific queries
- [ ] Verify query performance in Supabase

**Files Changed**: `supabase/migrations/002_add_indexes.sql`

---

### **DB-003: Setup Row Level Security (RLS)**
**Story**: As a security requirement, recipes must be protected by RLS policies
**Acceptance Criteria**:
- [ ] Enable RLS on recipes table
- [ ] Policy: Anyone can read published recipes
- [ ] Policy: Users can read their own drafts
- [ ] Policy: Users can insert/update/delete their own recipes
- [ ] Test policies with different user scenarios

**Files Changed**: `supabase/migrations/003_setup_rls.sql`

---

### **DB-004: Add Updated_At Trigger**
**Story**: As a developer, I need automatic timestamp updates
**Acceptance Criteria**:
- [ ] Create `update_updated_at_column()` function
- [ ] Add trigger to recipes table
- [ ] Test trigger works on updates

**Files Changed**: `supabase/migrations/004_add_updated_at_trigger.sql`

---

## 📊 **PHASE 2: Data Layer & Types**

### **DL-001: Create Recipe TypeScript Types**
**Story**: As a developer, I need type-safe recipe interfaces
**Acceptance Criteria**:
- [ ] Create `Recipe` interface matching database schema
- [ ] Create `CreateRecipeInput` and `UpdateRecipeInput` types
- [ ] Export from centralized types file
- [ ] Replace existing mock Recipe type

**React 19 Feature**: Use `satisfies` operator for better type inference

**Files Changed**:
- `src/types/recipe.ts` (new)
- `data/MockData.ts` (update imports)

---

### **DL-002: Create Zod Validation Schemas**
**Story**: As a developer, I need runtime validation for recipe data
**Acceptance Criteria**:
- [ ] Create `CreateRecipeSchema` with all required validations
- [ ] Create `UpdateRecipeSchema` (partial validation)
- [ ] Add slug validation (URL-safe characters)
- [ ] Add array validations for ingredients/steps
- [ ] Export schemas for reuse

**Files Changed**: `src/schemas/recipe.ts` (new)

---

### **DL-003: Create Database Query Functions**
**Story**: As a developer, I need reusable database query functions
**Acceptance Criteria**:
- [ ] Create `getPublishedRecipes()` with pagination
- [ ] Create `getRecipeBySlug()` for public pages
- [ ] Create `getUserRecipes()` for admin dashboard
- [ ] Create `getRecipeById()` for editing
- [ ] Add proper error handling and types

**Files Changed**: `src/lib/recipes.ts` (new)

---

### **DL-004: Create Slug Generation Utility**
**Story**: As a system, I need unique, SEO-friendly recipe slugs
**Acceptance Criteria**:
- [ ] Create `generateSlug(title: string)` function
- [ ] Handle special characters and spaces
- [ ] Ensure uniqueness by checking database
- [ ] Add incremental suffixes (-2, -3) for duplicates
- [ ] Add unit tests

**Files Changed**:
- `src/lib/slug.ts` (new)
- `src/lib/__tests__/slug.test.ts` (new)

---

## 🔌 **PHASE 3: API Routes**

### **API-001: Create Recipe List/Create API Route**
**Story**: As a frontend, I need API endpoints for recipe CRUD operations
**Acceptance Criteria**:
- [ ] `GET /api/recipes` - list user's recipes (admin) or published (public)
- [ ] `POST /api/recipes` - create new recipe
- [ ] Add authentication checks
- [ ] Add proper error responses (400, 401, 500)
- [ ] Add request/response validation

**React 19 Feature**: Use new `use()` hook for async operations if needed

**Files Changed**: `src/app/api/recipes/route.ts` (new)

---

### **API-002: Create Recipe Detail API Route**
**Story**: As a frontend, I need individual recipe CRUD operations
**Acceptance Criteria**:
- [ ] `GET /api/recipes/[id]` - get single recipe
- [ ] `PATCH /api/recipes/[id]` - update recipe
- [ ] `DELETE /api/recipes/[id]` - delete recipe
- [ ] Verify ownership for protected operations
- [ ] Handle publish/unpublish logic

**Files Changed**: `src/app/api/recipes/[id]/route.ts` (new)

---

### **API-003: Create Recipe Publish API Route**
**Story**: As an admin, I need to publish/unpublish recipes
**Acceptance Criteria**:
- [ ] `POST /api/recipes/[id]/publish` - publish recipe
- [ ] `POST /api/recipes/[id]/unpublish` - unpublish recipe
- [ ] Set `published_at` timestamp
- [ ] Validate recipe is complete before publishing
- [ ] Return updated recipe data

**Files Changed**: `src/app/api/recipes/[id]/publish/route.ts` (new)

---

## 🛡️ **PHASE 4: Middleware & Auth Updates**

### **MW-001: Update Middleware for Admin Routes**
**Story**: As a security requirement, /admin routes must be protected
**Acceptance Criteria**:
- [ ] Change protection from `/protected` to `/admin`
- [ ] Allow public access to `/` (remove redirect)
- [ ] Keep existing auth callback handling
- [ ] Add proper TypeScript types
- [ ] Test with authenticated/unauthenticated users

**Files Changed**: `src/app/utils/supabase/middleware.ts`

---

### **MW-002: Create Admin Route Layout**
**Story**: As an admin user, I need a consistent admin interface
**Acceptance Criteria**:
- [ ] Create `/admin/layout.tsx` with navigation
- [ ] Add admin-specific styling/branding
- [ ] Include logout functionality
- [ ] Add breadcrumb navigation
- [ ] Ensure responsive design

**React 19 Feature**: Use new layout composition patterns

**Files Changed**: `src/app/admin/layout.tsx` (new)

---

## 🎨 **PHASE 5: Admin Dashboard UI**

### **UI-001: Create Admin Dashboard Landing**
**Story**: As an admin, I need an overview dashboard
**Acceptance Criteria**:
- [ ] Show recipe count statistics
- [ ] Display recent recipes
- [ ] Add "Create New Recipe" CTA button
- [ ] Show published vs draft counts
- [ ] Add quick actions menu

**Files Changed**: `src/app/admin/page.tsx` (new)

---

### **UI-002: Create Recipe List Page**
**Story**: As an admin, I need to see all my recipes in a table
**Acceptance Criteria**:
- [ ] Display recipes in sortable table
- [ ] Show title, status, updated_at, actions
- [ ] Add search/filter functionality
- [ ] Include pagination
- [ ] Add bulk actions (delete, publish)
- [ ] Show published status badges

**React 19 Feature**: Use `useOptimistic` for immediate UI updates

**Files Changed**: `src/app/admin/recipes/page.tsx` (new)

---

### **UI-003: Create Recipe Form Component**
**Story**: As an admin, I need a reusable form for creating/editing recipes
**Acceptance Criteria**:
- [ ] Build comprehensive recipe form with all fields
- [ ] Use React Hook Form + Zod validation
- [ ] Add dynamic ingredient/step arrays
- [ ] Include image URL input (stub for now)
- [ ] Add save as draft vs publish options
- [ ] Show validation errors clearly

**React 19 Feature**: Use `useActionState` for form handling

**Files Changed**: `src/components/RecipeForm.tsx` (new)

---

### **UI-004: Create New Recipe Page**
**Story**: As an admin, I need to create new recipes
**Acceptance Criteria**:
- [ ] Use RecipeForm component
- [ ] Handle form submission with server actions
- [ ] Show loading states during save
- [ ] Redirect to edit page after creation
- [ ] Handle validation errors

**Files Changed**: `src/app/admin/recipes/new/page.tsx` (new)

---

### **UI-005: Create Edit Recipe Page**
**Story**: As an admin, I need to edit existing recipes
**Acceptance Criteria**:
- [ ] Load recipe data by ID
- [ ] Pre-populate RecipeForm with existing data
- [ ] Handle updates with optimistic UI
- [ ] Add delete confirmation dialog
- [ ] Show publish/unpublish toggle

**React 19 Feature**: Use `use()` hook for data fetching

**Files Changed**: `src/app/admin/recipes/[id]/edit/page.tsx` (new)

---

## 🌐 **PHASE 6: Public Recipe Pages**

### **PUB-001: Update Home Page for Public Recipes**
**Story**: As a visitor, I want to see published recipes on the home page
**Acceptance Criteria**:
- [ ] Remove auth redirect from home page
- [ ] Load published recipes from database
- [ ] Replace mock data in Feed components
- [ ] Add "No recipes yet" empty state
- [ ] Maintain existing hero section design

**Files Changed**:
- `src/app/page.tsx`
- `src/components/Feed/FeedServer.tsx`

---

### **PUB-002: Create Recipe Detail Page**
**Story**: As a visitor, I want to view individual recipe details
**Acceptance Criteria**:
- [ ] Create `/recipes/[slug]/page.tsx` dynamic route
- [ ] Display full recipe with ingredients, steps, images
- [ ] Add structured data for SEO
- [ ] Include cooking times, servings, category
- [ ] Add print-friendly styling
- [ ] Handle 404 for non-existent recipes

**Files Changed**: `src/app/recipes/[slug]/page.tsx` (new)

---

### **PUB-003: Add Recipe Cards to Feed**
**Story**: As a visitor, I want to see recipe previews that link to details
**Acceptance Criteria**:
- [ ] Update FeedClient to show real recipe data
- [ ] Add recipe card component with image, title, description
- [ ] Link cards to `/recipes/[slug]` pages
- [ ] Add hover effects and responsive design
- [ ] Show cooking time and difficulty if available

**Files Changed**:
- `src/components/Feed/FeedClient.tsx`
- `src/components/RecipeCard.tsx` (new)

---

## 🔄 **PHASE 7: Server Actions & Optimistic UI**

### **SA-001: Implement Create Recipe Server Action**
**Story**: As an admin, I need server actions for recipe creation
**Acceptance Criteria**:
- [ ] Replace stubbed `addRecipeAction` with real implementation
- [ ] Generate unique slug from title
- [ ] Save to Supabase with proper error handling
- [ ] Return success/error states
- [ ] Add proper TypeScript types

**React 19 Feature**: Enhanced server actions with better error handling

**Files Changed**: `src/app/actions.ts`

---

### **SA-002: Implement Update Recipe Server Action**
**Story**: As an admin, I need to update existing recipes
**Acceptance Criteria**:
- [ ] Create `updateRecipeAction` server action
- [ ] Handle partial updates (only changed fields)
- [ ] Update slug if title changes
- [ ] Verify ownership before updating
- [ ] Return updated recipe data

**Files Changed**: `src/app/actions.ts`

---

### **SA-003: Implement Delete Recipe Server Action**
**Story**: As an admin, I need to delete recipes
**Acceptance Criteria**:
- [ ] Create `deleteRecipeAction` server action
- [ ] Verify ownership before deletion
- [ ] Handle cascade deletes if needed
- [ ] Return success confirmation
- [ ] Add soft delete option (optional)

**Files Changed**: `src/app/actions.ts`

---

### **SA-004: Implement Publish/Unpublish Actions**
**Story**: As an admin, I need to control recipe visibility
**Acceptance Criteria**:
- [ ] Create `publishRecipeAction` server action
- [ ] Create `unpublishRecipeAction` server action
- [ ] Set/unset `published_at` timestamp
- [ ] Validate recipe completeness before publishing
- [ ] Update UI optimistically

**React 19 Feature**: Use `useOptimistic` for immediate status updates

**Files Changed**: `src/app/actions.ts`

---

## 🧹 **PHASE 8: Cleanup & Refactoring**

### **CL-001: Remove Mock Data and Duplicate Forms**
**Story**: As a developer, I need to clean up obsolete code
**Acceptance Criteria**:
- [ ] Delete `data/MockData.ts`
- [ ] Remove duplicate `/upload-recipe` page
- [ ] Consolidate `/add-recipe` into admin area
- [ ] Update all imports and references
- [ ] Remove unused components

**Files Changed**:
- `data/MockData.ts` (delete)
- `src/app/protected/upload-recipe/page.tsx` (delete)
- `src/app/protected/add-recipe/page.tsx` (delete)

---

### **CL-002: Update Navigation Components**
**Story**: As a user, I need updated navigation for new structure
**Acceptance Criteria**:
- [ ] Update NavServer/NavClient for admin links
- [ ] Add conditional admin menu items
- [ ] Update sign-in redirect to `/admin` instead of `/protected`
- [ ] Add recipe management links
- [ ] Test navigation with different user states

**Files Changed**:
- `src/components/Nav/NavServer.tsx`
- `src/components/Nav/NavClient.tsx`

---

### **CL-003: Rename Auth Pages for Consistency**
**Story**: As a developer, I want consistent naming conventions
**Acceptance Criteria**:
- [ ] Rename `/sign-in` to `/login` (optional)
- [ ] Update all redirects and links
- [ ] Update middleware references
- [ ] Ensure backward compatibility
- [ ] Update documentation

**Files Changed**:
- `src/app/(auth-pages)/` directory structure
- `src/app/utils/supabase/middleware.ts`

---

## 🧪 **PHASE 9: Testing Infrastructure**

### **TEST-001: Setup Jest Testing Framework**
**Story**: As a developer, I need unit testing capabilities
**Acceptance Criteria**:
- [ ] Install Jest and testing dependencies
- [ ] Configure Jest for Next.js App Router
- [ ] Add test scripts to package.json
- [ ] Create test utilities for Supabase mocking
- [ ] Add example test file

**Files Changed**:
- `package.json`
- `jest.config.js` (new)
- `src/lib/__tests__/` (new directory)

---

### **TEST-002: Add Unit Tests for Utilities**
**Story**: As a developer, I need tests for critical utility functions
**Acceptance Criteria**:
- [ ] Test slug generation function
- [ ] Test Zod schema validations
- [ ] Test database query functions (mocked)
- [ ] Test form validation logic
- [ ] Achieve >80% coverage on utilities

**Files Changed**:
- `src/lib/__tests__/slug.test.ts`
- `src/schemas/__tests__/recipe.test.ts`

---

### **TEST-003: Setup Playwright E2E Testing**
**Story**: As a developer, I need end-to-end testing
**Acceptance Criteria**:
- [ ] Install Playwright
- [ ] Configure for Next.js app
- [ ] Create test database setup
- [ ] Add login flow test
- [ ] Add recipe creation flow test
- [ ] Add public recipe viewing test

**Files Changed**:
- `package.json`
- `playwright.config.ts` (new)
- `tests/e2e/` (new directory)

---

## 🚀 **PHASE 10: Performance & SEO**

### **PERF-001: Add Recipe Page SEO**
**Story**: As a content creator, I need SEO-optimized recipe pages
**Acceptance Criteria**:
- [ ] Add structured data (JSON-LD) for recipes
- [ ] Generate proper meta tags (title, description, image)
- [ ] Add Open Graph tags for social sharing
- [ ] Include canonical URLs
- [ ] Add sitemap generation

**Files Changed**:
- `src/app/recipes/[slug]/page.tsx`
- `src/lib/seo.ts` (new)

---

### **PERF-002: Add Caching Strategy**
**Story**: As a system, I need optimized performance
**Acceptance Criteria**:
- [ ] Add `revalidate = 60` to public recipe pages
- [ ] Implement cache invalidation on recipe updates
- [ ] Add loading states with Suspense
- [ ] Optimize image loading with Next.js Image
- [ ] Add skeleton loaders

**React 19 Feature**: Enhanced Suspense boundaries

**Files Changed**:
- `src/app/recipes/[slug]/page.tsx`
- `src/app/page.tsx`
- `src/components/RecipeSkeletonLoader.tsx`

---

### **PERF-003: Add Error Boundaries**
**Story**: As a user, I need graceful error handling
**Acceptance Criteria**:
- [ ] Add error boundary for admin pages
- [ ] Add error boundary for public pages
- [ ] Create user-friendly error pages
- [ ] Add error reporting (optional)
- [ ] Test error scenarios

**React 19 Feature**: Improved error boundaries

**Files Changed**:
- `src/app/admin/error.tsx` (new)
- `src/app/recipes/error.tsx` (new)
- `src/components/ErrorBoundary.tsx` (new)

---

## 📋 **Definition of Done**

Each ticket is considered complete when:
- [ ] Code is implemented and tested locally
- [ ] TypeScript compilation passes with no errors
- [ ] Linting passes (ESLint + Prettier)
- [ ] Unit tests written and passing (where applicable)
- [ ] Manual testing completed
- [ ] Code reviewed (if working in team)
- [ ] Committed with descriptive commit message
- [ ] Deployed to development environment

## 🎯 **Success Criteria**

The project is complete when:
- [ ] Admin can create, edit, delete, and publish recipes
- [ ] Public users can view published recipes
- [ ] All recipes stored in Supabase with proper RLS
- [ ] SEO-friendly URLs and metadata
- [ ] Responsive design on all devices
- [ ] >90% test coverage on critical paths
- [ ] Performance score >90 on Lighthouse
- [ ] Zero TypeScript errors
- [ ] All security requirements met

## 📊 **Estimated Timeline**

- **Phase 1-2 (Database + Types)**: 2-3 days
- **Phase 3-4 (API + Auth)**: 2-3 days
- **Phase 5-6 (UI + Public Pages)**: 4-5 days
- **Phase 7-8 (Actions + Cleanup)**: 2-3 days
- **Phase 9-10 (Testing + Performance)**: 3-4 days

**Total Estimated Time**: 13-18 days

---

*This plan leverages React 19 features like `useOptimistic`, `useActionState`, enhanced Suspense, and improved server actions where applicable. Each task is designed to be a single, focused commit that moves the project forward incrementally.*
