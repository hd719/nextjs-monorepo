"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ManualBarcodeInputProps {
  onSubmit: (barcode: string) => void;
  isLoading?: boolean;
}

// Barcode validation: must be 8-14 digits (covers EAN-8, EAN-13, UPC-A, UPC-E)
const isValidBarcode = (value: string): boolean => {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length >= 8 && digitsOnly.length <= 14;
};

export function ManualBarcodeInput({
  onSubmit,
  isLoading = false,
}: ManualBarcodeInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow digits
    const digitsOnly = input.replace(/\D/g, "");
    setValue(digitsOnly);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setValue("");
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!value.trim()) {
        setError("Please enter a barcode");
        return;
      }

      if (!isValidBarcode(value)) {
        setError("Barcode must be 8-14 digits");
        return;
      }

      onSubmit(value);
    },
    [value, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="scanner-manual-input-form">
      <div className="scanner-manual-input-wrapper">
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Enter barcode number"
          value={value}
          onChange={handleChange}
          disabled={isLoading}
          className="scanner-manual-input"
          aria-label="Barcode number"
          aria-invalid={!!error}
          aria-describedby={error ? "barcode-error" : undefined}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="scanner-manual-input-clear"
            aria-label="Clear input"
          >
            <X className="icon-sm" />
          </button>
        )}
      </div>
      {error && (
        <p id="barcode-error" className="scanner-manual-input-error">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isLoading || !value}>
        {isLoading ? "Looking up..." : "Look up"}
      </Button>
    </form>
  );
}
