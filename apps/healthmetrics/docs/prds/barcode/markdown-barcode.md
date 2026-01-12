# Barcode Scanner - Implementation Tickets

> **Epic:** HEALTH-BARCODE
> **Sprint:** Current
> **PRD:** [PRD_BARCODE_SCANNER.md](./PRD_BARCODE_SCANNER.md)

---

## Phase 1: Core Scanner (Day 1-2)

### HEALTH-BAR-001: Setup & Types

**Status:** Done
**Priority:** High
**Estimate:** 1 hour
**Assignee:** -

**Description:**
Set up the scanner module structure and define TypeScript types.

**Acceptance Criteria:**
- [ ] Install `react-barcode-scanner` package
- [ ] Create `src/types/scanner.ts` with type definitions
- [ ] Create `src/components/scanner/index.ts` barrel export
- [ ] Add mock barcode product data to `mockData.ts`

**Files to create/modify:**
- `src/types/scanner.ts` (new)
- `src/components/scanner/index.ts` (new)
- `src/data/mockData.ts` (modify)
- `package.json` (add dependency)

---

### HEALTH-BAR-002: BarcodeScanner Component

**Status:** Done
**Priority:** High
**Estimate:** 3 hours
**Assignee:** -
**Depends on:** HEALTH-BAR-001

**Description:**
Create the core camera component that handles barcode detection.

**Acceptance Criteria:**
- [ ] Request camera permission
- [ ] Display live camera feed
- [ ] Detect barcodes (EAN-13, UPC-A, Code128)
- [ ] Visual feedback on successful scan (scan area overlay)
- [ ] Torch/flashlight toggle for low light
- [ ] Handle camera permission denied state
- [ ] Clean up camera stream on unmount

**Props Interface:**
```typescript
interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}
```

**Files to create:**
- `src/components/scanner/BarcodeScanner.tsx`
- `src/styles/components/scanner.css`

---

### HEALTH-BAR-003: ProductCard Component

**Status:** Done
**Priority:** High
**Estimate:** 2 hours
**Assignee:** -
**Depends on:** HEALTH-BAR-001

**Description:**
Create the product display card showing nutrition information after a successful scan.

**Acceptance Criteria:**
- [ ] Display product name and brand
- [ ] Show serving size information
- [ ] Display nutrition grid (calories, protein, carbs, fat, fiber, sugar)
- [ ] Serving size adjustment with +/- buttons
- [ ] Meal type selector (breakfast, lunch, dinner, snack)
- [ ] Calculate nutrition based on selected servings
- [ ] Loading skeleton state

**UI Reference (from PRD):**
```
┌─────────────────────────────────┐
│  ┌─────┐                        │
│  │     │  Product Name          │
│  │     │  Brand • 100g serving  │
│  └─────┘                        │
├─────────────────────────────────┤
│  Calories    Protein   Carbs    │
│    250        12g       30g     │
│                                 │
│  Fat         Fiber     Sugar    │
│   8g          3g        5g      │
├─────────────────────────────────┤
│  Servings: [ - ]  1.0  [ + ]    │
│                                 │
│  Meal:  ○ Breakfast  ● Lunch    │
│         ○ Dinner     ○ Snack    │
└─────────────────────────────────┘
```

**Files to create:**
- `src/components/scanner/ProductCard.tsx`

---

### HEALTH-BAR-004: ScannerDialog Component

**Status:** Done
**Priority:** High
**Estimate:** 3 hours
**Assignee:** -
**Depends on:** HEALTH-BAR-002, HEALTH-BAR-003

**Description:**
Create the modal wrapper that orchestrates the scanner flow.

**Acceptance Criteria:**
- [ ] Modal opens with camera scanner active
- [ ] Loading state while fetching product from API
- [ ] Show ProductCard on successful lookup
- [ ] Show ProductNotFound on failed lookup
- [ ] "Add to Diary" button creates diary entry
- [ ] Close button and escape key handling
- [ ] Proper focus management

**States:**
1. Scanning (camera active)
2. Loading (fetching product)
3. Product Found (show ProductCard)
4. Product Not Found (show fallback)
5. Error (camera/API errors)

**Files to create:**
- `src/components/scanner/ScannerDialog.tsx`

---

### HEALTH-BAR-005: useBarcodeLookup Hook

**Status:** Done
**Priority:** High
**Estimate:** 2 hours
**Assignee:** -
**Depends on:** HEALTH-BAR-001

**Description:**
Create the hook for looking up barcode data. Uses mock data for now.

**Acceptance Criteria:**
- [ ] Accept barcode string parameter
- [ ] Return product data or null if not found
- [ ] Handle loading and error states
- [ ] Use React Query for caching
- [ ] Mock API response from `mockData.ts`

