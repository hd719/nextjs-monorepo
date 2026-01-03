# CSS Flash of Unstyled Content (FOUC) Fix

## Problem Summary

After switching from inline Tailwind classes to CSS modules (`.module.css` files with `@apply`), the app started showing a **Flash of Unstyled Content (FOUC)** on initial page load. The page would briefly render with no styles, then styles would apply a moment later.

## Root Cause

### Why CSS Modules Cause FOUC in Vite

In Vite development mode, CSS modules are handled differently than regular stylesheets:

1. **Regular `import "./styles.css"`** → Vite transforms this into a JavaScript module that **injects CSS at runtime**
2. **CSS Modules (`import styles from "./Component.module.css"`)** → Same behavior, but also returns a class name mapping object

The problem is that CSS is **not** loaded as a traditional `<link rel="stylesheet">` in the `<head>`. Instead:

1. HTML streams to browser and starts rendering
2. JavaScript modules load
3. CSS is injected via JavaScript **after** HTML is already visible
4. User sees unstyled content for ~50-100ms

### Evidence from Network Tab

When CSS loads via JS injection:
```
"url": "http://localhost:3003/src/styles.css",
"resourceType": "script"  <-- WRONG! Should be "stylesheet"
```

When CSS loads correctly:
```
"url": "http://localhost:3003/src/styles.css",
"resourceType": "stylesheet"  <-- CORRECT!
```

## The Solution

The fix has **two parts**:

### Part 1: Use `@layer components` Instead of CSS Modules

Instead of separate `.module.css` files, define component styles in the global `styles.css` using Tailwind's `@layer` directive.

**Before (CSS Module):**
```css
/* LandingPage.module.css */
@import "tailwindcss" reference;

.container {
  @apply min-h-screen flex flex-col;
  background-color: var(--background);
}

.header {
  border-bottom: 1px solid var(--border);
}
```

```tsx
// LandingPage.tsx
import styles from "./LandingPage.module.css";

export function LandingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
```

**After (`@layer` in global CSS):**
```css
/* styles.css */
@layer components {
  .landing-container {
    @apply min-h-screen flex flex-col;
    background-color: var(--background);
  }

  .landing-header {
    border-bottom: 1px solid var(--border);
  }
}
```

```tsx
// LandingPage.tsx
// No CSS import needed!

export function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
```

### Part 2: Link CSS in `<head>` Using `?url` Import

In `__root.tsx`, import the CSS with `?url` suffix and add it to the `head()` function's `links` array:

```tsx
// __root.tsx

// Import CSS with ?url to get the URL (not inject via JS)
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [...],
    // This adds <link rel="stylesheet" href="..."> to <head>
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  // ...
});
```

This ensures:
- CSS is linked in `<head>` as a proper stylesheet
- Browser loads CSS **before** rendering content
- No JavaScript injection delay

## Files Changed

### `src/routes/__root.tsx`
- Changed `import "../styles.css"` to `import appCss from "../styles.css?url"`
- Added `links` array to `head()` function with stylesheet link

### `src/styles.css`
- Added `@layer components { ... }` section with component styles
- Styles use prefixed class names (e.g., `landing-container`, `landing-header`)

### `src/components/landing/LandingPage.tsx`
- Removed `import styles from "./LandingPage.module.css"`
- Changed `className={styles.xxx}` to `className="landing-xxx"`

### `src/components/landing/LandingPage.module.css`
- **Can be deleted** (styles moved to `styles.css`)

## CSS Modules Still Needing Conversion

The following CSS modules still use the old pattern and may cause FOUC on their respective pages.

**Total: 26 files**

### Already Converted ✅
- [x] `src/components/landing/LandingPage.module.css` → Styles in `styles.css`, can delete file

### High Priority (Auth Flow - First User Experience)
- [ ] `src/components/forms/AuthLayout.module.css`
- [ ] `src/components/forms/AuthCard.module.css`
- [ ] `src/components/forms/AuthFormField.module.css`

### Medium Priority (Main App Layout)
- [ ] `src/components/layout/AppLayout.module.css`
- [ ] `src/components/layout/Header.module.css`
- [ ] `src/components/layout/Sidebar.module.css`
- [ ] `src/components/layout/BottomNav.module.css`
- [ ] `src/components/layout/ProfileMenu.module.css`

### Dashboard Components
- [ ] `src/components/dashboard/DailySummary.module.css`
- [ ] `src/components/dashboard/MetricCard.module.css`
- [ ] `src/components/dashboard/WaterTracker.module.css`
- [ ] `src/components/dashboard/TodaysDiary.module.css`
- [ ] `src/components/dashboard/QuickActions.module.css`
- [ ] `src/components/dashboard/RecentActivity.module.css`
- [ ] `src/components/dashboard/ExerciseSummary.module.css`
- [ ] `src/components/dashboard/WaterGlass.module.css`

### Diary Components
- [ ] `src/components/diary/DiaryDayView.module.css`
- [ ] `src/components/diary/DiaryEntryList.module.css`
- [ ] `src/components/diary/MealCard.module.css`
- [ ] `src/components/diary/FoodItem.module.css`
- [ ] `src/components/diary/AddFoodDialog.module.css`

### Profile
- [ ] `src/components/profile/ProfileForm.module.css`

### UI Components
- [ ] `src/components/ui/progress-bar.module.css`
- [ ] `src/components/ui/empty-state.module.css`

### Utilities
- [ ] `src/styles/utilities.module.css`

## Conversion Steps for Each Module

1. **Read the `.module.css` file** and copy all styles

2. **Add to `styles.css`** inside `@layer components { ... }`:
   - Prefix all class names with component name (e.g., `auth-`, `app-`, `dashboard-`)
   - Remove `@import "tailwindcss" reference;` (not needed in main file)

3. **Update the component**:
   - Remove the CSS module import
   - Replace `className={styles.xxx}` with `className="prefix-xxx"`

4. **Delete the `.module.css` file** (optional, but keeps codebase clean)

## Naming Convention

Use kebab-case prefixes based on component/feature:

| Component | Prefix | Example |
|-----------|--------|---------|
| LandingPage | `landing-` | `landing-container` |
| AuthLayout | `auth-` | `auth-layout` |
| AppLayout | `app-` | `app-sidebar` |
| Dashboard components | `dashboard-` | `dashboard-metric-card` |
| Diary components | `diary-` | `diary-entry` |

## Why Not Just Use Inline Tailwind?

You could revert to inline Tailwind classes like `className="min-h-screen flex flex-col"`, which also prevents FOUC. However, the `@layer` approach offers:

1. **Organized code** - Styles are grouped logically, not scattered in JSX
2. **Reusability** - Same class can be used in multiple places
3. **CSS variables** - Easy to use `var(--accent)` etc.
4. **Custom CSS** - Can mix `@apply` with regular CSS properties
5. **Smaller bundle** - Tailwind only includes used utilities

## Testing

After converting each module:

1. **Hard refresh** (Cmd+Shift+R) the relevant page
2. **Check Network tab** - CSS should load as `resourceType: "stylesheet"`
3. **No unstyled flash** should appear on page load
4. **Theme toggle** should still work correctly

## References

- [Tailwind CSS @layer directive](https://tailwindcss.com/docs/adding-custom-styles#using-css-and-layer)
- [Vite CSS handling](https://vitejs.dev/guide/features.html#css)
- Video reference: https://www.youtube.com/watch?v=JkWS-S51s-U
