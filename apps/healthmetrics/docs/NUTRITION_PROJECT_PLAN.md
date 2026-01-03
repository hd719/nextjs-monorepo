# HealthMetrics – Comprehensive Fitness & Nutrition Platform

> **Building a complete MyFitnessPal-style fitness platform with TanStack Start and React 19**

This document outlines the complete development plan for creating a comprehensive fitness and nutrition tracking platform that integrates with your existing cookbook application.

---

## Project Overview

### Vision Statement

Create a comprehensive fitness and nutrition platform that rivals MyFitnessPal, combining calorie tracking, exercise logging, weight management, meal planning, and social features. The platform will seamlessly integrate with the existing cookbook app, allowing users to track their complete health journey - from discovering recipes to logging meals, tracking workouts, monitoring progress, and achieving their fitness goals.

### Core Objectives

- **Complete Nutrition Tracking**: Calorie counting, macro/micro tracking, barcode scanning, and meal logging
- **Exercise & Fitness**: Workout tracking, exercise database, activity logging, and calorie burn calculations
- **Weight & Body Metrics**: Weight tracking, body measurements, progress photos, and goal setting
- **Meal Planning**: Weekly meal plans, recipe integration, shopping lists, and meal prep scheduling
- **Social & Community**: Friend connections, progress sharing, challenges, and motivation features
- **Cookbook Integration**: Seamless API integration for recipe nutrition analysis and meal logging
- **Data Intelligence**: Smart recommendations, trend analysis, and personalized insights
- **Performance**: Fast, reliable tracking with offline support and real-time sync

---

## Technical Architecture

### Tech Stack

- **Framework**: TanStack Start (latest RC)
- **Runtime**: React 19.2.0 with Server Components
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.0.6
- **Type Safety**: TypeScript 5.7.2
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (matching cookbook app)
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage for progress photos and meal images
- **APIs**:
  - USDA FoodData Central (nutrition data)
  - Edamam (fallback nutrition)
  - Open Food Facts (barcode scanning)
  - Exercise/activity databases
- **Deployment**: Docker containers in monorepo (similar to cookbook app)
- **Secret Management**: 1Password (consistent with cookbook app)

### Database Architecture (Supabase)

**Core Tables**:
- `users` - User profiles and preferences
- `food_items` - Food database with nutrition data
- `diary_entries` - Daily food logs
- `exercises` - Exercise database
- `workout_logs` - Exercise tracking
- `weight_entries` - Weight and body measurements
- `meal_plans` - Weekly meal planning
- `goals` - User fitness goals
- `friends` - Social connections
- `challenges` - Community challenges
- `recipe_cache` - Cached cookbook recipe nutrition data

**RLS Policies**: User-specific data access with shared public food database

**Migrations**: Version-controlled SQL migrations in `supabase/migrations/`

### Key Features

1. **Nutrition Tracking System**
   - Food diary with meal categorization
   - Barcode scanning for packaged foods
   - Custom food creation
   - Recipe nutrition analysis
   - Macro/micro nutrient tracking

2. **Exercise & Activity Tracking**
   - Exercise database (cardio, strength, sports)
   - Workout logging and history
   - Calorie burn calculations
   - Activity level adjustments
   - Custom exercise creation

3. **Weight & Body Metrics**
   - Weight tracking with trend graphs
   - Body measurements (waist, hips, etc.)
   - Progress photos with timeline
   - BMI and body composition tracking
   - Goal setting and milestones

4. **Meal Planning & Prep**
   - Weekly meal planner
   - Recipe integration from cookbook
   - Shopping list generation
   - Meal prep scheduling
   - Leftover tracking

5. **Social & Community Features**
   - Friend connections and feeds
   - Progress sharing and celebrations
   - Fitness challenges
   - Community forums
   - Motivation and support

6. **Analytics & Insights**
   - Nutrition trend analysis
   - Weight loss/gain projections
   - Goal achievement tracking
   - Personalized recommendations
   - Health reports and summaries

7. **Cookbook App Integration**
   - Recipe nutrition API endpoints
   - One-click meal logging from cookbook
   - Recipe sync and favorites
   - Bulk recipe analysis

---

## Environment Configuration

### Development

```bash
# Run with 1Password (like cookbook app)
op run --env-file="./.env.development.local" -- pnpm dev --filter=healthmetrics

# Supabase local development
pnpm supabase start
pnpm supabase db reset
```

### Environment Variables

```env
# Supabase
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# API Keys
USDA_API_KEY=your-usda-key
EDAMAM_APP_ID=your-edamam-id
EDAMAM_APP_KEY=your-edamam-key

# Cookbook Integration
COOKBOOK_API_URL=http://localhost:3000
COOKBOOK_API_KEY=shared-secret
```

---

## Learning Objectives & TanStack Start Features

### TanStack Start Mastery Checklist

