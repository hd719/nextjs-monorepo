# PRD: Barcode Scanner

> **Status:** ✅ Complete - Ready for Deployment
> **Priority:** High
> **Effort:** Medium (3-5 days)
> **Dependencies:** Camera API, Barcode Lookup API (Go service)
> **Completed:** January 12, 2026

---

## Problem Statement

Manually entering food nutrition data is tedious and error-prone. Users must search for foods, verify serving sizes, and manually input values. This friction leads to:

- Incomplete food logging (users skip meals)
- Inaccurate data (wrong foods selected, incorrect portions)
- Poor user experience (takes 30+ seconds per food item)
- Lower retention (users abandon the app)

**Goal:** Reduce food logging time from 30+ seconds to under 5 seconds by scanning product barcodes.

---

## Goals

### Must Have

- [x] Scan barcodes using device camera
- [x] Fetch nutrition data from the barcode lookup API
- [x] Display product details before adding to diary
- [x] Handle "product not found" gracefully
- [x] Work on both mobile and desktop (webcam)

### Should Have

- [x] Offline barcode queue (scan now, sync later)
- [x] Recently scanned products list
- [x] Manual barcode entry fallback
- [ ] Product contribution (add missing products)

### Nice to Have

- [ ] Multi-barcode scanning (scan multiple items quickly)
- [ ] Shopping list integration
- [ ] Price comparison features

### Non-Goals

- Building our own food database
- Barcode generation
- Inventory management
- Backend service implementation or database schema (covered in `PRD_GO_BARCODE_LOOKUP_SERVICE.md`)

---

## User Stories

### As a user logging food

- I want to scan a product barcode to instantly get nutrition info
- I want to adjust serving size before adding to my diary
- I want to see if I've scanned this product before
- I want to manually enter a barcode if camera doesn't work

### As a user with a new product

- I want to contribute missing product data to help others
- I want to save custom products for future use

---

## Technical Architecture

### Technology Stack

| Component | Technology | Reasoning |
|-----------|------------|-----------|
| Barcode Detection | `react-barcode-scanner` | React wrapper for Barcode Detection API |
| Barcode Lookup API | Go microservice | Owns barcode domain: validation, caching, persistence |
| Camera Access | MediaDevices API | Native browser API |
| Analytics | TanStack Start server functions | Scan history, recent scans |

### Architecture Flow

```
┌─────────────┐    ┌──────────────────┐    ┌──────────────┐    ┌─────────────────┐
│  Frontend   │ →  │ TS Server Fn     │ →  │ Go Service   │ →  │ OpenFoodFacts   │
│ (TanStack)  │    │ (lookupBarcode)  │    │ (owns domain)│    │      API        │
└─────────────┘    └──────────────────┘    └──────────────┘    └─────────────────┘
                            │                      │
                            │                      ▼
                            │              ┌──────────────┐
                            │              │   Postgres   │
                            │              │ (food_items) │
                            │              └──────────────┘
                            ▼
                   ┌──────────────┐
                   │   Postgres   │
                   │(barcode_scans)│
                   └──────────────┘
```

### Domain Ownership

| Domain | Owner | Responsibilities |
|--------|-------|------------------|
| Barcode Lookup | Go Service | Validation, OpenFoodFacts API, caching, `food_items` persistence |
| Scan Analytics | TS Server Fns | `barcode_scans` table, recent scans history |
| Diary Entries | TS Server Fns | Creating diary entries from scanned products |

### Frontend Integration

The TanStack Start app calls the Go microservice via `lookupBarcode` server function.
The Go service handles all barcode-related concerns:

- Barcode validation (format, checksum)
- Cache check (Postgres `food_items` table)
- External API call (OpenFoodFacts)
- Persistence (upsert to `food_items`)
- Response normalization

See `PRD_GO_BARCODE_LOOKUP_SERVICE.md` for Go service details.

---

## Authentication & Security

### Overview

The barcode scanner communicates with a standalone Go microservice (`healthmetrics-services`) for barcode lookups. Since this is a separate service, we implement a layered authentication approach:

| Layer | Header | Purpose |
|-------|--------|---------|
| **Service Auth** | `X-API-Key` | Proves request originates from the HealthMetrics app |
| **User Identity** | `Cookie` (session JWT) | Go service verifies JWT to identify the user |
| **User Context** | `X-User-ID` | Auditing and logging (derived from verified session) |
| **Tracing** | `X-Request-ID` | Correlate logs across TS and Go services |

### Authentication Flow