**Interface:**
```typescript
function useBarcodeLookup(barcode: string | null): {
  data: ScannedProduct | null;
  isLoading: boolean;
  error: Error | null;
}
```

**Files to create:**
- `src/hooks/useBarcodeLookup.ts`
- `src/hooks/index.ts` (modify - add export)

---

### HEALTH-BAR-006: Add Scanner Button to Diary

**Status:** Done
**Priority:** High
**Estimate:** 1 hour
**Assignee:** -
**Depends on:** HEALTH-BAR-004

**Description:**
Add "Scan Barcode" button to the diary page next to "Add Food".

**Acceptance Criteria:**
- [ ] Add barcode icon button next to "Add Food" button
- [ ] Button opens ScannerDialog
- [ ] Pass necessary props (userId, date, onSuccess)
- [ ] Styling matches existing buttons

**Files to modify:**
- `src/components/diary/DiaryDayView.tsx`
- `src/components/diary/index.ts` (if needed)

---

## Phase 2: Enhanced UX (Day 2-3)

### HEALTH-BAR-007: ProductNotFound Component

**Status:** Done
**Priority:** Medium
**Estimate:** 1.5 hours
**Assignee:** -

**Description:**
Create the fallback UI when a scanned barcode is not found in the database.

**Acceptance Criteria:**
- [ ] Display friendly "product not found" message
- [ ] Option to search manually (opens AddFoodDialog)
- [ ] Option to enter barcode manually
- [ ] Link to contribute on OpenFoodFacts (optional)
- [ ] "Try scanning again" button

**Files to create:**
- `src/components/scanner/ProductNotFound.tsx`

---

### HEALTH-BAR-008: ManualBarcodeInput Component

**Status:** Done
**Priority:** Medium
**Estimate:** 1.5 hours
**Assignee:** -

**Description:**
Create a fallback input for users who can't use the camera.

**Acceptance Criteria:**
- [ ] Text input for barcode number
- [ ] Numeric keyboard on mobile (inputmode="numeric")
- [ ] Basic validation (length, numeric)
- [ ] Submit triggers lookup
- [ ] Clear button

**Files to create:**
- `src/components/scanner/ManualBarcodeInput.tsx`

---

### HEALTH-BAR-009: RecentlyScanned Component

**Status:** Done
**Priority:** Medium
**Estimate:** 2 hours
**Assignee:** -

**Description:**
Create a grid of recently scanned products for quick re-adding.

**Acceptance Criteria:**
- [ ] Display grid of recent products (thumbnails)
- [ ] Store in localStorage initially
- [ ] One-tap to select product
- [ ] Delete from history option
- [ ] Max 10 recent items
- [ ] Empty state when no history

**Files to create:**
- `src/components/scanner/RecentlyScanned.tsx`
- `src/hooks/useRecentlyScanned.ts`

---

## Phase 3: Database Integration (Day 3-4)

### HEALTH-BAR-010: BarcodeScan Database Model

**Status:** Done
**Priority:** Medium
**Estimate:** 2 hours
**Assignee:** -

**Description:**
Add database model to track barcode scans for analytics and history.

**Acceptance Criteria:**
- [ ] Create `BarcodeScan` model in Prisma schema
- [ ] Track userId, barcode, foodItemId, scannedAt
- [ ] Run migration
- [ ] Add index on userId for efficient queries

**Schema:**
```prisma
model BarcodeScan {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  barcode    String
  foodItemId String?  @map("food_item_id")
  scannedAt  DateTime @default(now()) @map("scanned_at")
  
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  foodItem FoodItem? @relation(fields: [foodItemId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([barcode])
  @@index([userId, scannedAt])
  @@map("barcode_scans")
}
```

**Files to modify:**
- `prisma/schema.prisma`

---

### HEALTH-BAR-011: Barcode Server Functions

**Status:** Done
**Priority:** Medium
**Estimate:** 3 hours
**Assignee:** -
**Depends on:** HEALTH-BAR-010

**Description:**
Create server-side functions for barcode operations. Note: Product lookup and 
persistence is owned by Go microservice. TS handles analytics only.

**Acceptance Criteria:**
- [x] `lookupBarcode(barcode)` - calls Go service (owns caching + persistence)
- [x] `recordBarcodeScan(userId, barcode, foodItemId)` - log scan (TS analytics domain)
- [x] `getRecentScans(userId, limit)` - get user's recent scans (TS analytics domain)
- [x] ~~`createProductFromBarcode(data)`~~ - removed, Go service handles persistence

**Architecture Note:**
```
lookupBarcode → Go Service → OpenFoodFacts API
                    ↓
               Postgres (food_items)
```

**Files created/modified:**
- `src/server/barcode.ts`

---

## Phase 4: Polish & Edge Cases (Day 4-5)

### HEALTH-BAR-012: Camera Permission States

**Status:** Done
**Priority:** Medium
**Estimate:** 1.5 hours
**Assignee:** -

