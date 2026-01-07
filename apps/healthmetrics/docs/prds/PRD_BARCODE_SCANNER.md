# PRD: Barcode Scanner

> **Status:** Not Started
> **Priority:** High
> **Effort:** Medium (3-5 days)
> **Dependencies:** Camera API, Food Database API

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

- [ ] Scan barcodes using device camera
- [ ] Fetch nutrition data from OpenFoodFacts API
- [ ] Display product details before adding to diary
- [ ] Handle "product not found" gracefully
- [ ] Work on both mobile and desktop (webcam)

### Should Have

- [ ] Offline barcode queue (scan now, sync later)
- [ ] Recently scanned products list
- [ ] Manual barcode entry fallback
- [ ] Product contribution (add missing products)

### Nice to Have

- [ ] Multi-barcode scanning (scan multiple items quickly)
- [ ] Shopping list integration
- [ ] Price comparison features

### Non-Goals

- Building our own food database
- Barcode generation
- Inventory management

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
| Barcode Detection | `@aspect-ratio/barcode-scanner` or `html5-qrcode` | Lightweight, no native dependencies |
| Food Database | OpenFoodFacts API | Free, open-source, 2M+ products |
| Fallback Database | USDA FoodData Central | US government database, reliable |
| Camera Access | MediaDevices API | Native browser API |

### API Integration

**OpenFoodFacts API:**

```
GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json
```

**Response Structure:**

```typescript
interface OpenFoodFactsProduct {
  code: string;                    // Barcode
  product_name: string;
  brands: string;
  serving_size: string;            // "30g", "1 cup"
  nutriments: {
    energy_kcal_100g: number;
    proteins_100g: number;
    carbohydrates_100g: number;
    fat_100g: number;
    fiber_100g?: number;
    sodium_100g?: number;
    sugars_100g?: number;
  };
  image_url?: string;
  categories_tags?: string[];
}
```

### Database Schema

```prisma
model ScannedProduct {
  id            String   @id @default(cuid())
  barcode       String   @unique
  name          String
  brand         String?
  servingSizeG  Decimal
  calories100g  Decimal
  protein100g   Decimal
  carbs100g     Decimal
  fat100g       Decimal
  fiber100g     Decimal?
  sugar100g     Decimal?
  sodium100g    Decimal?
  imageUrl      String?
  source        String   // "openfoodfacts", "usda", "user"
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Track user scans for "recently scanned"
  scans         ProductScan[]

  @@map("scanned_product")
}

model ProductScan {
  id        String   @id @default(cuid())
  userId    String
  productId String
  scannedAt DateTime @default(now())

  user      BetterAuthUser  @relation(fields: [userId], references: [id])
  product   ScannedProduct  @relation(fields: [productId], references: [id])

  @@map("product_scan")
}
```

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

### Phase 2: API Integration (Day 2-3)

#### 2.1 Server Functions

**File:** `src/server/scanner.ts`

```typescript
// Fetch product from external APIs
export async function lookupBarcode(barcode: string): Promise<ScannedProduct | null>

// Check local cache first
export async function getProductByBarcode(barcode: string): Promise<ScannedProduct | null>

// Add to diary from scanned product
export async function addScannedTooDiary(data: {
  barcode: string;
  mealType: MealType;
  servings: number;
  date: Date;
}): Promise<DiaryEntry>

// Get recently scanned products
export async function getRecentlyScanned(userId: string, limit?: number): Promise<ScannedProduct[]>
```

#### 2.2 API Fallback Chain

```
1. Check local database (ScannedProduct)
   ↓ not found
2. Query OpenFoodFacts API
   ↓ not found
3. Query USDA FoodData Central
   ↓ not found
4. Show "Product Not Found" UI
```

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
│  ← Back              🔦 Torch   │
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
│  │ 🥛  │ │ 🍞  │ │ 🥜  │       │
│  │Milk │ │Bread│ │Nuts │       │
│  └─────┘ └─────┘ └─────┘       │
└─────────────────────────────────┘
```

### Product Found Card

```
┌─────────────────────────────────┐
│  ┌─────┐                        │
│  │ 📷  │  Product Name          │
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
├─────────────────────────────────┤
│  [ Cancel ]    [ Add to Diary ] │
└─────────────────────────────────┘
```

---

## File Structure

```
src/
├── components/
│   └── scanner/
│       ├── BarcodeScanner.tsx      # Camera + detection
│       ├── ScannerDialog.tsx       # Modal wrapper
│       ├── ProductCard.tsx         # Found product display
│       ├── ProductNotFound.tsx     # Not found state
│       ├── RecentlyScanned.tsx     # History grid
│       ├── ManualBarcodeInput.tsx  # Fallback input
│       └── index.ts
├── server/
│   └── scanner.ts                  # Server functions
├── hooks/
│   ├── useBarcodeLookup.ts         # API query hook
│   └── useRecentlyScanned.ts       # History hook
├── types/
│   └── scanner.ts                  # Type definitions
└── styles/
    └── components/
        └── scanner.css             # Scanner styles
```

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

- [ ] Camera opens and displays live feed
- [ ] Barcodes detected within 2 seconds
- [ ] Product nutrition displayed correctly
- [ ] Product added to diary successfully
- [ ] Recently scanned list populated
- [ ] Manual entry works as fallback

### Performance

- [ ] Camera initializes in < 1 second
- [ ] Barcode detection in < 500ms
- [ ] API response cached for 24 hours
- [ ] Offline queue syncs automatically

### Accessibility

- [ ] Manual entry for users who can't use camera
- [ ] Screen reader announces product details
- [ ] High contrast scan area indicator

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

### Automated Tests

- Unit: Barcode validation
- Unit: Nutrition calculation with servings
- Integration: API response parsing
- E2E: Full scan → add to diary flow

---

## Future Enhancements

- **Multi-scan mode**: Scan multiple items in grocery haul
- **Barcode history sync**: Sync across devices
- **Smart suggestions**: "You usually have this for breakfast"
- **Nutrition alerts**: "High sodium warning"
- **Shopping list**: Add scanned items to shopping list

---

## References

- [OpenFoodFacts API](https://world.openfoodfacts.org/data)
- [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide.html)
- [html5-qrcode Library](https://github.com/mebjas/html5-qrcode)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
