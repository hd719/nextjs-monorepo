"use client";

import { useState } from "react";

import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserInfo {
  id: string;
  email: string;
  name: string;
}

interface AdminLayoutClientProps {
  user: UserInfo;
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items
  const navigation = [
    { name: "Dashboard", href: "/admin", icon: "🏠" },
    { name: "All Recipes", href: "/admin/recipes", icon: "📝" },
    { name: "Published", href: "/admin/recipes/published", icon: "🌟" },
    { name: "Drafts", href: "/admin/recipes/drafts", icon: "📄" },
    { name: "Create Recipe", href: "/admin/recipes/new", icon: "➕" },
  ];

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "Admin", href: "/admin" }];

    let currentPath = "";
    segments.slice(1).forEach((segment) => {
      currentPath += `/${segment}`;
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        name: name.replace("-", " "),
        href: `/admin${currentPath}`,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleSignOut = async () => {
    await signOutAction();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <h1 className="text-xl font-bold text-gray-900">Recipe Admin</h1>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-r-2 border-blue-700 bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info and logout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start px-3 py-2"
              >
                <div className="flex w-full items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-gray-900">
                      {user.name}
                    </span>
                    <span className="truncate text-xs text-gray-500">
                      {user.email}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>
                <span className="mr-2">👤</span>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">⚙️</span>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600"
              >
                <span className="mr-2">🚪</span>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Top bar - Mobile only */}
        <div className="border-b border-gray-200 bg-white shadow-sm lg:hidden">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            {/* Mobile menu button */}
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:px-8 lg:py-6">{children}</main>
      </div>
    </div>
  );
}
