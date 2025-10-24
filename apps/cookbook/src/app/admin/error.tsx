"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin page error:", error);
  }, [error]);

  return (
    <div className="bg-gradient-light min-h-screen">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="bg-error-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-neutral-900">
              Something went wrong in the admin area
            </h1>
            <p className="text-neutral-600">
              We encountered an unexpected error while loading this admin page.
              This has been logged and our team will investigate.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-error-50 rounded-lg p-4 text-left">
              <h3 className="text-error-900 mb-2 font-medium">
                Error Details:
              </h3>
              <p className="text-error-700 font-mono text-sm">
                {error.message || "Unknown error occurred"}
              </p>
              {error.digest && (
                <p className="text-error-600 mt-1 font-mono text-xs">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={reset} className="btn-primary">
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin">Back to Admin Dashboard</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/">Go to Home</a>
              </Button>
            </div>
          </div>

          <div className="mt-6 text-sm text-neutral-500">
            <p>
              If this problem persists, please contact support with the error ID
              above.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
