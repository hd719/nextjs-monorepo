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

### 5. Sync Process

When `syncQueue()` runs:

```
For each pending scan:
  1. Mark as "syncing"
  2. Call lookupBarcode() API to get product details
  3. If found → Call createDiaryEntryFromScan() → Remove from queue
  4. If not found → Mark as "failed" with error message
  5. If network error → Keep as "pending" (will retry next sync)
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

## Related Files

- `src/hooks/useNetworkStatus.ts` - Detects online/offline
- `src/hooks/useScannerDialog.ts` - Integrates queue with scanner UI
- `src/components/scanner/QueuedScanCard.tsx` - UI for queued confirmation
- `src/components/scanner/OfflineIndicator.tsx` - Shows offline badge
- `src/components/scanner/PendingQueueBadge.tsx` - Badge showing pending count
- `src/types/scanner.ts` - Type definitions for queue items
