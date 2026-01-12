# Offline Barcode Queue Hook

> **File:** `src/hooks/useOfflineBarcodeQueue.ts`

## What Problem Does This Solve?

When a user scans a barcode while **offline** (no internet connection), the app can't look up the product or add it to their food diary. Without this hook, the scan would just fail and the user would have to remember to scan it again later.

This hook **queues** those scans locally and automatically syncs them when the internet comes back.

## Real-World Example

```
1. User is at grocery store with spotty wifi
2. They scan a cereal box barcode → No internet!
3. Instead of failing, the scan is SAVED locally
4. User continues shopping, scans 5 more items
5. They leave the store and connect to wifi
6. Hook AUTOMATICALLY syncs all 6 scans to their diary
```

## How It Works (Step by Step)

### 1. Storage

The queue is stored in **localStorage** under the key `barcode-offline-queue`. This means:
- Survives page refreshes
- Persists even if the user closes the browser
- Limited to 50 items max (to prevent storage bloat)

### 2. Queue Item Structure

Each queued scan contains:

```typescript
{
  id: "abc-123",              // Unique identifier
  barcode: "5901234123457",   // The scanned barcode
  mealType: "lunch",          // Which meal it's for
  servings: 1,                // Number of servings
  date: "2026-01-12",         // Target diary date
  queuedAt: "2026-01-12T10:30:00Z",  // When it was queued
  status: "pending",          // pending | syncing | synced | failed
  errorMessage?: "..."        // Only if failed
}
```

### Sync Result Structure

When syncing, each item produces a result:

```typescript
{
  id: string;
  barcode: string;
  success: boolean;
  productName?: string;       // Name if lookup succeeded
  errorMessage?: string;      // Error message if failed
  shouldRetry?: boolean;      // Network error - keep as pending for retry
  shouldMarkFailed?: boolean; // Other error - mark as permanently failed
}
```

The `shouldRetry` and `shouldMarkFailed` flags help determine how to handle failures:
- **Network errors** → `shouldRetry: true` → Status reverts to "pending" for next sync
- **Product not found** → `shouldMarkFailed: true` → Status set to "failed"

### 3. Status Flow

```
┌─────────┐     ┌──────────┐     ┌────────┐
│ pending │ ──▶ │ syncing  │ ──▶ │ synced │ (removed from queue)
└─────────┘     └──────────┘     └────────┘
                     │
                     ▼
                ┌────────┐
                │ failed │ (stays in queue for 7 days)
                └────────┘
```

### 4. Auto-Sync Trigger

The hook uses `useNetworkStatus` to detect when the user comes back online:

```typescript
useEffect(() => {
  if (isOnline && pendingCount > 0) {
    syncQueue();  // Automatically starts syncing!
  }
}, [isOnline, queue]);
```

This listens to the browser's `online` event, so sync starts **immediately** when connectivity is restored.

### 5. Sync Process (Parallel with Concurrency Limit)

When `syncQueue()` runs, items are processed **in parallel batches** for better throughput:

```
SYNC_CONCURRENCY_LIMIT = 3  // Process 3 items at a time

For each batch of pending scans:
  1. Mark batch as "syncing"
  2. Process batch in parallel using Promise.all:
     - Call lookupBarcode() API to get product details
     - If found → Call createDiaryEntryFromScan()
  3. Update queue state in batch:
     - Success → Remove from queue
     - Not found → Mark as "failed"
     - Network error → Keep as "pending" (will retry next sync)
```

**Why parallel processing?**
- 10 queued items now sync ~3x faster than sequential processing
- Individual item failures don't block the batch
- Concurrency limit (3) prevents overwhelming the server

```typescript
// Process scans in batches with concurrency limit
for (let i = 0; i < pendingScans.length; i += SYNC_CONCURRENCY_LIMIT) {
  const batch = pendingScans.slice(i, i + SYNC_CONCURRENCY_LIMIT);
  const batchResults = await Promise.all(
    batch.map((scan) => processSingleScan(scan))
  );
  // Batch update queue state...
}
```

## API Reference

### Input

```typescript
const queue = useOfflineBarcodeQueue(userId: string)
```

The `userId` is required to know which user's diary to add entries to.

### Returned Values

| Property | Type | Description |
|----------|------|-------------|
| `queue` | `QueuedBarcodeScan[]` | All items in the queue |
| `pendingCount` | `number` | Items waiting to sync |
| `failedCount` | `number` | Items that failed to sync |
| `totalCount` | `number` | Total items in queue |
| `isEmpty` | `boolean` | True if queue is empty |
| `isSyncing` | `boolean` | True while sync is in progress |
| `lastSyncResult` | `QueueSyncSummary` | Results of last sync |

### Actions

| Function | Description |
|----------|-------------|
| `queueScan(barcode, mealType, servings, date, productName?)` | Add a new scan to the queue |
| `removeScan(id)` | Remove a specific scan |
| `clearFailed()` | Remove all failed items |
| `clearAll()` | Clear the entire queue |
| `syncQueue()` | Manually trigger a sync |

## Usage in ScannerDialog

The `useScannerDialog` hook integrates this:

```typescript
// In useScannerDialog.ts
const { isOffline } = useNetworkStatus();
const { queueScan, pendingCount } = useOfflineBarcodeQueue(userId);

const handleScan = (barcode: string) => {
  if (isOffline) {
    // Queue it instead of failing!
    queueScan(barcode, mealType, servings, date);
    return;
  }
  // Normal online flow...
  lookupBarcode(barcode);
};
```

