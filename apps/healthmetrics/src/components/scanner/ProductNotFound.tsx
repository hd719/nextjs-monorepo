"use client";

import { ScanBarcode, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductNotFoundProps {
  barcode?: string | null;
  onTryAgain: () => void;
  onSearchManually: () => void;
}

export function ProductNotFound({
  barcode,
  onTryAgain,
  onSearchManually,
}: ProductNotFoundProps) {
  return (
    <div className="scanner-not-found">
      <div className="scanner-not-found-icon">
        <ScanBarcode
          className="scanner-not-found-icon-svg"
          aria-hidden="true"
        />
      </div>
      <h3 className="scanner-not-found-title">Product Not Found</h3>
      {barcode && <p className="scanner-not-found-barcode">{barcode}</p>}
      <p className="scanner-not-found-message">
        We couldn&apos;t find this product in our database. You can try scanning
        again or search for the food manually.
      </p>
      <div className="scanner-not-found-actions">
        <Button onClick={onTryAgain} variant="outline">
          <ScanBarcode className="icon-sm mr-2" aria-hidden="true" />
          Scan Again
        </Button>
        <Button onClick={onSearchManually}>
          <Search className="icon-sm mr-2" aria-hidden="true" />
          Search Manually
        </Button>
      </div>
    </div>
  );
}