#### **Core Routing & Navigation** (Phase 1)
- [ ] File-based routing with dynamic parameters (`/diary/$date`, `/recipes/$id`)
- [ ] Nested layouts for authenticated vs public sections
- [ ] Route protection with middleware
- [ ] Dynamic route parameters and search params
- [ ] Programmatic navigation and route preloading

#### **Server Functions & Data Loading** (Phase 1-2)
- [ ] Server functions for type-safe operations
- [ ] Middleware for authentication and validation
- [ ] Server-side data fetching with caching
- [ ] Streaming data for large datasets (exercise history)
- [ ] Cross-route data sharing patterns

#### **Advanced Caching Strategies** (Phase 2-3)
- [ ] Route-level caching with staleTime/gcTime
- [ ] Query invalidation patterns
- [ ] Optimistic updates for instant feedback
- [ ] Cache persistence and hydration
- [ ] Performance monitoring and optimization

#### **Form Handling & Server Actions** (Phase 1-3)
- [ ] Server actions for form submissions
- [ ] Form validation with server-side feedback
- [ ] File uploads to Supabase Storage
- [ ] Multi-step form workflows
- [ ] Real-time form validation

#### **Real-time Features** (Phase 4)
- [ ] Server-sent events for live updates
- [ ] Real-time friend activity feeds
- [ ] Live challenge leaderboards
- [ ] Supabase Realtime integration
- [ ] WebSocket fallback patterns

#### **Error Handling & Loading States** (All Phases)
- [ ] Route-level error boundaries
- [ ] Global error handling
- [ ] Loading states and skeletons
- [ ] Retry mechanisms
- [ ] Graceful degradation

#### **Performance & Optimization** (Phase 5)
- [ ] Code splitting by route
- [ ] Lazy loading components
- [ ] Bundle size optimization
- [ ] SSR and streaming optimization
- [ ] Service worker implementation

### Enhanced TanStack Start Learning Features

#### **1. Advanced Routing Patterns**

```typescript
// Nested layouts for different app sections
routes/
  __root.tsx                    // Root layout with theme, auth
  _authenticated.tsx            // Protected routes wrapper
  _authenticated/
    dashboard/
      index.tsx                 // Dashboard overview
      nutrition.tsx             // Nutrition summary
      exercise.tsx              // Exercise summary
    diary/
      $date.tsx                 // Daily food diary
      $date.edit.tsx           // Edit diary entry
      $date.meal.$mealId.tsx   // Individual meal editing
  _public/
    login.tsx                   // Public login page
    register.tsx                // Public registration
    forgot-password.tsx         // Password reset
```

**Learning Focus**: Master TanStack Start's file-based routing system with complex nested layouts

#### **2. Server Functions with Middleware**

```typescript
// Authentication middleware
export const authMiddleware = createMiddleware().server(async ({ request, next }) => {
  const user = await getUser(request)
  if (!user) throw redirect('/auth/login')
  return next({ context: { user } })
})

// Rate limiting for API calls
export const rateLimitMiddleware = createMiddleware().server(async ({ request, next }) => {
  await checkRateLimit(request.headers.get('x-forwarded-for'))
  return next()
})

// Nutrition data fetching with caching
export const getNutritionData = createServerFn('GET', async (date: string, ctx) => {
  const { user } = ctx
  return await fetchUserNutritionForDate(user.id, date)
}).middleware([authMiddleware])

// Food entry with validation
export const addFoodEntry = createServerFn('POST', async (formData: FormData, ctx) => {
  const data = await parseAndValidateFoodEntry(formData)
  return await saveFoodEntry(ctx.user.id, data)
}).middleware([authMiddleware, rateLimitMiddleware])
```

**Learning Focus**: Understand middleware composition and server-side data operations

#### **3. Advanced Caching & Data Management**

```typescript
// Route-level caching configuration
export const Route = createFileRoute('/diary/$date')({
  loader: ({ params }) => getNutritionData(params.date),
  staleTime: 1000 * 60 * 5,     // 5 minutes fresh
  gcTime: 1000 * 60 * 30,       // 30 minutes in cache
  errorComponent: NutritionError,
  pendingComponent: NutritionSkeleton,
})

// Cross-route query options
export const nutritionQueryOptions = (date: string) => ({
  queryKey: ['nutrition', date],
  queryFn: () => getNutritionData(date),
  staleTime: 1000 * 60 * 5,
})

// Optimistic updates for meal logging
export function QuickAddMeal() {
  const [optimisticEntries, addOptimisticEntry] = useOptimistic(
    entries,
    (state, newEntry) => [...state, { ...newEntry, pending: true }]
  )
  
  const addMeal = useServerFn(addFoodEntry)
  
  const handleQuickAdd = async (meal) => {
    addOptimisticEntry(meal)
    await addMeal(meal)
  }
}
```

**Learning Focus**: Master TanStack Start's caching system and optimistic updates

#### **4. Streaming & Real-time Features**