## Configuration Constants

```typescript
const STORAGE_KEY = "barcode-offline-queue";
const MAX_QUEUE_SIZE = 50;              // Max items in queue
const FAILED_RETENTION_DAYS = 7;        // Days to keep failed items
const SYNC_CONCURRENCY_LIMIT = 3;       // Parallel sync batch size
```

## Cleanup Rules

- **Successful syncs:** Removed from queue immediately
- **Failed syncs:** Kept for 7 days, then auto-deleted
- **Max queue size:** 50 items (oldest removed first if exceeded)

## Why Use a Ref for Sync In Progress?

```typescript
const syncInProgressRef = useRef(false);
```

This prevents **duplicate syncs**. Without it:
1. User comes online
2. Sync starts
3. Queue state updates (triggers re-render)
4. useEffect sees pending items, starts ANOTHER sync
5. Infinite loop!

The ref acts as a lock that persists across renders.

## Testing This Feature

### Option 1: Environment Variable (Recommended)

Set the env var to simulate offline mode for the scanner:

```bash
VITE_SIMULATE_SCANNER_OFFLINE=true
```

This forces the **scanner only** to behave as offline without actually cutting internet. Benefits:
- Reproducible across environments
- Works in automated tests
- Rest of app still works (diary loading, navigation, etc.)
- No manual DevTools interaction
- Only affects `useNetworkStatus` hook used by scanner

### Option 2: Browser DevTools

1. Open DevTools → Network → Set to "Offline"
2. Open barcode scanner
3. Scan a barcode (or enter manually)
4. See "Barcode Saved" confirmation
5. Set Network back to "Online"
6. Watch the auto-sync happen

### Test Flow

1. Enable offline mode (env var or DevTools)
2. Open barcode scanner → See "Offline" indicator
3. Scan/enter a barcode → See "Barcode Saved" confirmation
4. Scan a few more items
5. Disable offline mode
6. Watch auto-sync process the queue

## Related Optimizations

The barcode scanning system includes several performance optimizations that work together:

### 1. React Query Barcode Caching

**File:** `src/hooks/useBarcodeLookup.ts`

Barcode lookups are cached client-side using React Query:

```typescript
const BARCODE_CACHE_STALE_TIME_MS = 5 * 60 * 1000;  // 5 min - data considered fresh
const BARCODE_CACHE_GC_TIME_MS = 30 * 60 * 1000;    // 30 min - kept in memory
```

- Same barcode scanned twice = **instant** (no network call)
- Cache survives component remounts
- Works with React Query devtools for debugging

### 2. Request Deduplication

**File:** `src/hooks/useScannerDialog.ts`

Prevents rapid duplicate scans from camera triggering multiple API calls:

```typescript
const SCAN_DEBOUNCE_MS = 1500;  // 1.5 second debounce window

// If same barcode scanned within debounce window, ignore
if (lastScannedBarcodeRef.current === barcode && 
    now - lastScanTimeRef.current < SCAN_DEBOUNCE_MS) {
  return;
}
```

### 3. Cache Priming from Recently Scanned

**File:** `src/hooks/useScannerDialog.ts`

When the scanner dialog opens, recently scanned products are pre-loaded into the cache:

```typescript
// Prime the barcode cache with recently scanned products
if (recentlyScanned.length > 0) {
  primeBarcodeCache(recentlyScanned.map((item) => item.product));
}
```

This allows instant lookups if user re-scans the same barcode they scanned before.

### 4. Go Service Cache-First Pattern (Backend)

**File:** `apps/healthmetrics-services/main.go` (planned)

The Go barcode service will implement a cache-first pattern:

```
1. Validate barcode
2. Query food_items table (cache check)
3. If found & fresh → Return immediately (skip OpenFoodFacts)
4. If not found or stale → Call OpenFoodFacts → Upsert to DB → Return
```

Expected latency:
- **Cache hit:** < 100ms
- **Cache miss:** 500ms - 3s+ (depends on OpenFoodFacts)

### Performance Summary

| Scenario | Latency |
|----------|---------|
| Re-scan same barcode (client cache) | **Instant** |
| Select recently scanned item | **Instant** |
| Rapid duplicate scans | **Single call** (debounced) |
| Go service cache hit | < 100ms |
| Go service cache miss | 500ms - 3s |
| Offline queue sync (10 items) | ~3-4 parallel batches |

## Related Files

- `src/hooks/useNetworkStatus.ts` - Detects online/offline
- `src/hooks/useScannerDialog.ts` - Integrates queue with scanner UI, deduplication, cache priming
- `src/hooks/useBarcodeLookup.ts` - Barcode lookup with React Query caching
- `src/hooks/useRecentlyScanned.ts` - localStorage history of scanned products
- `src/components/scanner/QueuedScanCard.tsx` - UI for queued confirmation
- `src/components/scanner/OfflineIndicator.tsx` - Shows offline badge
- `src/components/scanner/PendingQueueBadge.tsx` - Badge showing pending count
- `src/types/scanner.ts` - Type definitions for queue items and sync results
- `src/server/diary.ts` - Server function with Go service domain ownership logic
- `apps/healthmetrics-services/prds/barcode.md` - Go service PRD with cache-first flow
