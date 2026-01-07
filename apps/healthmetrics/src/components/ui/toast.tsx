"use client";

import { useEffect, useState } from "react";

import { cn } from "@/utils/cn";
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
        return <CheckCircle className="toast-icon toast-icon-success" />;
      case "error":
        return <AlertCircle className="toast-icon toast-icon-error" />;
      default:
        return <AlertCircle className="toast-icon toast-icon-info" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "toast-success";
      case "error":
        return "toast-error";
      default:
        return "toast-info";
    }
  };

  return (
    <div
      className={cn(
        "toast-container",
        getStyles(),
        isVisible ? "toast-visible" : "toast-hidden"
      )}
    >
      <div className="toast-content">
        <div className="toast-body">
          <div className="toast-icon-wrapper">{getIcon()}</div>
          <div className="toast-text">
            <p className="toast-title">{title}</p>
            {description && <p className="toast-description">{description}</p>}
          </div>
          <div className="toast-close-wrapper">
            <button
              type="button"
              className="toast-close-button focus-ring"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="toast-close-icon" />
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
    <div className="toast-stack">
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
