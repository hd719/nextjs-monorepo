# Codebase Conventions & Consistency Guide

This document outlines the established patterns and conventions in the HealthMetrics codebase. Use this as a reference when developing new features or conducting code reviews.

---

## Consistency Audit Prompt

Use this prompt when asking an AI assistant to audit the codebase for inconsistencies:

> Alright now that you have refactored and indexed most of the codebase, I want you to go through the codebase again and look for inconsistencies. For example, why does `src/components/forms` contain auth stuff - should we be more specific? These are inconsistencies I'm talking about - like if someone were to look at the code and say "hey this is odd" or "this is inconsistent with everything else."

---

## Directory Structure

```
src/
├── components/          # React components organized by feature
│   ├── achievements/    # Achievement & streak page components
│   ├── auth/            # Auth layouts (AuthCard, AuthLayout)
│   ├── dashboard/       # Dashboard cards & widgets
│   ├── dev/             # Developer tools (DevTools)
│   ├── diary/           # Food diary components
│   ├── exercise/        # Exercise/workout components
│   ├── landing/         # Landing page components
│   ├── layout/          # App shell (Header, Sidebar, BottomNav)
│   ├── onboarding/      # Onboarding wizard & steps
│   ├── profile/         # Profile form & avatar
│   ├── progress/        # Analytics charts & insights
│   ├── sleep/           # Sleep tracking components
│   └── ui/              # Reusable UI primitives (shadcn/ui)
├── constants/           # App-wide constants & config
├── data/                # Mock data for development
├── hooks/               # React Query hooks & custom hooks
├── lib/                 # External library configs (auth, prisma)
├── routes/              # TanStack Router file-based routes
├── server/              # Server functions (createServerFn)
├── styles/              # CSS files organized by feature
├── types/               # TypeScript type definitions
└── utils/               # Utility functions & helpers
```

---

## Import Conventions

### Always Use Barrel Imports For:

| Module | Import Pattern | Example |
|--------|----------------|---------|
| Hooks | `@/hooks` | `import { useProfile, useWaterIntake } from "@/hooks"` |
| Types | `@/types` | `import type { UserProfile, SleepEntry } from "@/types"` |
| Server | `@/server` | `import { fetchUser, getUserProfile } from "@/server"` |
| Data | `@/data` | `import { mockWaterIntake } from "@/data"` |
| Utils | `@/utils` | `import { cn, queryKeys } from "@/utils"` |
| Constants | `@/constants` | `import { ROUTES, ONBOARDING_DEFAULTS } from "@/constants"` |
| Lib | `@/lib` | `import { authClient, prisma } from "@/lib"` |

### Direct Imports Are OK For:

| Module | Import Pattern | Reason |
|--------|----------------|--------|
| UI Components | `@/components/ui/button` | Fine-grained imports reduce bundle |
| Feature Components | `@/components/dashboard` | Use feature barrel, not individual files |

### ❌ Avoid These Patterns:

```typescript
// BAD: Direct hook imports
import { useProfile } from "@/hooks/useProfile";

// GOOD: Barrel import
import { useProfile } from "@/hooks";

// BAD: Direct type imports
import type { SleepEntry } from "@/types/sleep";

// GOOD: Barrel import
import type { SleepEntry } from "@/types";
```

---

## Component Conventions

### Feature Component Folders

Each feature folder should have:

1. **Component files** - `ComponentName.tsx`
2. **Barrel file** - `index.ts` exporting all components

```typescript
// src/components/sleep/index.ts
export { SleepLogTable } from "./SleepLogTable";
export { SleepAnalytics } from "./SleepAnalytics";
export { SleepInsights } from "./SleepInsights";
export { LogSleepDialog } from "./LogSleepDialog";
```

### Naming Conflicts

When the same concept exists in multiple contexts, use suffixes:

| Context | Naming Pattern | Example |
|---------|----------------|---------|
| Dashboard cards | `{Feature}Card` | `SleepCard`, `StreaksCard` |
| Progress charts | `{Feature}ProgressCard` | `SleepProgressCard`, `StreaksProgressCard` |
| Full pages | `{Feature}Dashboard` | `StreaksDashboard` |

---

## Route Conventions

### Route Guards

Use centralized route guards from `@/utils/route-guards`:

```typescript
// Standard protected route
import { createFileRoute } from "@tanstack/react-router";
import { requireAuthAndOnboarding } from "@/utils/route-guards";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: requireAuthAndOnboarding,
});
```

When you need additional context:

```typescript
// Route with extra context
export const Route = createFileRoute("/diary/")({
  beforeLoad: async () => {
    const { user } = await requireAuthAndOnboarding();
    const today = new Date().toISOString().split("T")[0];
    return { user, date: today };
  },
});
```

### Route Structure

