"use client";

import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Menu, PlusCircle, Settings } from "lucide-react";
import Link from "next/link";

type NavClientProps = {
  userEmail: string;
};

export default function NavClient({
  userEmail,
}: NavClientProps): React.JSX.Element {
  return userEmail ? (
    <div className="flex items-center gap-4">
      {/* Mobile Navigation */}
      <div className="flex items-center md:hidden">
        <span className="mr-3">Hey, {userEmail}!</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="p-2">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/recipes/new" className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Recipe
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/recipes" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Recipes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOutAction} className="w-full">
                <Button
                  variant="ghost"
                  type="submit"
                  className="w-full justify-start p-0"
                >
                  Sign out
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden items-center gap-4 md:flex">
        <Link
          href="/admin"
          className="hover:text-primary-600 text-sm font-medium transition-colors"
        >
          Admin
        </Link>
        <Link
          href="/admin/recipes/new"
          className="hover:text-primary-600 text-sm font-medium transition-colors"
        >
          Create Recipe
        </Link>
        <span className="text-sm">Hey, {userEmail}!</span>
        <form action={signOutAction} className="inline">
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
