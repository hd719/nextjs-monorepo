"use client";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  startTransition,
} from "react";
import {
  useBarcodeLookup,
  usePrimeBarcodeCache,
  useCreateDiaryEntryFromScan,
  useRecentlyScanned,
  useCameraPermission,
  useScreenReaderAnnounce,
  useNetworkStatus,
  useOfflineBarcodeQueue,
} from "@/hooks";
import type { MealType } from "@/constants";
import type {
  ScannerState,
  ScannerError,
  ScannedProduct,
  QueuedBarcodeScan,
} from "@/types";
import type { RecentlyScannedItem, CameraPermissionStatus } from "@/hooks";

// Extended state to include "queued" for offline scans
export type ExtendedScannerState = ScannerState | "queued";

// Debounce time to prevent rapid duplicate scans (ms)
const SCAN_DEBOUNCE_MS = 1500;

interface UseScannerDialogOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  date: string;
  onSuccess: () => void;
}

interface UseScannerDialogReturn {
  // State
  state: ExtendedScannerState;
  product: ScannedProduct | null | undefined;
  scannedBarcode: string | undefined;
  displayError: ScannerError | null;
  showManualInput: boolean;
  isLookingUp: boolean;
  isAddingToDiary: boolean;

  // Camera permission
  cameraPermission: CameraPermissionStatus;
  requestCameraPermission: () => Promise<void>;
  cameraPermissionError: string | null;

  // Offline queue
  isOffline: boolean;
  queuedScan: QueuedBarcodeScan | null;
  pendingQueueCount: number;
  isSyncing: boolean;

  // Form state
  servings: number;
  setServings: (servings: number) => void;
  mealType: MealType;
  setMealType: (mealType: MealType) => void;

  // Recently scanned
  recentlyScanned: RecentlyScannedItem[];
  handleSelectRecent: (product: ScannedProduct) => void;
  handleRemoveRecent: (barcode: string) => void;
  handleClearRecent: () => void;

  // Handlers
  handleScan: (barcode: string) => void;
  handleScannerError: (error: ScannerError) => void;
  handleClose: () => void;
  handleTryAgain: () => void;
  handleManualSubmit: (barcode: string) => void;
  handleAddToDiary: () => Promise<void>;
  handleQueueScan: (barcode: string) => void;
  toggleManualInput: () => void;
}

