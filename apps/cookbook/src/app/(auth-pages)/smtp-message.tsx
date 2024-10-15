"use client";

import { InfoIcon } from "lucide-react";

export function SmtpMessage() {
  return (
    <div className="w-ful mt-5 flex w-full gap-4 rounded-md border bg-muted/50 px-5 py-3">
      <InfoIcon size={16} className="mt-0.5" />
      <div className="flex gap-1">
        <small className="text-sm text-secondary-foreground">
          <strong> Note:</strong> Not taking any new signups at the moment
        </small>
      </div>
    </div>
  );
}
