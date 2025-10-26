"use client";

import React, { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/app/actions";
import { MenuIcon, XIcon } from "@/components/icons";
import RecipeSearch from "@/components/RecipeSearch";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types/recipe";
import classNames from "classnames";
import Link from "next/link";

interface HeaderProps {
  userEmail?: string;
  recipes?: Recipe[];
}

const Header: React.FC<HeaderProps> = ({ userEmail, recipes = [] }) => {
  const navItemsDOM = useRef<HTMLDivElement | null>(null);
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    const handleMobileNavClickOutside = (event: MouseEvent) => {
      const navItemsEl = navItemsDOM.current;

      if (navItemsEl && !navItemsEl.contains(event.target as Node)) {
        setShowMobileNav(false);
      }
    };

    if (showMobileNav) {
      document.addEventListener("click", handleMobileNavClickOutside);
    } else {
      document.removeEventListener("click", handleMobileNavClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleMobileNavClickOutside);
    };
  }, [showMobileNav]);

  return (
    <header className="relative z-50 w-full bg-appAccent">
      <nav className="w-full">
        <div className="container mx-auto">
          <div className="relative flex items-center justify-between py-[13px] max-md:justify-center md:py-4">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex max-md:absolute max-md:-bottom-[50px] max-md:left-0 md:mr-8"
                aria-label="Home page"
              >
                <div className="text-lg font-semibold text-white md:text-xl">
                  Payal's Cookbook
                </div>
              </Link>
              {/* Primary nav link for desktop */}
              <Link
                href="/recipes"
                className="text-sm leading-none tracking-[-0.41px] text-appAccent-100 underline transition-colors duration-300 hover:text-white focus-visible:text-white max-md:hidden"
              >
                Browse Recipes
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 max-md:absolute max-md:-bottom-[54px] max-md:right-0 md:hidden"
              aria-label="Toggle mobile nav"
              onClick={() => setShowMobileNav((prev) => !prev)}
            >
              {showMobileNav ? (
                <XIcon className="flex h-[18px] w-[18px] text-appAccent" />
              ) : (
                <MenuIcon className="flex h-[18px] w-[18px]" />
              )}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-6 md:flex">
              {/* Search Bar - Desktop */}
              <div className="w-64">
                <RecipeSearch
                  recipes={recipes}
                  size="regular"
                  static={true}
                  className="w-full"
                />
              </div>

              {userEmail ? (
                <>
                  <Link
                    href="/admin"
                    className="text-sm font-medium leading-none tracking-[-0.41px] text-appAccent-100 transition-colors duration-300 hover:text-white focus-visible:text-white"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/admin/recipes/new"
                    className="text-sm font-medium leading-none tracking-[-0.41px] text-appAccent-100 transition-colors duration-300 hover:text-white focus-visible:text-white"
                  >
                    Create Recipe
                  </Link>
                  <span className="text-sm text-appAccent-100">
                    Hey, {userEmail}!
                  </span>
                  <form action={signOutAction} className="inline">
                    <Button type="submit" variant="secondary" size="sm">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                  <Button asChild size="sm" variant="default">
                    <Link href="/sign-up">Sign up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Navigation Menu */}
            <div
              ref={navItemsDOM}
              className={classNames(
                "flex flex-col items-center gap-6 md:hidden",
                {
                  "max-md:absolute max-md:-bottom-16 max-md:right-0 max-md:min-w-[280px] max-md:translate-y-full max-md:rounded max-md:bg-white max-md:px-4 max-md:py-6 max-md:shadow-lg":
                    showMobileNav,
                },
                { "max-md:hidden": !showMobileNav }
              )}
            >
              {/* Search Bar - Mobile */}
              <div className="w-full">
                <RecipeSearch
                  recipes={recipes}
                  size="regular"
                  static={true}
                  className="w-full"
                />
              </div>

              <Link
                href="/recipes"
                className="text-sm font-medium leading-none tracking-[-0.41px] text-appAccent transition-colors duration-300 hover:text-appAccent/70"
                onClick={() => setShowMobileNav(false)}
              >
                Browse Recipes
              </Link>

              {userEmail ? (
                <>
                  <Link
                    href="/admin"
                    className="text-sm font-medium leading-none tracking-[-0.41px] text-appAccent transition-colors duration-300 hover:text-appAccent/70"
                    onClick={() => setShowMobileNav(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/admin/recipes/new"
                    className="text-sm font-medium leading-none tracking-[-0.41px] text-appAccent transition-colors duration-300 hover:text-appAccent/70"
                    onClick={() => setShowMobileNav(false)}
                  >
                    Create Recipe
                  </Link>
                  <Link
                    href="/admin/recipes"
                    className="text-sm font-medium leading-none tracking-[-0.41px] text-appAccent transition-colors duration-300 hover:text-appAccent/70"
                    onClick={() => setShowMobileNav(false)}
                  >
                    Manage Recipes
                  </Link>
                  <div className="text-xs text-appAccent/70">
                    Hey, {userEmail}!
                  </div>
                  <form action={signOutAction} className="w-full">
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="default"
                    className="w-full"
                  >
                    <Link href="/sign-up">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
