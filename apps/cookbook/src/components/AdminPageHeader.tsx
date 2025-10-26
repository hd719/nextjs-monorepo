import React from "react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode; // For buttons or other actions
}

export function AdminPageHeader({
  title,
  description,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="border-b border-primary-200 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
          <p className="mt-2 text-neutral-600">{description}</p>
        </div>
        {children && (
          <div className="ml-6 flex items-center space-x-4">{children}</div>
        )}
      </div>
    </div>
  );
}
