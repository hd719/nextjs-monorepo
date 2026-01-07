"use client";

import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

const Dialog = AlertDialogPrimitive.Root;

const DialogTrigger = AlertDialogPrimitive.Trigger;

const DialogPortal = AlertDialogPrimitive.Portal;

export interface DialogOverlayProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Overlay
> {}

const DialogOverlay = forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
DialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

export interface DialogContentProps extends Omit<
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
  "onInteractOutside"
> {
  closeOnOutsideClick?: boolean;
  onClose?: () => void;
}

const DialogContent = forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  DialogContentProps
>(({ className, closeOnOutsideClick = false, onClose, ...props }, ref) => {
  const contentProps = {
    ref,
    className: cn(
      "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
      className
    ),
    ...props,
    ...(closeOnOutsideClick && onClose
      ? { onInteractOutside: () => onClose() }
      : {}),
  };

  return (
    <DialogPortal>
      <DialogOverlay
        onClick={closeOnOutsideClick && onClose ? onClose : undefined}
      />
      <AlertDialogPrimitive.Content {...contentProps} />
    </DialogPortal>
  );
});
DialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

export interface DialogTitleProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Title
> {}

const DialogTitle = forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Title>,
  DialogTitleProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
DialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

export interface DialogDescriptionProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Description
> {}

const DialogDescription = forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

export interface DialogActionProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Action
> {}

const DialogAction = forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Action>,
  DialogActionProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground ring-offset-background transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
DialogAction.displayName = AlertDialogPrimitive.Action.displayName;

export interface DialogCancelProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Cancel
> {}

const DialogCancel = forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Cancel>,
  DialogCancelProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
DialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogAction,
  DialogCancel,
};
