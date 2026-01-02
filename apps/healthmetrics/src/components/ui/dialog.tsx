"use client";

import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
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

export interface DialogContentProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Content
> {}

const DialogContent = forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  DialogContentProps
>(({ className, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </DialogPortal>
));
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
};