```
┌─────────────┐    ┌──────────────────┐    ┌──────────────┐
│  Frontend   │ →  │ TS Server Fn     │ →  │ Go Service   │
│ (TanStack)  │    │ (lookupBarcode)  │    │ (validates)  │
└─────────────┘    └──────────────────┘    └──────────────┘
                           │                      │
                           │ Sends:               │ Validates:
                           │ • X-API-Key          │ • API key matches
                           │ • Cookie (JWT)       │ • JWT signature valid
                           │ • X-User-ID          │ • User authorized
                           │ • X-Request-ID       │
                           │                      │
```

### Implementation Details

#### Server Function (`src/server/barcode.ts`)

The `lookupBarcode` server function:

1. **Verifies user session** - Rejects unauthenticated requests before calling Go
2. **Generates request ID** - For distributed tracing across services
3. **Sends authentication headers**:
   - `X-API-Key`: Service-to-service secret (from `BARCODE_SERVICE_API_KEY`)
   - `Cookie`: Forwards the session cookie so Go can verify the JWT
   - `X-User-ID`: User ID for auditing (already verified by Better Auth)
   - `X-Request-ID`: Unique ID for log correlation

4. **Handles auth errors** - 401/403 responses from Go are logged and surfaced

#### Go Service Responsibilities

The Go service (documented in `PRD_GO_BARCODE_LOOKUP_SERVICE.md`) validates:

1. **API Key** - Rejects requests without valid `X-API-Key` (401)
2. **JWT Signature** - Verifies the session cookie using shared `BETTER_AUTH_SECRET`
3. **User Authorization** - Can implement per-user rate limiting using `X-User-ID`

### Security Considerations

| Concern | Mitigation |
|---------|------------|
| API key leaked | Rotate via env vars, use secrets manager in prod |
| JWT replay | Short TTL (5 min cache), validate signature on each request |
| Network exposure | Go service is internal-only (not public-facing) |
| CORS bypass | CORS is browser-only; real security is API key + JWT |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GO_SERVICE_URL` | Yes (prod) | Go microservice URL (e.g., `http://localhost:8080`) |
| `BARCODE_SERVICE_API_KEY` | Yes (prod) | Shared secret for service-to-service auth (min 32 chars) |
| `BETTER_AUTH_SECRET` | Yes | Shared with Go service for JWT verification |

**Note:** In development with `VITE_USE_MOCK_BARCODE=true`, authentication is bypassed as no Go service is called.

---

## Implementation Plan

### Phase 1: Core Scanner (Day 1-2)

#### 1.1 Camera Component

**File:** `src/components/scanner/BarcodeScanner.tsx`

```typescript
interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}
```

**Features:**

- Request camera permission
- Display live camera feed
- Detect and decode barcodes (EAN-13, UPC-A, Code128)
- Visual feedback on successful scan
- Torch/flashlight toggle for low light

#### 1.2 Scanner Dialog

**File:** `src/components/scanner/ScannerDialog.tsx`

- Modal wrapper for scanner
- Loading state while fetching product
- Product preview card
- "Add to Diary" button
- Serving size adjustment

### Phase 2: Frontend Integration (Day 2-3)

#### 2.1 Client Lookup Flow

- Call the barcode lookup API with the scanned/typed barcode.
- Handle loading, not-found, and error states in the UI.
- Keep the client logic focused on UX; fallback chains live in the backend.

### Phase 3: User Experience (Day 3-4)

#### 3.1 Recently Scanned

**File:** `src/components/scanner/RecentlyScanned.tsx`

- Grid of recently scanned products
- One-tap to add to diary
- Delete from history

#### 3.2 Manual Barcode Entry

**File:** `src/components/scanner/ManualBarcodeInput.tsx`

- Text input for barcode number
- Numeric keyboard on mobile
- Validation (checksum)

#### 3.3 Product Not Found Flow

**File:** `src/components/scanner/ProductNotFound.tsx`

- Option to search manually instead
- Option to contribute product data
- Link to OpenFoodFacts contribution

### Phase 4: Polish & Edge Cases (Day 4-5)

- Offline queue with sync
- Error handling (camera denied, API errors)
- Loading skeletons
- Haptic feedback on scan
- Analytics events

---

## UI/UX Design

### Scanner Screen Layout

