# Onboarding Flow: Bugs & Fixes

This document captures the bugs encountered during the implementation of the onboarding wizard and their solutions.

---

## 1. Double-Click Bug (Step Advancement Flash)

### Symptom

When clicking "Continue" in the onboarding wizard, the component would quickly flash and reset to the current step. A second click was required to actually advance.

### Root Cause

The `useEffect` in `OnboardingWizard.tsx` was syncing with server state on every render. When React Query refetched with an outdated server state (since the save hadn't completed yet), it would overwrite the local `currentStep` state.

```typescript
// PROBLEMATIC CODE
useEffect(() => {
  if (state) {
    setCurrentStep(state.currentStep); // This ran on every state change!
    setStepData(state.data);
  }
}, [state]);
```

### Fix

Introduced an `isInitialized` flag to ensure the effect only syncs with server state once on initial load:

```typescript
// FIXED CODE
const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
  if (state && !isInitialized) {
    const resumeStep = Math.max(1, state.currentStep);
    setCurrentStep(resumeStep);
    setStepData(state.data);
    setIsInitialized(true); // Only sync once
  }
}, [state, isInitialized]);
```

**File:** `src/components/onboarding/OnboardingWizard.tsx`

---

## 2. Step Not Persisting on Page Reload

### Symptom

After completing Step 1 and advancing to Step 2, reloading the page would return the user to Step 1.

### Root Cause

The `saveStep` function was saving the *current* step number, not the *next* step number. So after completing Step 1, we saved `onboardingStep: 1` instead of `onboardingStep: 2`.

```typescript
// PROBLEMATIC CODE
const handleNext = async (data: OnboardingStepData) => {
  await saveStep(currentStep, data); // Saved current step (1)
  setCurrentStep(currentStep + 1);   // Then advanced to 2
};
```

### Fix

Calculate and save the next step number:

```typescript
// FIXED CODE
const handleNext = async (data: OnboardingStepData) => {
  const nextStepNumber = currentStep + 1;
  await saveStep(nextStepNumber, data); // Save the next step (2)
  setCurrentStep(nextStepNumber);
};
```

**File:** `src/components/onboarding/OnboardingWizard.tsx`

---

## 3. Skip Onboarding Not Working

### Symptom

After clicking "Skip for now", the user was redirected back to `/onboarding` in a loop instead of going to the dashboard.

### Root Cause

The `checkOnboardingRequired` server function only checked `onboardingCompleted` and not `onboardingSkippedAt`. When skipping, we set `onboardingSkippedAt` but not `onboardingCompleted`, so the check still returned `required: true`.

```typescript
// PROBLEMATIC CODE
return { required: !user?.onboardingCompleted };
```

### Fix

Check both `onboardingCompleted` AND `onboardingSkippedAt`:

```typescript
// FIXED CODE
return { 
  required: !user?.onboardingCompleted && !user?.onboardingSkippedAt 
};
```

**File:** `src/server/onboarding.ts`

---

## 4. Progress Indicator Line Through Checkmark

### Symptom

The progress bar line was visually overlapping the step circles, including the checkmarks for completed steps.

### Root Cause

CSS `z-index` and background colors weren't properly layering. The continuous line element was rendering on top of the circle content.

### Fix

After multiple attempts with `z-index`, `box-shadow` halos, and background colors, the solution was to **remove the progress indicator entirely** and replace with a simple text counter:

```tsx
// REMOVED: <OnboardingProgress currentStep={currentStep} />

// REPLACED WITH:
<span className="onboarding-step-counter">
  Step {currentStep} of {ONBOARDING_CONTENT_STEPS}
</span>
```

**Files:**

- Deleted: `src/components/onboarding/OnboardingProgress.tsx`
- Updated: `src/components/onboarding/OnboardingWizard.tsx`
- Updated: `src/styles/components/onboarding.css`

---

## 5. Calendar Month Label Missing on Dashboard/Diary

### Symptom

After integrating the `Calendar` component with dropdowns for Date of Birth selection in onboarding, the month label disappeared on all other calendar instances (Dashboard, Diary).

### Root Cause

The `classNames={{ caption_label: "hidden" }}` was applied globally in the Calendar component:

```typescript
// PROBLEMATIC CODE in calendar.tsx
classNames={{
  caption_label: "hidden", // Applied to ALL calendars
}}
```

### Fix

Remove the global style and apply it only where dropdowns are used:

```typescript
// calendar.tsx - no caption_label override

// MeasurementsStep.tsx - apply only here
<Calendar
  captionLayout="dropdown"
  classNames={{
    caption_label: "hidden", // Only hide when dropdowns are active
  }}
/>
```

**Files:**

- `src/components/ui/calendar.tsx`
- `src/components/onboarding/steps/MeasurementsStep.tsx`

---

## 6. DevTools Not Appearing

### Symptom

The gear icon for dev tools wasn't visible on the dashboard.

### Root Cause

1. Environment check was incorrect (`import.meta.env.PROD` instead of `!import.meta.env.DEV`)
2. CSS positioning was being overridden

### Fix

1. Fixed environment check and added explicit env variable:

```typescript
if (!import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_TOOLS !== "true") {
  return null;
}
```

1. Added inline styles as fallback:

```tsx
<button style={{ bottom: '80px', right: '16px', zIndex: 9999 }}>
```

1. Added `VITE_SHOW_DEV_TOOLS=true` to `.env.development.local`

**File:** `src/components/dev/DevTools.tsx`

---

## 7. Timezone Defaulting to Wrong Value

### Symptom

Timezone was defaulting to "Africa/Abidjan" (first in alphabetical list) instead of the user's actual timezone.

### Root Cause

1. The default timezone in constants was evaluated at module load time on the server during SSR
2. Even with a helper function, `useState` initial value runs before hydration completes
3. `data.timezone` from server would override browser detection due to `||` operator

### Fix (Attempt 1 - Insufficient)

```typescript
// This didn't work because useState runs before hydration
const [timezone, setTimezone] = useState(
  data.timezone || getBrowserTimezone()
);
```

### Fix (Final - Using useEffect)

Use `useEffect` to detect timezone after component mounts on the client:

```typescript
const [timezone, setTimezone] = useState<string>("");

// Detect browser timezone on mount (must run client-side)
useEffect(() => {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  setTimezone(data.timezone || browserTimezone || "UTC");
}, [data.timezone]);
```

**File:** `src/components/onboarding/steps/PreferencesStep.tsx`

**Key Insight:** Browser APIs like `Intl` must be called in `useEffect` to ensure they run on the client after hydration.

---

## Key Lessons Learned

1. **State Synchronization**: Be careful when syncing local state with server state in `useEffect`. Use initialization flags to prevent repeated overwrites.

2. **Save the Next State**: When persisting step progress, save where the user is *going*, not where they *were*.

3. **CSS Scope**: Component-level style overrides can leak globally. Apply specific overrides at the usage site, not in shared components.

4. **SSR vs Client**: Code that needs browser APIs (like `Intl`) should run on the client, not during server-side rendering.

5. **Simplify When Stuck**: Sometimes the best fix is to remove complexity. The progress indicator bugs were solved by using simple text instead.
