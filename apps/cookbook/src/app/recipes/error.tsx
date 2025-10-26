"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function RecipesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Recipe page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
            <span className="text-2xl">🍳</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">
            Recipe Not Available
          </h1>
          <p className="text-neutral-600">
            We're having trouble loading this recipe right now. This might be a
            temporary issue with our kitchen servers!
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-error-50 p-4 text-left">
            <h3 className="mb-2 font-medium text-error-900">What happened:</h3>
            <p className="font-mono text-sm text-error-700">
              {error.message || "Unable to load recipe data"}
            </p>
            {error.digest && (
              <p className="mt-1 font-mono text-xs text-error-600">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={reset} className="btn-primary">
              Try Loading Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Browse All Recipes</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 text-sm text-neutral-500">
          <p>
            If you keep seeing this error, the recipe might have been removed or
            there could be a temporary server issue.
          </p>
        </div>
      </Card>
    </div>
  );
}