```
┌─────────────────────────────────┐
│  <- Back             Torch      │
├─────────────────────────────────┤
│                                 │
│    ┌───────────────────────┐    │
│    │                       │    │
│    │    [Camera Feed]      │    │
│    │                       │    │
│    │   ┌─────────────┐     │    │
│    │   │ Scan Area   │     │    │
│    │   └─────────────┘     │    │
│    │                       │    │
│    └───────────────────────┘    │
│                                 │
│    Position barcode in frame    │
│                                 │
├─────────────────────────────────┤
│  [Enter barcode manually]       │
│                                 │
│  Recently Scanned:              │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │     │ │     │ │     │       │
│  │Milk │ │Bread│ │Nuts │       │
│  └─────┘ └─────┘ └─────┘       │
└─────────────────────────────────┘
```

### Product Found Card

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
│  Meal:  ( ) Breakfast  (*) Lunch│
│         ( ) Dinner     ( ) Snack│
├─────────────────────────────────┤
│  [ Cancel ]    [ Add to Diary ] │
└─────────────────────────────────┘
```

---

## Offline Barcode Queue

### Overview

The offline queue allows users to scan barcodes even without internet connectivity. Scans are queued locally and automatically synced when the connection is restored. This is particularly useful for:

- Scanning groceries in stores with poor connectivity
- Logging food in areas with no signal
- Batch scanning multiple items quickly

### User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OFFLINE BARCODE QUEUE FLOW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                                                            │
│  │ User opens  │                                                            │
│  │  scanner    │                                                            │
│  └──────┬──────┘                                                            │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────┐     ┌─────────────────────────────────────────────────┐   │
│  │  Is Online? │─NO─▶│ Show offline indicator: "Offline Mode"          │   │
│  └──────┬──────┘     │ Scanner still works, scans will be queued       │   │
│         │            └─────────────────────────────────────────────────┘   │
│         │YES                                                                │
│         ▼                                                                   │
│  ┌─────────────┐                                                            │
│  │ User scans  │                                                            │
│  │  barcode    │                                                            │
│  └──────┬──────┘                                                            │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────┐     ┌─────────────────────────────────────────────────┐   │
│  │  Is Online? │─NO─▶│ Queue scan locally with metadata:               │   │
│  └──────┬──────┘     │ • barcode, mealType, servings, timestamp        │   │
│         │            │                                                 │   │
│         │            │ Show: "Barcode saved! Will sync when online."   │   │
│         │            │                                                 │   │
│         │            │ User can continue scanning more items           │   │
│         │            └─────────────────────────────────────────────────┘   │
│         │YES                                                                │
│         ▼                                                                   │
│  ┌─────────────┐                                                            │
│  │ Normal flow │                                                            │
│  │ (API call)  │                                                            │
│  └─────────────┘                                                            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                         AUTO-SYNC ON RECONNECT                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                                                            │
│  │ Connection  │                                                            │
│  │  restored   │                                                            │
│  └──────┬──────┘                                                            │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────┐     ┌────────────────────────────────────────────┐    │
│  │ Pending scans?  │─YES▶│ Show: "Syncing 3 queued barcodes..."       │    │
│  └──────┬──────────┘     └────────────────────────────────────────────┘    │
│         │                         │                                         │
│         │NO                       ▼                                         │
│         │                 ┌───────────────┐                                 │
│         │                 │ For each scan │                                 │
│         │                 └───────┬───────┘                                 │
│         │                         │                                         │
│         │                         ▼                                         │
│         │                 ┌───────────────┐                                 │
│         │                 │ Lookup barcode│                                 │
│         │                 │   via API     │                                 │
│         │                 └───────┬───────┘                                 │
│         │                         │                                         │
│         │              ┌──────────┴──────────┐                              │
│         │              ▼                     ▼                              │
│         │       ┌──────────┐          ┌──────────┐                         │
│         │       │  Found   │          │ Not Found│                         │
│         │       └────┬─────┘          └────┬─────┘                         │
│         │            │                     │                                │
│         │            ▼                     ▼                                │
│         │    ┌──────────────┐      ┌──────────────┐                        │
│         │    │ Add to diary │      │ Mark failed  │                        │
│         │    │ Remove queue │      │ Show in list │                        │
│         │    └──────────────┘      └──────────────┘                        │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Show summary toast:                                                  │   │
│  │ "2 products added to diary, 1 not found"                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### UI States

#### Offline Indicator (Scanner Header)

```
┌─────────────────────────────────┐
│  <- Back    Offline   Torch     │
│            ─────────            │
│         Scans will be queued    │
├─────────────────────────────────┤
```

#### Queued Scan Confirmation

```
┌─────────────────────────────────┐
│         Offline Mode            │
│                                 │
│    ┌─────────────────────┐      │
│    │   Barcode Saved     │      │
│    │                     │      │
│    │   5901234123457     │      │
│    │                     │      │
│    │   Will sync when    │      │
│    │   you're back online│      │
│    └─────────────────────┘      │
│                                 │
│  Meal:  Lunch   Servings: 1     │
│                                 │
│  [ Scan Another ]  [ Done ]     │
│                                 │
│  ─────────────────────────────  │
│  3 scans queued                 │
└─────────────────────────────────┘
```

#### Pending Queue Badge (Diary Page)

```
┌─────────────────────────────────┐
│  Food Diary          3          │ <- Badge shows pending count
│  Mon, Jan 12, 2026   pending    │
├─────────────────────────────────┤
```

#### Sync Progress Toast

```
┌─────────────────────────────────┐
│  Syncing 3 queued barcodes      │
│  ████████░░░░░░░░░░  2/3        │
└─────────────────────────────────┘
```

#### Sync Complete Toast

```
┌─────────────────────────────────┐
│  Sync complete                  │
│  2 added • 1 not found          │
│                                 │
│  [ View Failed ]  [ Dismiss ]   │
└─────────────────────────────────┘
```

### Technical Implementation

#### Data Structure

```typescript
interface QueuedBarcodeScan {
  id: string;                    // Unique ID for the queued scan
  barcode: string;               // The scanned barcode
  mealType: MealType;            // breakfast | lunch | dinner | snack
  servings: number;              // Number of servings
  date: string;                  // Target diary date (yyyy-MM-dd)
  queuedAt: string;              // When the scan was queued (ISO timestamp)
  status: QueuedScanStatus;      // pending | syncing | synced | failed
  errorMessage?: string;         // Error message if sync failed
  productName?: string;          // Cached name (if found before going offline)
}

