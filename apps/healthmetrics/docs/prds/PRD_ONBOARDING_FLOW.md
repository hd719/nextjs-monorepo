# PRD: User Onboarding Flow

> **Feature:** Guided onboarding to help new users set up their health profile

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [User Stories](#user-stories)
5. [Feature Requirements](#feature-requirements)
6. [Technical Architecture](#technical-architecture)
7. [Database Schema](#database-schema)
8. [API Design](#api-design)
9. [UI/UX Design](#uiux-design)
10. [Implementation Phases](#implementation-phases)
11. [Testing Strategy](#testing-strategy)
12. [Future Considerations](#future-considerations)

---

## Executive Summary

The Onboarding Flow guides new users through setting up their health profile immediately after signup. Instead of landing on an empty dashboard with a "complete your profile" prompt, users are taken through a friendly, step-by-step wizard that collects essential information to personalize their experience.

This flow is designed to be:

- **Quick** (2-3 minutes to complete)
- **Skippable** (users can explore first, complete later)
- **Progressive** (minimal steps, more can be added later)
- **Personalized** (goals affect dashboard recommendations)

---

## Problem Statement

### Current State

- Users sign up and land directly on the dashboard
- Dashboard shows "Complete your profile (40%)" prompt
- Profile page has 15+ fields on a single form (overwhelming)
- No guided experience for first-time users
- Calorie/macro goals default to generic values
- Users may not understand the app's value proposition

### Desired State

- New users complete a friendly onboarding wizard after signup
- Essential data collected: goals, measurements, activity level
- Personalized calorie/macro recommendations calculated
- Dashboard immediately shows relevant, personalized data
- Optional "Skip for now" to explore the app first
- Onboarding state tracked for re-engagement prompts

### Target Users

- First-time users who just created an account
- Users who skipped onboarding initially
- Existing users who haven't completed their profile

---

## Goals & Success Metrics

### Primary Goals

1. Increase profile completion rate from 40% to 80%+
2. Reduce time-to-value (first meaningful interaction)
3. Enable personalized goal recommendations
4. Improve first-week retention

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding Completion Rate | 70% of new signups | Database query |
| Time to Complete | < 3 minutes median | Analytics |
| Profile Completion | 80%+ fields filled | Profile calculation |
| First-Week Retention | +15% vs no onboarding | Cohort analysis |
| Feature Adoption | 50% log first meal within 24h | Activity tracking |

---

## User Stories

### Core Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| O-01 | New user | Be guided through profile setup | I don't feel overwhelmed | P0 |
| O-02 | New user | Set my health goals | The app can personalize my experience | P0 |
| O-03 | New user | Enter my basic measurements | I get accurate calorie recommendations | P0 |
| O-04 | New user | Skip onboarding | I can explore the app first | P0 |
| O-05 | New user | See my recommended daily goals | I understand what I should aim for | P1 |
| O-06 | Returning user | Resume where I left off | I don't have to restart | P1 |
| O-07 | Skip user | Be reminded to complete profile | I remember to set up my account | P1 |
| O-08 | User | Edit my onboarding choices | I can change my goals later | P2 |
| O-09 | User | See why data is needed | I trust the app with my info | P2 |

### Edge Cases

- User refreshes page mid-onboarding
- User closes browser mid-onboarding
- User navigates away using browser back button
- User has previously completed some profile fields
- User accesses onboarding URL directly when already complete

---

## Feature Requirements

### Functional Requirements

#### FR-01: Onboarding Trigger

- Automatically redirect to onboarding after email verification
- Check `onboardingCompleted` flag in user profile
- If false → redirect to `/onboarding`
- Allow direct URL access to `/onboarding` anytime

#### FR-02: Onboarding Steps

**Step 1: Welcome & Goal Selection**

- Friendly welcome message with user's name
- Goal selection (single choice):
  - 🎯 Lose Weight
  - 💪 Build Muscle
  - ⚖️ Maintain Weight
  - 🏃 Improve Fitness
  - 🥗 Eat Healthier

**Step 2: Basic Measurements**

- Height (ft/in or cm based on preference)
- Current weight (lbs or kg)
- Date of birth (for BMR calculation)
- Gender (for BMR calculation)
- Activity level:
  - Sedentary (desk job, little exercise)
  - Lightly Active (1-3 days/week)
  - Moderately Active (3-5 days/week)
  - Very Active (6-7 days/week)
  - Athlete (2x daily training)

**Step 3: Target Goals (Calculated)**

- Show calculated daily calorie goal
- Show macro breakdown (protein/carbs/fat)
- Allow manual adjustment
- Option to set target weight
- Explain the calculation briefly

**Step 4: Quick Preferences**

- Units preference (Imperial/Metric)
- Daily water goal (glasses)
- Daily step goal
- Timezone (auto-detected, editable)

**Step 5: Completion**

- Success message with personalized summary
- Quick actions to get started:
  - "Log your first meal"
  - "Log a workout"
  - "Go to dashboard"

#### FR-03: Skip & Resume

- "Skip for now" button on every step
- Progress saved after each step
- "Complete profile" link always accessible
- Re-engagement prompt after 24h if incomplete

#### FR-04: Goal Calculation

Use Mifflin-St Jeor equation for BMR:

```
Male:   BMR = 10×weight(kg) + 6.25×height(cm) − 5×age + 5
Female: BMR = 10×weight(kg) + 6.25×height(cm) − 5×age − 161
```

TDEE = BMR × Activity Multiplier:

- Sedentary: 1.2
- Lightly Active: 1.375
- Moderately Active: 1.55
- Very Active: 1.725
- Athlete: 1.9

Goal adjustment:

- Lose Weight: TDEE - 500 cal (1 lb/week loss)
- Build Muscle: TDEE + 300 cal
- Maintain: TDEE
- Improve Fitness: TDEE + 100 cal
- Eat Healthier: TDEE (focus on macros)

#### FR-05: Macro Recommendations

Based on goal:

- Lose Weight: 40% protein, 30% carbs, 30% fat
- Build Muscle: 30% protein, 45% carbs, 25% fat
- Maintain: 25% protein, 50% carbs, 25% fat
- Improve Fitness: 25% protein, 55% carbs, 20% fat
- Eat Healthier: 25% protein, 50% carbs, 25% fat

### Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Performance | Each step loads in <500ms |
| Persistence | Progress saved after each step |
| Responsiveness | Mobile-first design |
| Accessibility | WCAG 2.1 AA compliant |
| Privacy | Explain why each data point is needed |

---

## Technical Architecture

### Component Structure

```
src/
├── components/
│   └── onboarding/
│       ├── index.ts                    # Exports
│       ├── OnboardingWizard.tsx        # Main wizard container
│       ├── OnboardingProgress.tsx      # Step progress indicator
│       ├── OnboardingNav.tsx           # Next/Back/Skip buttons
│       ├── steps/
│       │   ├── WelcomeStep.tsx         # Step 1: Welcome & goals
│       │   ├── MeasurementsStep.tsx    # Step 2: Body stats
│       │   ├── GoalsStep.tsx           # Step 3: Calculated goals
│       │   ├── PreferencesStep.tsx     # Step 4: App preferences
│       │   └── CompleteStep.tsx        # Step 5: Success
│       └── shared/
│           ├── GoalCard.tsx            # Selectable goal option
│           ├── UnitToggle.tsx          # Imperial/Metric toggle
│           └── CalorieSlider.tsx       # Adjustable calorie goal
├── hooks/
│   └── useOnboarding.ts                # Onboarding state & logic
├── server/
│   └── onboarding.ts                   # Server functions
├── types/
│   └── onboarding.ts                   # TypeScript types
├── utils/
│   └── nutrition-calculator.ts         # BMR/TDEE calculations
├── constants/
│   └── onboarding.ts                   # Step definitions, defaults
└── routes/
    └── onboarding/
        └── index.tsx                   # Onboarding route
```

### Data Flow

```
┌─────────────────┐
│  Signup Success │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│  Check Profile  │───▶│ onboardingComplete│
│  (beforeLoad)   │    │     = true?      │
└────────┬────────┘    └────────┬─────────┘
         │                      │
         │ No                   │ Yes
         ▼                      ▼
┌─────────────────┐    ┌──────────────────┐
│   /onboarding   │    │    /dashboard    │
└────────┬────────┘    └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Wizard Steps   │ ◀─── State persisted per step
│   (1-5)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Save to Profile │ ───▶ Update User model
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   /dashboard    │
└─────────────────┘
```

### State Management

```typescript
// Onboarding step state (client-side, synced to server per step)
interface OnboardingState {
  currentStep: number;
  data: {
    // Step 1
    goalType: GoalType | null;
    
    // Step 2
    heightCm: number | null;
    currentWeightLbs: number | null;
    dateOfBirth: Date | null;
    gender: Gender | null;
    activityLevel: ActivityLevel | null;
    
    // Step 3 (calculated, user can adjust)
    dailyCalorieGoal: number | null;
    dailyProteinGoalG: number | null;
    dailyCarbGoalG: number | null;
    dailyFatGoalG: number | null;
    targetWeightLbs: number | null;
    
    // Step 4
    unitsPreference: 'imperial' | 'metric';
    dailyWaterGoal: number;
    dailyStepGoal: number;
    timezone: string;
  };
  completed: boolean;
  skippedAt: Date | null;
}

// Goal types
type GoalType = 
  | 'lose_weight'
  | 'build_muscle'
  | 'maintain_weight'
  | 'improve_fitness'
  | 'eat_healthier';
```

---

## Database Schema

### Updates to User Model

```prisma
model User {
  // ... existing fields ...
  
  // Onboarding tracking
  onboardingCompleted   Boolean    @default(false) @map("onboarding_completed")
  onboardingStep        Int        @default(0) @map("onboarding_step")
  onboardingSkippedAt   DateTime?  @map("onboarding_skipped_at")
  onboardingCompletedAt DateTime?  @map("onboarding_completed_at")
  
  // These fields already exist, just noting they're set during onboarding:
  // - goalType
  // - heightCm
  // - currentWeightLbs (via WeightEntry)
  // - dateOfBirth
  // - gender
  // - activityLevel
  // - dailyCalorieGoal
  // - dailyProteinGoalG
  // - dailyCarbGoalG
  // - dailyFatGoalG
  // - targetWeightLbs
  // - unitsPreference
  // - dailyWaterGoal
  // - dailyStepGoal
  // - timezone
}
```

### Migration

```sql
-- Add onboarding tracking columns
ALTER TABLE users 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN onboarding_step INTEGER DEFAULT 0,
ADD COLUMN onboarding_skipped_at TIMESTAMPTZ,
ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
```

---

## API Design

### Server Functions

```typescript
// src/server/onboarding.ts

/**
 * Get current onboarding state for user
 */
export const getOnboardingState = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<OnboardingState> => {
    // Fetch user profile and return current onboarding state
  });

/**
 * Save onboarding step data
 * Updates profile fields and advances step counter
 */
export const saveOnboardingStep = createServerFn({ method: "POST" })
  .inputValidator((data: SaveOnboardingStepInput) => 
    saveOnboardingStepSchema.parse(data)
  )
  .handler(async ({ data }): Promise<{ success: boolean; nextStep: number }> => {
    // Validate step data
    // Update user profile fields
    // Increment onboarding step
    // Return next step number
  });

/**
 * Calculate personalized nutrition goals
 */
export const calculateNutritionGoals = createServerFn({ method: "POST" })
  .inputValidator((data: CalculateGoalsInput) => 
    calculateGoalsSchema.parse(data)
  )
  .handler(async ({ data }): Promise<NutritionGoals> => {
    // Calculate BMR using Mifflin-St Jeor
    // Apply activity multiplier for TDEE
    // Adjust based on goal type
    // Calculate macro breakdown
    // Return recommendations
  });

/**
 * Complete onboarding
 * Sets onboardingCompleted = true
 */
export const completeOnboarding = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    // Set onboardingCompleted = true
    // Set onboardingCompletedAt = now()
    // Clear onboardingSkippedAt if set
  });

/**
 * Skip onboarding
 * Records skip timestamp for re-engagement
 */
export const skipOnboarding = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    // Set onboardingSkippedAt = now()
    // Keep onboardingCompleted = false
  });
```

### Validation Schemas

```typescript
// src/utils/validation.ts

export const saveOnboardingStepSchema = z.object({
  userId: z.string().uuid(),
  step: z.number().min(1).max(5),
  data: z.object({
    // Step 1
    goalType: z.enum([
      'lose_weight',
      'build_muscle', 
      'maintain_weight',
      'improve_fitness',
      'eat_healthier'
    ]).optional(),
    
    // Step 2
    heightCm: z.number().min(100).max(250).optional(),
    currentWeightLbs: z.number().min(50).max(600).optional(),
    dateOfBirth: z.string().optional(), // ISO date string
    gender: z.enum(['male', 'female', 'other']).optional(),
    activityLevel: z.enum([
      'sedentary',
      'lightly_active',
      'moderately_active',
      'very_active',
      'athlete'
    ]).optional(),
    
    // Step 3
    dailyCalorieGoal: z.number().min(1000).max(5000).optional(),
    dailyProteinGoalG: z.number().min(30).max(300).optional(),
    dailyCarbGoalG: z.number().min(50).max(500).optional(),
    dailyFatGoalG: z.number().min(20).max(200).optional(),
    targetWeightLbs: z.number().min(50).max(600).optional(),
    
    // Step 4
    unitsPreference: z.enum(['imperial', 'metric']).optional(),
    dailyWaterGoal: z.number().min(1).max(20).optional(),
    dailyStepGoal: z.number().min(1000).max(50000).optional(),
    timezone: z.string().optional(),
  }),
});

export const calculateGoalsSchema = z.object({
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  age: z.number().min(13).max(120),
  gender: z.enum(['male', 'female', 'other']),
  activityLevel: z.enum([
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'athlete'
  ]),
  goalType: z.enum([
    'lose_weight',
    'build_muscle',
    'maintain_weight',
    'improve_fitness',
    'eat_healthier'
  ]),
});
```

---

## UI/UX Design

### Design Principles

1. **Clean & Focused** - One primary action per step
2. **Progress Visibility** - Always show where user is
3. **Skip-Friendly** - Never force completion
4. **Mobile-First** - Touch-friendly on all devices
5. **Encouraging** - Positive, motivational copy

### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│                         Logo                                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│         Step 1 of 5    ●───○───○───○───○                  │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                   What's your goal?                        │
│                                                            │
│        ┌─────────────────────────────────────┐             │
│        │  🎯  Lose Weight                    │             │
│        └─────────────────────────────────────┘             │
│        ┌─────────────────────────────────────┐             │
│        │  💪  Build Muscle                   │             │
│        └─────────────────────────────────────┘             │
│        ┌─────────────────────────────────────┐             │
│        │  ⚖️  Maintain Weight                │             │
│        └─────────────────────────────────────┘             │
│        ┌─────────────────────────────────────┐             │
│        │  🏃  Improve Fitness                │             │
│        └─────────────────────────────────────┘             │
│        ┌─────────────────────────────────────┐             │
│        │  🥗  Eat Healthier                  │             │
│        └─────────────────────────────────────┘             │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│    [Skip for now]                        [Continue →]      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Step-by-Step Wireframes

#### Step 1: Welcome & Goals

- Welcome message: "Welcome, {name}! 👋"
- Subtitle: "Let's personalize your experience"
- 5 selectable goal cards (radio-style, single select)
- Selected card has primary border/highlight

#### Step 2: Measurements

- 2-column grid on desktop, stack on mobile
- Fields:
  - Height (with unit toggle in field)
  - Weight (with unit toggle in field)
  - Date of birth (date picker)
  - Gender (3 radio buttons)
  - Activity level (5 radio cards with descriptions)
- Small privacy note: "We use this to calculate your goals"

#### Step 3: Your Goals (Calculated)

- Hero section: "Your Daily Goal: 2,100 calories"
- Breakdown card:
  - Protein: 157g (30%)
  - Carbs: 236g (45%)
  - Fat: 58g (25%)
- Slider to adjust calorie goal (±500)
- Optional: Target weight input
- Note: "Based on your goal to build muscle"

#### Step 4: Preferences

- Unit preference toggle (Imperial/Metric)
- Water goal slider (1-15 glasses)
- Step goal slider (2,000-20,000)
- Timezone dropdown (auto-selected)

#### Step 5: All Set

- Success animation (checkmark or confetti)
- Summary card:
  - "Goal: Build Muscle"
  - "Daily: 2,100 cal"
  - "Target: 180 lbs"
- 3 action buttons:
  - "Log your first meal" → /diary
  - "Log a workout" → /exercise
  - "Explore dashboard" → /dashboard

### CSS Classes (following design system)

```css
/* Onboarding layout */
.onboarding-container { }
.onboarding-header { }
.onboarding-progress { }
.onboarding-content { }
.onboarding-footer { }

/* Step components */
.onboarding-step-title { }
.onboarding-step-subtitle { }
.onboarding-step-content { }

/* Goal cards */
.onboarding-goal-card { }
.onboarding-goal-card-selected { }
.onboarding-goal-icon { }
.onboarding-goal-label { }

/* Form elements */
.onboarding-field-group { }
.onboarding-unit-toggle { }
.onboarding-radio-card { }
.onboarding-slider { }

/* Navigation */
.onboarding-nav { }
.onboarding-skip-button { }
.onboarding-back-button { }
.onboarding-next-button { }

/* Completion */
.onboarding-complete-animation { }
.onboarding-summary-card { }
.onboarding-action-buttons { }
```

---

## Implementation Phases

### Phase 1: Core Flow (MVP) - 3 days

**Goal:** Basic 5-step wizard with data persistence

- [ ] Create route `/onboarding`
- [ ] Implement `OnboardingWizard` container
- [ ] Create 5 step components
- [ ] Add progress indicator
- [ ] Implement navigation (next/back/skip)
- [ ] Add redirect logic after signup
- [ ] Save data to user profile per step
- [ ] Add `onboardingCompleted` flag

### Phase 2: Goal Calculation - 1 day

**Goal:** Personalized calorie/macro recommendations

- [ ] Create `nutrition-calculator.ts` utility
- [ ] Implement BMR/TDEE calculation
- [ ] Add goal-based adjustments
- [ ] Calculate macro breakdown
- [ ] Create `GoalsStep` with adjustable slider

### Phase 3: Polish & UX - 1 day

**Goal:** Smooth, delightful experience

- [ ] Add step transition animations
- [ ] Create completion animation
- [ ] Implement unit preference toggle
- [ ] Add form validation with inline errors
- [ ] Mobile responsive testing
- [ ] Accessibility audit

### Phase 4: Re-engagement - 0.5 day

**Goal:** Prompt incomplete users

- [ ] Track skip timestamp
- [ ] Update `ProfileCompletion` component to link to onboarding
- [ ] Show onboarding prompt if skipped >24h ago

---

## Testing Strategy

### Unit Tests

- `nutrition-calculator.ts` - BMR/TDEE calculations
- Validation schemas - Edge cases for all fields
- Step navigation logic

### Integration Tests

- Full wizard flow completion
- Skip and resume flow
- Data persistence across page refresh
- Redirect logic after signup

### E2E Tests

- New user signup → onboarding → dashboard
- Skip onboarding → dashboard → return to onboarding
- Complete onboarding with various goal types

### Manual Testing Checklist

- [ ] All 5 steps complete successfully
- [ ] Skip works from any step
- [ ] Back navigation preserves data
- [ ] Page refresh preserves progress
- [ ] Mobile layout works correctly
- [ ] Keyboard navigation works
- [ ] Screen reader announces steps

---

## Future Considerations

### Phase 2 Enhancements

1. **Photo upload** - Avatar during onboarding
2. **Health conditions** - Dietary restrictions, allergies
3. **Meal preferences** - Breakfast time, number of meals
4. **Connected devices** - Apple Health, Fitbit, etc.
5. **Reminders setup** - Notification preferences

### A/B Testing Opportunities

- Number of steps (3 vs 5)
- Goal calculation visibility (show math or not)
- Skip button placement (prominent vs subtle)
- Completion incentives (badges, streak start)

### Analytics Events

```typescript
// Track onboarding funnel
track('onboarding_started');
track('onboarding_step_completed', { step: 1 });
track('onboarding_step_skipped', { step: 2 });
track('onboarding_completed', { duration_seconds: 120 });
track('onboarding_skipped');
```

### Internationalization

- All copy should use i18n keys
- Unit preferences per locale
- Date format per locale
- Number formatting per locale
