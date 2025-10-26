"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <div className="mb-6">
            <div className="bg-error-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <span className="text-2xl">💥</span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-neutral-900">
              Something went wrong
            </h2>
            <p className="text-neutral-600">
              A component error occurred. This has been logged for
              investigation.
            </p>
          </div>

          {this.state.error && (
            <div className="bg-error-50 mb-6 rounded-lg p-4 text-left">
              <h3 className="text-error-900 mb-2 font-medium">
                Error Details:
              </h3>
              <p className="text-error-700 font-mono text-sm">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={this.handleReset} className="btn-primary">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Simple error fallback component
 */
export function SimpleErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="border-error-200 bg-error-50 rounded-lg border p-4 text-center">
      <p className="text-error-900 mb-2 font-medium">Something went wrong:</p>
      <p className="text-error-700 mb-4 text-sm">{error.message}</p>
      <Button size="sm" onClick={resetError} variant="outline">
        Try again
      </Button>
    </div>
  );
}