type QueuedScanStatus = 'pending' | 'syncing' | 'synced' | 'failed';
```

#### Storage

- **Location:** `localStorage` (key: `barcode-offline-queue`)
- **Max items:** 50 queued scans
- **Retention:** Failed scans kept for 7 days, then auto-deleted
- **Sync trigger:** `navigator.onLine` event + periodic check every 30s

#### Hooks

| Hook | Purpose |
|------|---------|
| `useNetworkStatus` | Track online/offline state |
| `useOfflineBarcodeQueue` | Manage queue CRUD + sync logic |

#### Sync Algorithm

```
1. On connection restored (online event):
   a. Get all pending scans from queue
   b. For each scan (in order of queuedAt):
      i.   Set status = 'syncing'
      ii.  Call lookupBarcode(scan.barcode)
      iii. If found:
           - Call createDiaryEntryFromScan()
           - Remove from queue
      iv.  If not found:
           - Set status = 'failed'
           - Set errorMessage = 'Product not found'
      v.   If network error:
           - Set status = 'pending' (retry later)
   c. Show summary notification
```

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useNetworkStatus.ts` | Create | Online/offline detection |
| `src/hooks/useOfflineBarcodeQueue.ts` | Create | Queue management + sync |
| `src/components/scanner/OfflineIndicator.tsx` | Create | Header offline badge |
| `src/components/scanner/QueuedScanCard.tsx` | Create | Queued scan confirmation UI |
| `src/components/scanner/PendingQueueBadge.tsx` | Create | Badge showing pending count |
| `src/components/scanner/ScannerDialog.tsx` | Modify | Integrate offline flow |
| `src/hooks/useScannerDialog.ts` | Modify | Handle offline scanning |
| `src/styles/components/scanner.css` | Modify | Add offline UI styles |

---

## File Structure

```
src/
├── components/
│   └── scanner/
│       ├── BarcodeScanner.tsx        # Camera + detection
│       ├── ScannerDialog.tsx         # Modal wrapper
│       ├── ProductCard.tsx           # Found product display
│       ├── ProductNotFound.tsx       # Not found state
│       ├── RecentlyScanned.tsx       # History grid
│       ├── ManualBarcodeInput.tsx    # Fallback input
│       ├── ScannerLoadingState.tsx   # Loading skeleton
│       ├── ScannerErrorState.tsx     # Error display
│       ├── CameraPermissionState.tsx # Permission request UI
│       ├── OfflineIndicator.tsx      # Offline mode badge
│       ├── QueuedScanCard.tsx        # Queued scan confirmation
│       ├── PendingQueueBadge.tsx     # Pending sync count badge
│       └── index.ts                  # Barrel exports
├── hooks/
│   ├── useBarcodeLookup.ts           # Calls Go service via server fn
│   ├── useRecentlyScanned.ts         # localStorage history
│   ├── useScannerDialog.ts           # Dialog state management
│   ├── useCameraPermission.ts        # Camera permission handling
│   ├── useScreenReaderAnnounce.ts    # A11y announcements
│   ├── useNetworkStatus.ts           # Online/offline detection
│   └── useOfflineBarcodeQueue.ts     # Offline queue management
├── server/
│   └── barcode.ts                    # Server functions (calls Go service)
├── constants/
│   └── scanner.ts                    # UI constants
├── types/
│   └── scanner.ts                    # Type definitions
└── styles/
    └── components/
        └── scanner.css               # Scanner styles
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GO_SERVICE_URL` | Go microservice URL | `http://localhost:8080` |
| `BARCODE_SERVICE_API_KEY` | API key for Go service auth (min 32 chars) | Required in prod |
| `BETTER_AUTH_SECRET` | Shared secret for JWT verification | Required |
| `VITE_USE_MOCK_BARCODE` | Use mock data instead of Go service | `false` |
| `VITE_SIMULATE_SCANNER_OFFLINE` | Simulate offline mode for testing | `false` |

