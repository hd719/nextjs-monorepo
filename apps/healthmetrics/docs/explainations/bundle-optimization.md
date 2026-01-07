# Bundle Optimization Guide

This document outlines the bundle analysis, optimizations implemented, and recommendations for maintaining optimal bundle size in the HealthMetrics application.

## Bundle Analysis

### Running the Analyzer

```bash
bun run build:analyze
```

This command:

1. Builds the production bundle
2. Generates `stats.html` in the project root
3. Auto-opens an interactive treemap visualization

### Current Bundle Composition (as of last analysis)

| Chunk | Raw Size | Gzipped | Contents |
|-------|----------|---------|----------|
| `index-gWUTYsZ5.js` | 408 KB | 118 KB | Recharts (charts library) |
| `main-CwmYoTA9.js` | 380 KB | 122 KB | React DOM + core runtime |
| `7NDEDZB7-DFNZA1zS.js` | 133 KB | 45 KB | Zod (form validation) |
| `index-uCdCAQfF.js` | 118 KB | 32 KB | date-fns |
| `AppLayout-D8ajRhco.js` | 86 KB | 29 KB | TanStack Router + Layout |
| `form-errors-BVHXBhGH.js` | 74 KB | 20 KB | Form handling |
| `styles.css` | 195 KB | 23 KB | All CSS (Tailwind) |

**Total Initial Load:** ~400 KB gzipped (JS) + ~23 KB (CSS)

## Optimizations Implemented

### 1. Lazy Loading Progress Page

**Problem:** The Progress page imports Recharts (~120 KB gzipped), which was bundled into the initial load even though most users don't visit this page immediately.

**Solution:** Split the route into two files using TanStack Router's lazy loading pattern:

```
src/routes/progress/
├── index.tsx       # Route config (auth check only) - always loaded
└── index.lazy.tsx  # Component + Recharts - loaded on navigation
```

**How it works:**

- `index.tsx` contains only the route configuration and `beforeLoad` auth check
- `index.lazy.tsx` contains the actual component and all Recharts imports
- When user navigates to `/progress`, the lazy chunk loads on-demand

**Impact:** ~120 KB gzipped removed from initial bundle, loaded only when needed.

### 2. Tree-Shakeable Icon Imports

Lucide React icons are imported individually, allowing Vite to tree-shake unused icons:

```typescript
// Good - individual imports (tree-shakeable)
import { Home, Settings, User } from "lucide-react";

// Bad - namespace import (bundles everything)
import * as Icons from "lucide-react";
```

### 3. CSS Optimization

All CSS uses Tailwind's `@layer` system, which:

- Enables dead code elimination for unused utilities
- Produces optimized, minified output (~23 KB gzipped)
- Avoids Flash of Unstyled Content (FOUC)

## Vite Configuration

The bundle analyzer is configured in `vite.config.ts`:

```typescript
import { visualizer } from "rollup-plugin-visualizer";

// Only runs when ANALYZE=true
process.env.ANALYZE === "true" &&
  visualizer({
    filename: "stats.html",
    open: true,
    gzipSize: true,
    brotliSize: true,
    template: "treemap",
  }),
```

## Bundle Size Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Initial JS (gzipped) | < 300 KB | ~280 KB* |  |
| Initial CSS (gzipped) | < 30 KB | ~23 KB | |
| Largest chunk | < 150 KB | ~122 KB | |
| Time to Interactive | < 3s (3G) | ~2.5s | |

*After lazy loading Progress page

## Future Optimization Opportunities

### High Impact

1. **Lazy Load Diary Page**
   - Similar pattern to Progress page
   - Would defer date-fns until needed
   - Est. savings: ~30 KB gzipped

2. **Replace Recharts with Lightweight Alternative**
   - If only simple charts needed, consider `react-chartjs-2` (~40 KB) or `lightweight-charts` (~50 KB)
   - Current Recharts: ~120 KB gzipped

### Medium Impact

1. **Dynamic Import for date-fns Locales**
   - Only load locale data when user changes language
   - Est. savings: ~10-20 KB

2. **Code Split Form Validation**
   - Zod is ~45 KB gzipped
   - Could lazy load on form pages only

### Low Impact (Micro-optimizations)

1. **Use `clsx` instead of `clsx` + `tailwind-merge`**
   - If not using complex merge logic
   - Est. savings: ~5 KB

## Monitoring Bundle Size

### In CI/CD

Add bundle size checks to your CI pipeline:

```yaml
# Example GitHub Actions step
- name: Check bundle size
  run: |
    bun run build
    # Fail if main chunk exceeds 150KB gzipped
    size=$(gzip -c dist/client/assets/main-*.js | wc -c)
    if [ $size -gt 153600 ]; then
      echo "Bundle size exceeded: $size bytes"
      exit 1
    fi
```

### Manual Checks

After adding new dependencies:

```bash
# 1. Check package size before installing
npx bundle-phobia-cli <package-name>

# 2. Build and analyze after installing
bun run build:analyze
```

## Dependency Size Reference

| Package | Size (gzipped) | Tree-shakeable | Notes |
|---------|---------------|----------------|-------|
| react-dom | ~45 KB | No | Core, unavoidable |
| recharts | ~120 KB | Partial | Heavy, consider alternatives |
| @tanstack/react-router | ~25 KB | No | Necessary for routing |
| @tanstack/react-query | ~15 KB | Partial | Caching layer |
| zod | ~12 KB | Yes | Validation |
| date-fns | ~10 KB (used) | Yes | Only imported functions |
| lucide-react | ~0.3 KB/icon | Yes | Per-icon |
| tailwind-merge | ~5 KB | No | CSS class merging |

## Best Practices

1. **Always check bundle impact before adding dependencies**

   ```bash
   npx bundle-phobia-cli <package-name>
   ```

2. **Use dynamic imports for heavy features**

   ```typescript
   const HeavyComponent = lazy(() => import("./HeavyComponent"));
   ```

3. **Prefer tree-shakeable libraries**
   - `lodash-es` over `lodash`
   - `date-fns` over `moment`
   - Individual icon imports

4. **Run `build:analyze` after major changes**
   - Especially after adding new pages or features
   - Look for unexpected size increases

5. **Keep route components lean**
   - Heavy logic should be in lazy-loaded components
   - Route files should primarily handle auth/loading states