```typescript
// Streaming large exercise datasets
export const getExerciseHistory = createServerFn('GET', async function* (userId: string) {
  const batches = await getExerciseBatches(userId)
  
  for (const batch of batches) {
    yield batch
    await new Promise(resolve => setTimeout(resolve, 100)) // Prevent overwhelming
  }
})

// Real-time friend activity feed
export const friendActivityStream = createServerFn('GET', async function* (userId: string) {
  const channel = supabase
    .channel(`user-${userId}-feed`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'friend_activities'
    })
  
  for await (const activity of channel) {
    yield activity
  }
})

// Client-side streaming consumption
export function ExerciseHistory() {
  const exerciseStream = useServerFn(getExerciseHistory)
  const [exercises, setExercises] = useState([])
  
  useEffect(() => {
    const stream = exerciseStream(user.id)
    
    for await (const batch of stream) {
      setExercises(prev => [...prev, ...batch])
    }
  }, [])
}
```

**Learning Focus**: Implement streaming data and real-time features with TanStack Start

#### **5. Advanced Form Patterns**

```typescript
// Multi-step recipe creation with server validation
export const validateRecipeStep = createServerFn('POST', async (stepData: FormData) => {
  const parsed = await parseRecipeStep(stepData)
  const validation = await validateNutritionData(parsed)
  return { data: parsed, errors: validation.errors }
})

// Recipe builder with real-time nutrition calculation
export function RecipeBuilder() {
  const [recipe, setRecipe] = useState(initialRecipe)
  const validateStep = useServerFn(validateRecipeStep)
  
  const handleIngredientChange = useDeferredValue(async (ingredients) => {
    const result = await validateStep(ingredients)
    setRecipe(prev => ({ ...prev, nutrition: result.nutrition }))
  })
}

// Barcode scanner with progressive enhancement
export const scanBarcode = createServerFn('GET', async function* (barcode: string) {
  // Try multiple nutrition APIs in sequence
  const apis = [usdaAPI, edamamAPI, openFoodFactsAPI]
  
  for (const api of apis) {
    try {
      const result = await api.lookup(barcode)
      if (result) {
        yield { source: api.name, data: result, confidence: result.confidence }
      }
    } catch (error) {
      yield { source: api.name, error: error.message }
    }
  }
})
```

**Learning Focus**: Complex form handling with server-side validation and progressive enhancement

#### **6. Performance & Error Handling**

```typescript
// Route-level error boundaries with recovery
export const Route = createFileRoute('/diary/$date')({
  loader: getNutritionData,
  errorComponent: ({ error, retry }) => (
    <NutritionErrorBoundary error={error} onRetry={retry} />
  ),
  pendingComponent: () => <NutritionSkeleton />,
  // Preload related routes
  onEnter: ({ router }) => {
    router.preloadRoute({ to: '/diary/$date/edit', params: { date } })
  }
})

// Global error handling with reporting
export function RootErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Report error to monitoring service
    reportError(error)
  }, [error])
  
  return (
    <div className="error-boundary">
      <h1>Something went wrong!</h1>
      <details>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
      </details>
      <button onClick={reset}>Try again</button>
    </div>
  )
}

// Code splitting for heavy components
export const Route = createLazyFileRoute('/analytics')({
  component: lazy(() => import('../components/AnalyticsDashboard'))
})

// Preloading critical navigation
export function NavigationLink({ to, children }: LinkProps) {
  const router = useRouter()
  
  return (
    <Link 
      to={to}
      onMouseEnter={() => router.preloadRoute({ to })}
      onFocus={() => router.preloadRoute({ to })}
    >
      {children}
    </Link>
  )
}
```

**Learning Focus**: Production-ready error handling and performance optimization

### Nutrition-Specific TanStack Start Patterns

#### **Real-time Meal Planning**
- Collaborative meal planning with live updates
- Drag-and-drop meal scheduling with optimistic updates
- Shopping list generation with real-time ingredient aggregation

#### **Progressive Barcode Scanning**
- Camera-based scanning with fallback to manual entry
- Multiple API integration with streaming results
- Offline barcode caching with sync when online

#### **Smart Nutrition Analytics**
- Streaming large nutrition datasets
- Real-time trend calculations
- Personalized recommendation engine

#### **Social Fitness Features**
- Real-time friend activity feeds
- Live challenge leaderboards
- Progress sharing with instant updates

### React 19 Features Practice

- [ ] Server Components for data fetching
- [ ] useActionState for form handling
- [ ] Concurrent features for smooth UX
- [ ] Suspense boundaries for loading states
- [ ] Error boundaries for graceful errors
- [ ] Optimistic updates for instant feedback
- [ ] useDeferredValue for expensive calculations
- [ ] useTransition for non-blocking updates

---

## Resources & References

### Documentation

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Supabase Documentation](https://supabase.com/docs)
- [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide.html)
- [Edamam Nutrition API](https://developer.edamam.com/edamam-docs-nutrition-api)
- [Open Food Facts API](https://world.openfoodfacts.org/data)
