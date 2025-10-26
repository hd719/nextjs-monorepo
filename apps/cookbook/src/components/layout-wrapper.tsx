"use client";

import { cn } from "@/app/utils/utils";
import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
  nav: React.ReactNode;
}

export function LayoutWrapper({ children, nav }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <div
        className={cn(
          "flex w-full flex-1 flex-col",
          process.env.NEXT_PUBLIC_DEBUG && "border-2 border-blue-600"
        )}
      >
        {nav}
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col items-center",
        process.env.NEXT_PUBLIC_DEBUG && "border-2 border-blue-600"
      )}
    >
      {nav}
      <div
        className={cn(
          "flex w-full flex-col",
          process.env.NEXT_PUBLIC_DEBUG && "border-4 border-purple-600"
        )}
      >
        {children}
      </div>
    </div>
  );
}