- `index.tsx` - Route definition with `beforeLoad` guard
- `index.lazy.tsx` - Lazy-loaded page component

---

## Server Function Conventions

### File Organization

One file per domain in `src/server/`:

```
server/
├── auth.ts          # Authentication
├── profile.ts       # User profile
├── diary.ts         # Food diary
├── exercise.ts      # Workouts
├── sleep.ts         # Sleep tracking
├── streaks.ts       # Streak tracking
├── achievements.ts  # Achievements
├── water.ts         # Water intake
├── steps.ts         # Step counting
├── weight.ts        # Weight tracking
└── index.ts         # Barrel exports
```

### Barrel Export

All server functions must be exported from `server/index.ts`:

```typescript
// server/index.ts
export { getSleepEntry, saveSleepEntry } from "./sleep";
export { getStreaks, updateLoggingStreak } from "./streaks";
```

---

## Type Conventions

### File Organization

One file per domain in `src/types/`:

```
types/
├── auth.ts
├── profile.ts
├── sleep.ts
├── streaks.ts
├── achievements.ts
└── index.ts         # Barrel exports
```

### Barrel Export

All types must be exported from `types/index.ts`:

```typescript
// types/index.ts
export type { SleepEntry, SleepData, SleepCardData } from "./sleep";
export type { UserStreaks, StreakUpdate } from "./streaks";
```

### Type Aliasing for Conflicts

When types with the same name exist in different contexts:

```typescript
// types/index.ts
export type {
  WeightEntry as ProgressChartWeightEntry,  // Progress chart type
} from "./progress";

export type { WeightEntry } from "./weight";  // Database type
```

---

## CSS Conventions

### File Organization

One CSS file per feature in `src/styles/components/`:

```
styles/
├── colors.css           # CSS custom properties (design tokens)
├── motion.css           # Animation keyframes
└── components/
    ├── dashboard.css
    ├── sleep.css
    ├── achievements.css
    ├── ui.css           # UI primitives (slider, etc.)
    └── ...
```

### Class Naming

Use BEM-like naming with feature prefix:

```css
/* Feature prefix + component + element */
.dashboard-sleep-card { }
.dashboard-sleep-card-header { }
.dashboard-sleep-card-content { }

/* State modifiers */
.dashboard-sleep-card-loading { }
```

### Design Tokens

Always use CSS variables from `colors.css`:

```css
/* GOOD */
.my-component {
  background-color: var(--card);
  color: var(--card-foreground);
  border-color: var(--border);
}

/* BAD - hardcoded colors */
.my-component {
  background-color: #ffffff;
  color: #1e293b;
}
```

---

## Mock Data Conventions

### Environment Variables

Use `VITE_USE_MOCK_*` pattern:

```typescript
const useMockDashboard = import.meta.env.VITE_USE_MOCK_DASHBOARD === "true";
const useMockAchievements = import.meta.env.VITE_USE_MOCK_ACHIEVEMENTS === "true";
```

### Mock Data Files

All mock data in `src/data/`:

```typescript
// data/mockData.ts - Dashboard mocks
export const mockSleepCardData: SleepCardData = { ... };
export const mockStreaks: UserStreaks = { ... };

// data/progressMockData.ts - Progress page mocks
export const mockProgressData: ProgressData = { ... };
```

### Barrel Export

Export all mock data from `data/index.ts`:

```typescript
export {
  mockSleepCardData,
  mockStreaks,
  mockAchievementSummary,
} from "./mockData";
```

---

## Checklist for New Features

When adding a new feature, verify:

- [ ] Components in `components/{feature}/` with `index.ts` barrel
- [ ] Types in `types/{feature}.ts` and exported from `types/index.ts`
- [ ] Server functions in `server/{feature}.ts` and exported from `server/index.ts`
- [ ] Hooks in `hooks/use{Feature}.ts` and exported from `hooks/index.ts`
- [ ] CSS in `styles/components/{feature}.css`
- [ ] Mock data in `data/mockData.ts` with env var toggle
- [ ] Query keys in `utils/query-keys.ts`
- [ ] Routes use `requireAuthAndOnboarding` guard
- [ ] All imports use barrel pattern (not direct file imports)

---

## Common Inconsistencies to Avoid

| ❌ Inconsistent | ✅ Consistent |
|-----------------|---------------|
| `@/hooks/useProfile` | `@/hooks` |
| `@/types/sleep` | `@/types` |
| `@/server/auth` | `@/server` |
| `@/data/mockData` | `@/data` |
| Hardcoded colors | CSS variables |
| `USE_MOCK_DATA = true` | `import.meta.env.VITE_USE_MOCK_*` |
| Duplicate component names | Suffixed names (`Card` vs `ProgressCard`) |
| Inline route guards | `requireAuthAndOnboarding` |
