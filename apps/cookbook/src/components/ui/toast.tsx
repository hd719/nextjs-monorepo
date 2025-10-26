"use client";

import { useEffect, useState } from "react";

import { cn } from "@/app/utils/utils";
import { AlertCircle, CheckCircle, X } from "lucide-react";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface ToastProps extends Toast {
  onRemove: (id: string) => void;
}

export function ToastComponent({
  id: toastId,
  title,
  description,
  type,
  duration = 5000,
  onRemove,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toastId), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toastId, duration, onRemove]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toastId), 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div
      className={cn(
        "pointer-events-auto w-max min-w-[240px] max-w-[min(600px,90vw)] overflow-hidden rounded-lg border shadow-lg transition-all duration-300 sm:min-w-[320px]",
        getStyles(),
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 transform flex-col space-y-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} {...toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    success: (title: string, description?: string, duration?: number) =>
      addToast({ title, description, type: "success", duration }),
    error: (title: string, description?: string, duration?: number) =>
      addToast({ title, description, type: "error", duration }),
    info: (title: string, description?: string, duration?: number) =>
      addToast({ title, description, type: "info", duration }),
  };

  return {
    toasts,
    toast,
    removeToast,
  };
}