---

## Error Handling

| Scenario | User Experience |
|----------|-----------------|
| Camera permission denied | Show instructions to enable in settings |
| Camera not available | Show manual entry input |
| Product not found | Offer manual search or contribution |
| API rate limited | Use cached data, retry with backoff |
| Network offline | Queue scan, sync when online |
| Invalid barcode | Show "Couldn't read barcode, try again" |

---

## Acceptance Criteria

### Functional

- [x] Camera opens and displays live feed
- [x] Barcodes detected within 2 seconds
- [x] Product nutrition displayed correctly
- [x] Product added to diary successfully
- [x] Recently scanned list populated
- [x] Manual entry works as fallback

### Performance

- [x] Camera initializes in < 1 second
- [x] Barcode detection in < 500ms
- [x] Offline queue syncs automatically

### Accessibility

- [x] Manual entry for users who can't use camera
- [x] Screen reader announces product details
- [x] High contrast scan area indicator

---

## Testing

### Manual Tests

1. Scan common product (Coca-Cola, Cheerios)
2. Scan obscure product (local brand)
3. Scan invalid/fake barcode
4. Deny camera permission, then allow
5. Scan in low light with torch
6. Manual barcode entry
7. Add scanned product to each meal type
8. **Offline Queue Tests:**
   - Disable network, scan barcode, verify queued
   - Queue multiple barcodes while offline
   - Re-enable network, verify auto-sync
   - Verify failed lookups shown in queue
   - Clear failed items from queue

### Automated Tests

- Unit: Barcode validation
- Unit: Nutrition calculation with servings
- Unit: Offline queue add/remove operations
- Unit: Network status detection
- Integration: API response parsing
- Integration: Queue sync with mock API
- E2E: Full scan → add to diary flow
- E2E: Offline scan → reconnect → sync flow

---

## Future Enhancements

- **Multi-scan mode**: Scan multiple items in grocery haul
- **Barcode history sync**: Sync across devices
- **Smart suggestions**: "You usually have this for breakfast"
- **Nutrition alerts**: "High sodium warning"
- **Shopping list**: Add scanned items to shopping list

---

## Deployment Checklist

- [x] All components implemented and tested
- [x] Barrel exports configured (`index.ts` files)
- [x] Types exported from `types/index.ts`
- [x] Hooks exported from `hooks/index.ts`
- [x] Server functions exported from `server/index.ts`
- [x] CSS follows design system (no hardcoded colors)
- [x] Mock data available for development
- [x] Offline queue functional
- [x] Accessibility features (screen reader, keyboard nav)
- [x] Error handling for all edge cases
- [ ] Go microservice deployed (required for production)
- [ ] `GO_SERVICE_URL` configured in production

---

## Documentation

| Document | Purpose |
|----------|---------|
| `PRD_BARCODE_SCANNER.md` | This file - feature requirements |
| `PRD_GO_BARCODE_LOOKUP_SERVICE.md` | Go microservice specification |
| `markdown-barcode.md` | Implementation tickets (JIRA-style) |
| `offline-barcode-queue.md` | Technical explanation of offline queue |
| `scanner-dialog-flickering-fix.md` | Bug fix documentation |

---

## References

- Go barcode lookup service PRD: `apps/healthmetrics/docs/prds/barcode/PRD_GO_BARCODE_LOOKUP_SERVICE.md`
- [react-barcode-scanner](https://github.com/nicksanford/react-barcode-scanner)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [Window offline event](https://developer.mozilla.org/en-US/docs/Web/API/Window/offline_event)
