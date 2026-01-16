# Scanner Dialog Flickering Bug Fix

## Problem Statement

When users clicked "Enter barcode manually" in the Scanner Dialog, the UI would flicker - briefly showing the manual input form, then flashing back to the camera scanner view.

## Root Cause Analysis

After deep investigation, two root causes were identified:

### 1. Unstable Dependency in useEffect

```tsx
// PROBLEMATIC CODE
useEffect(() => {
  if (open) {
    startTransition(() => {
      setCameraError(null);
      setServings(1);
      setMealType("lunch");
      setShowManualInput(false);  // ← This kept resetting!
    });
    barcodeMutation.reset();
  }
}, [open, barcodeMutation]);  // ← barcodeMutation reference could change
```

**Why it caused flickering:**
- The `barcodeMutation` object from React Query's `useMutation` was included in the dependency array
- When the mutation's internal state changed (or on certain re-renders), React could see this as a "new" dependency
- This triggered the effect to re-run, calling `setShowManualInput(false)`
- Result: User clicks "manual input" → state set to `true` → effect runs → state reset to `false` → flicker!

### 2. Camera Detecting While Manual Input Shown

```tsx
// PROBLEMATIC CODE
<BarcodeScanner
  isActive={state === "scanning"}  // Always true, even when manual input shown!
  onScan={handleScan}
/>
```

**Why it caused issues:**
- The camera remained active (detecting barcodes) even when visually hidden
- If the camera detected anything while the user was typing, it would trigger `handleScan`
- This could cause unexpected state changes

## Solution

### Fix 1: Ref-Based Transition Detection

Instead of running the reset effect whenever dependencies change, track actual open/close transitions:

```tsx
const prevOpenRef = useRef(open);

useEffect(() => {
  const wasOpen = prevOpenRef.current;
  prevOpenRef.current = open;

  // Only reset when transitioning from closed → open
  if (open && !wasOpen) {
    startTransition(() => {
      setCameraError(null);
      setServings(1);
      setMealType("lunch");
      setShowManualInput(false);
    });
    resetLookup();
  }
}, [open, resetLookup]);
```

**Key insight:** The ref stores the previous value of `open`. We only run reset logic when `open` transitions from `false` to `true` (dialog actually opening), not on every re-render.

### Fix 2: Extract Stable Function References

Instead of using the entire `barcodeMutation` object in dependencies, extract the specific stable functions:

```tsx
const {
  data: product,
  isPending: isLookingUp,
  error: lookupError,
  variables: scannedBarcode,
  isIdle: isLookupIdle,
  mutate: lookupBarcode,   // ← Stable function reference
  reset: resetLookup,      // ← Stable function reference
} = barcodeMutation;
```

React Query memoizes these function references, so they won't cause unnecessary effect re-runs.

### Fix 3: Ignore Camera Scans During Manual Input

```tsx
const handleScan = useCallback(
  (barcode: string) => {
    if (showManualInput) return;  // ← Ignore camera detections
    lookupBarcode(barcode);
  },
  [lookupBarcode, showManualInput]
);
```

### Fix 4: Use Mutation Variables Instead of Separate State

Originally, there was a race condition with separate `scannedBarcode` state:

```tsx
// PROBLEMATIC: Race condition
const handleManualSubmit = (barcode: string) => {
  setScannedBarcode(barcode);      // Triggers re-render
  barcodeMutation.mutate(barcode); // isPending not yet true!
};
// Brief moment where scannedBarcode exists but isPending is false
// → Shows "not found" briefly → flicker!
```

**Solution:** Use React Query's `variables` property instead:

```tsx
const { variables: scannedBarcode } = barcodeMutation;
// variables is set atomically with isPending when mutate() is called
```

## Final Optimization: Custom Hook Extraction

All logic was extracted into a `useScannerDialog` custom hook:

```
Before: ScannerDialog.tsx (279 lines) - mixed logic + UI
After:  useScannerDialog.ts (175 lines) - pure logic
        ScannerDialog.tsx (140 lines) - pure presentation
```

**Benefits:**
- **Testable:** Hook logic can be unit tested independently
- **Reusable:** Hook could power different UI implementations
- **Readable:** Component is now just JSX rendering
- **Maintainable:** Clear separation of concerns

## Key Takeaways

1. **Be careful with object dependencies in useEffect** - Objects can change references unexpectedly. Extract specific values or functions you actually need.

2. **Use refs to track state transitions** - When you need to detect "when X changes from A to B", use a ref to store the previous value.

3. **React Query functions are stable** - `mutate`, `reset`, etc. from `useMutation` are memoized and safe to use in dependency arrays.

4. **Use `variables` from mutations** - It's set atomically with `isPending`, avoiding race conditions with separate state.

5. **Consider what's active vs. visible** - Just because a component is hidden doesn't mean it's inactive. Explicitly disable functionality when hidden.

## Files Changed

- `src/hooks/useScannerDialog.ts` (new) - Extracted hook with all scanner logic
- `src/components/scanner/ScannerDialog.tsx` - Simplified to pure presentation
- `src/hooks/index.ts` - Added export for new hook