**Description:**
Handle all camera permission states gracefully.

**Acceptance Criteria:**
- [x] Prompt state (initial permission request)
- [x] Denied state (show instructions to enable)
- [x] Unavailable state (no camera - show manual input)
- [x] Platform-specific instructions (iOS/Android/Desktop)

**Files created:**
- `src/hooks/useCameraPermission.ts`
- `src/components/scanner/CameraPermissionState.tsx`
- Updated `src/styles/components/scanner.css`

---

### HEALTH-BAR-013: Loading & Error States

**Status:** Done
**Priority:** Medium
**Estimate:** 1 hour
**Assignee:** -

**Description:**
Add proper loading skeletons and error handling.

**Acceptance Criteria:**
- [x] ProductCard skeleton while loading
- [x] API error handling with retry option
- [x] Network offline detection
- [x] Graceful degradation

**Files modified:**
- `src/components/scanner/ScannerLoadingState.tsx` - Added skeleton variant
- `src/components/scanner/ScannerErrorState.tsx` - Enhanced error types, retry, offline detection
- `src/styles/components/scanner.css` - Added error variant styles

---

### HEALTH-BAR-014: Accessibility

**Status:** Done
**Priority:** Medium
**Estimate:** 1.5 hours
**Assignee:** -

**Description:**
Ensure scanner is accessible.

**Acceptance Criteria:**
- [x] Screen reader announces scan results
- [x] High contrast scan area indicator
- [x] Keyboard navigation support
- [x] Focus trap in dialog (handled by Radix Dialog)
- [x] ARIA labels on all interactive elements

**Files created/modified:**
- `src/hooks/useScreenReaderAnnounce.ts` - Live region announcements
- `src/components/scanner/ProductCard.tsx` - ARIA roles, labels
- `src/styles/components/scanner.css` - High contrast, focus visible, reduced motion

---

## Phase 5: Offline Queue (Day 5-6)

### HEALTH-BAR-015: Offline Barcode Queue

**Status:** Done
**Priority:** Medium
**Estimate:** 4-6 hours
**Assignee:** -
**Depends on:** HEALTH-BAR-004

**Description:**
Implement offline barcode scanning with automatic sync when connection is restored.
Users can scan barcodes while offline, and they will be queued locally and synced
when the device comes back online.

**User Flow:**
1. User opens scanner while offline → Shows "📴 Offline Mode" indicator
2. User scans barcode → Queued locally with meal type & servings
3. User can continue scanning multiple items
4. Connection restored → Auto-sync starts
5. Show summary: "✅ 2 added, ⚠️ 1 not found"

**Acceptance Criteria:**
- [x] Detect online/offline status via `navigator.onLine` + events
- [x] Show offline indicator in scanner header
- [x] Queue scans to localStorage when offline
- [x] Store: barcode, mealType, servings, date, timestamp, status
- [x] Auto-sync when connection restored
- [ ] Show sync progress toast (future enhancement)
- [x] Handle failed lookups (product not found)
- [x] Show pending queue count badge
- [x] Allow clearing failed items from queue
- [x] Max 50 queued items

**Technical Details:**

```typescript
interface QueuedBarcodeScan {
  id: string;
  barcode: string;
  mealType: MealType;
  servings: number;
  date: string;
  queuedAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  errorMessage?: string;
}
```

**Files to create:**
- `src/hooks/useNetworkStatus.ts` - Online/offline detection
- `src/hooks/useOfflineBarcodeQueue.ts` - Queue CRUD + sync logic
- `src/components/scanner/OfflineIndicator.tsx` - Offline badge
- `src/components/scanner/QueuedScanCard.tsx` - Queued confirmation UI
- `src/components/scanner/PendingQueueBadge.tsx` - Pending count badge

**Files to modify:**
- `src/hooks/useScannerDialog.ts` - Integrate offline flow
- `src/components/scanner/ScannerDialog.tsx` - Show offline UI
- `src/styles/components/scanner.css` - Offline styles
- `src/hooks/index.ts` - Export new hooks
- `src/components/scanner/index.ts` - Export new components

---

## Summary

| Phase | Tickets | Estimated Hours |
|-------|---------|-----------------|
| Phase 1: Core Scanner | 6 | 12 hours |
| Phase 2: Enhanced UX | 3 | 5 hours |
| Phase 3: Database | 2 | 5 hours |
| Phase 4: Polish | 3 | 4 hours |
| Phase 5: Offline Queue | 1 | 5 hours |
| **Total** | **15** | **31 hours** |

---

## Progress Tracking

- [x] Phase 1 Complete
- [x] Phase 2 Complete
- [x] Phase 3 Complete
- [x] Phase 4 Complete
- [x] Phase 5 Complete
- [ ] QA & Testing
- [ ] Ready for Production