export function useScannerDialog({
  open,
  onOpenChange,
  userId,
  date,
  onSuccess,
}: UseScannerDialogOptions): UseScannerDialogReturn {
  // Local UI state
  const [cameraError, setCameraError] = useState<ScannerError | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [showManualInput, setShowManualInput] = useState(false);
  const [selectedRecentProduct, setSelectedRecentProduct] =
    useState<ScannedProduct | null>(null);
  const [queuedScan, setQueuedScan] = useState<QueuedBarcodeScan | null>(null);

  // Track open transitions
  const prevOpenRef = useRef(open);

  // Request deduplication - prevent rapid duplicate scans
  const lastScannedBarcodeRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Network status
  const { isOffline } = useNetworkStatus();

  // Offline queue
  const {
    queueScan,
    pendingCount: pendingQueueCount,
    isSyncing,
  } = useOfflineBarcodeQueue(userId);

  // Camera permission
  const {
    status: cameraPermission,
    requestPermission: requestCameraPermission,
    error: cameraPermissionError,
  } = useCameraPermission();

  // Screen reader announcements
  const { announce } = useScreenReaderAnnounce();

  // Mutations & Recently Scanned
  const barcodeMutation = useBarcodeLookup();
  const createEntryMutation = useCreateDiaryEntryFromScan();
  const primeBarcodeCache = usePrimeBarcodeCache();
  const {
    items: recentlyScanned,
    addItem: addRecentItem,
    removeItem: removeRecentItem,
    clearAll: clearRecentItems,
  } = useRecentlyScanned();

  const {
    data: lookupProduct,
    isPending: isLookingUp,
    error: lookupError,
    variables: scannedBarcode,
    isIdle: isLookupIdle,
    mutate: lookupBarcode,
    reset: resetLookup,
  } = barcodeMutation;

  // Product can come from lookup OR from recent selection
  const product = selectedRecentProduct || lookupProduct;

  // Derive scanner state (extended to include "queued")
  const state: ExtendedScannerState = useMemo(() => {
    if (queuedScan) return "queued";
    if (cameraError) return "error";
    if (isLookingUp) return "loading";
    if (lookupError) return "error";
    if (product) return "found";
    if (scannedBarcode && !isLookupIdle) return "not_found";
    return "scanning";
  }, [
    queuedScan,
    cameraError,
    isLookingUp,
    lookupError,
    product,
    scannedBarcode,
    isLookupIdle,
  ]);

  const displayError = cameraError || lookupError;

  // Announce state changes to screen readers
  useEffect(() => {
    if (state === "queued" && queuedScan) {
      announce(
        `Barcode ${queuedScan.barcode} saved for later. Will sync when online.`
      );
    } else if (state === "loading" && scannedBarcode) {
      announce(`Looking up barcode ${scannedBarcode}`);
    } else if (state === "found" && product) {
      announce(
        `Product found: ${product.name}${product.brand ? ` by ${product.brand}` : ""}. ${Math.round(product.caloriesPer100g)} calories per 100 grams.`
      );
    } else if (state === "not_found" && scannedBarcode) {
      announce(`Product not found for barcode ${scannedBarcode}`);
    } else if (state === "error") {
      announce("An error occurred. Please try again.");
    }
  }, [state, product, scannedBarcode, queuedScan, announce]);

  // Reset on dialog open (closed → open transition only)
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (open && !wasOpen) {
      startTransition(() => {
        setCameraError(null);
        setServings(1);
        setMealType("lunch");
        setShowManualInput(false);
        setSelectedRecentProduct(null);
        setQueuedScan(null);
      });
      // Reset deduplication refs on dialog open
      lastScannedBarcodeRef.current = null;
      lastScanTimeRef.current = 0;
      resetLookup();

      // Prime the barcode cache with recently scanned products
      // This allows instant lookups if user re-scans the same barcode
      if (recentlyScanned.length > 0) {
        primeBarcodeCache(recentlyScanned.map((item) => item.product));
      }
    }
  }, [open, resetLookup, recentlyScanned, primeBarcodeCache]);

  // Queue a scan when offline
  const handleQueueScan = useCallback(
    (barcode: string) => {
      const scan = queueScan(barcode, mealType, servings, date);
      setQueuedScan(scan);
    },
    [queueScan, mealType, servings, date]
  );

  // Handlers
  const handleScan = useCallback(
    (barcode: string) => {
      if (showManualInput) return;

      // Request deduplication - prevent rapid duplicate scans from camera
      const now = Date.now();
      if (
        lastScannedBarcodeRef.current === barcode &&
        now - lastScanTimeRef.current < SCAN_DEBOUNCE_MS
      ) {
        // Same barcode scanned within debounce window, ignore
        return;
      }

      // Update deduplication refs
      lastScannedBarcodeRef.current = barcode;
      lastScanTimeRef.current = now;

      // If offline, queue the scan instead of looking up
      if (isOffline) {
        handleQueueScan(barcode);
        return;
      }

      lookupBarcode(barcode);
    },
    [lookupBarcode, showManualInput, isOffline, handleQueueScan]
  );

  const handleScannerError = useCallback((error: ScannerError) => {
    setCameraError(error);
  }, []);

  const handleClose = useCallback(() => {
    if (!createEntryMutation.isPending) {
      onOpenChange(false);
    }
  }, [createEntryMutation.isPending, onOpenChange]);

  const handleTryAgain = useCallback(() => {
    startTransition(() => {
      setCameraError(null);
      setShowManualInput(false);
      setSelectedRecentProduct(null);
      setQueuedScan(null);
    });
    // Reset deduplication refs so user can re-scan same barcode
    lastScannedBarcodeRef.current = null;
    lastScanTimeRef.current = 0;
    resetLookup();
  }, [resetLookup]);

  // Select a product from recently scanned (skip lookup)
  const handleSelectRecent = useCallback((recentProduct: ScannedProduct) => {
    setSelectedRecentProduct(recentProduct);
  }, []);

  const handleManualSubmit = useCallback(
    (barcode: string) => {
      // If offline, queue the scan instead of looking up
      if (isOffline) {
        handleQueueScan(barcode);
        return;
      }
      lookupBarcode(barcode);
    },
    [lookupBarcode, isOffline, handleQueueScan]
  );

  const handleAddToDiary = useCallback(async () => {
    if (!product) return;

    try {
      await createEntryMutation.mutateAsync({
        userId,
        date,
        mealType,
        quantityG: product.servingSizeG * servings,
        servings,
        product: {
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          caloriesPer100g: product.caloriesPer100g,
          proteinG: product.proteinG,
          carbsG: product.carbsG,
          fatG: product.fatG,
          fiberG: product.fiberG,
          sugarG: product.sugarG,
          sodiumMg: product.sodiumMg,
          servingSizeG: product.servingSizeG,
          source: product.source,
          verified: product.verified,
        },
      });

      // Add to recently scanned for quick re-access
      addRecentItem(product);

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add to diary:", error);
      setCameraError({
        type: "api_error",
        message: "Failed to add food to diary. Please try again.",
      });
    }
  }, [
    product,
    createEntryMutation,
    userId,
    date,
    mealType,
    servings,
    addRecentItem,
    onSuccess,
    onOpenChange,
  ]);

  const toggleManualInput = useCallback(() => {
    setShowManualInput((prev) => !prev);
  }, []);

  return {
    // State
    state,
    product,
    scannedBarcode,
    displayError,
    showManualInput,
    isLookingUp,
    isAddingToDiary: createEntryMutation.isPending,

    // Camera permission
    cameraPermission,
    requestCameraPermission,
    cameraPermissionError,

    // Offline queue
    isOffline,
    queuedScan,
    pendingQueueCount,
    isSyncing,

    // Form state
    servings,
    setServings,
    mealType,
    setMealType,

    // Recently scanned
    recentlyScanned,
    handleSelectRecent,
    handleRemoveRecent: removeRecentItem,
    handleClearRecent: clearRecentItems,

    // Handlers
    handleScan,
    handleScannerError,
    handleClose,
    handleTryAgain,
    handleManualSubmit,
    handleAddToDiary,
    handleQueueScan,
    toggleManualInput,
  };
}
