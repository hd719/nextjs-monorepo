"use client";

import { formatDistanceToNow } from "date-fns";
import { Package, X, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScannedProduct } from "@/types";
import type { RecentlyScannedItem } from "@/hooks";

interface RecentlyScannedProps {
  items: RecentlyScannedItem[];
  onSelect: (product: ScannedProduct) => void;
  onRemove: (barcode: string) => void;
  onClearAll: () => void;
}

export function RecentlyScanned({
  items,
  onSelect,
  onRemove,
  onClearAll,
}: RecentlyScannedProps) {
  if (items.length === 0) {
    return (
      <div className="recently-scanned-empty">
        <Clock className="recently-scanned-empty-icon" aria-hidden="true" />
        <p className="recently-scanned-empty-text">No recently scanned items</p>
        <p className="recently-scanned-empty-subtext">
          Scanned products will appear here for quick access
        </p>
      </div>
    );
  }

  return (
    <div className="recently-scanned">
      <div className="recently-scanned-header">
        <h3 className="recently-scanned-title">
          <Clock className="icon-sm" aria-hidden="true" />
          Recently Scanned
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="recently-scanned-clear-btn"
        >
          <Trash2 className="icon-sm" aria-hidden="true" />
          Clear all
        </Button>
      </div>

      <div className="recently-scanned-grid">
        {items.map(({ product, scannedAt }) => (
          <RecentlyScannedCard
            key={product.barcode}
            product={product}
            scannedAt={scannedAt}
            onSelect={() => onSelect(product)}
            onRemove={() => onRemove(product.barcode)}
          />
        ))}
      </div>
    </div>
  );
}

interface RecentlyScannedCardProps {
  product: ScannedProduct;
  scannedAt: string;
  onSelect: () => void;
  onRemove: () => void;
}

function RecentlyScannedCard({
  product,
  scannedAt,
  onSelect,
  onRemove,
}: RecentlyScannedCardProps) {
  const timeAgo = formatDistanceToNow(new Date(scannedAt), { addSuffix: true });

  return (
    <div className="recently-scanned-card">
      <button
        type="button"
        className="recently-scanned-card-content"
        onClick={onSelect}
        aria-label={`Select ${product.name}`}
      >
        <div className="recently-scanned-card-image">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="recently-scanned-card-img"
            />
          ) : (
            <Package
              className="recently-scanned-card-placeholder"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="recently-scanned-card-info">
          <span className="recently-scanned-card-name">{product.name}</span>
          {product.brand && (
            <span className="recently-scanned-card-brand">{product.brand}</span>
          )}
          <span className="recently-scanned-card-calories">
            {product.caloriesPer100g} cal/100g
          </span>
          <span className="recently-scanned-card-time">{timeAgo}</span>
        </div>
      </button>
      <button
        type="button"
        className="recently-scanned-card-remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${product.name} from history`}
      >
        <X className="icon-sm" aria-hidden="true" />
      </button>
    </div>
  );
}
