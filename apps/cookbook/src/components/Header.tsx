"use client";

import React, { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/app/actions";
import AnimatedSearch from "@/components/AnimatedSearch";
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
  const [, setIsSearchExpanded] = useState(false);

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

  // Handle search expansion change
  const handleSearchExpandChange = (expanded: boolean) => {
    // Don't hide nav elements immediately - let the search overlay cover them naturally
    // Only set the state for other purposes (like closing mobile nav)
    setIsSearchExpanded(expanded);

    // Close mobile nav when search expands
    if (expanded && showMobileNav) {
      setShowMobileNav(false);
    }
  };

  return (
    <header
      className="relative z-50 w-full bg-appAccent"
      style={{ "--header-height": "64px" } as React.CSSProperties}
    >
      <nav className="w-full">
        <div className="container mx-auto">
          <div className="relative flex items-center justify-between py-[13px] max-md:justify-center md:py-4">
            {/* Logo and Brand */}
            <div className="flex flex-shrink-0 items-center">
              <Link
                href="/"
                className="flex max-md:absolute max-md:-bottom-[50px] max-md:left-0 md:mr-6"
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

            {/* Mobile controls */}
            <div className="flex items-center gap-2 max-md:absolute max-md:-bottom-[54px] max-md:right-0 md:hidden">
              {/* Mobile Animated Search */}
              <AnimatedSearch
                recipes={recipes}
                onExpandChange={handleSearchExpandChange}
                className="flex-shrink-0"
              />

              {/* Mobile menu button */}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 transition-all duration-300 hover:bg-white hover:shadow-md"
                aria-label="Toggle mobile nav"
                onClick={() => setShowMobileNav((prev) => !prev)}
              >
                <div className="relative h-[18px] w-[18px]">
                  <XIcon
                    className={classNames(
                      "absolute inset-0 h-[18px] w-[18px] text-appAccent transition-all duration-300",
                      showMobileNav
                        ? "rotate-0 opacity-100"
                        : "rotate-90 opacity-0"
                    )}
                  />
                  <MenuIcon
                    className={classNames(
                      "absolute inset-0 h-[18px] w-[18px] transition-all duration-300",
                      showMobileNav
                        ? "-rotate-90 opacity-0"
                        : "rotate-0 opacity-100"
                    )}
                  />
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-4 md:flex md:flex-1 md:justify-end lg:gap-6">
              {/* Animated Search - Desktop */}
              <AnimatedSearch
                recipes={recipes}
                onExpandChange={handleSearchExpandChange}
                className="flex-shrink-0"
              />

              {userEmail ? (
                <>
                  <Link
                    href="/admin"
                    className="text-sm font-medium leading-none tracking-[-0.41px] text-appAccent-100 transition-colors duration-300 hover:text-white focus-visible:text-white max-md:hidden"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/admin/recipes/new"
                    className="text-sm font-medium leading-none tracking-[-0.41px] text-appAccent-100 transition-colors duration-300 hover:text-white focus-visible:text-white max-md:hidden"
                  >
                    Create Recipe
                  </Link>
                  <span className="text-sm text-appAccent-100 max-md:hidden">
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
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="flex-shrink-0"
                  >
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="default"
                    className="flex-shrink-0"
                  >
                    <Link href="/sign-up">Sign up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Navigation Menu */}
            {/* Mobile Navigation Menu - Only render when needed */}
            {showMobileNav && (
              <div
                ref={navItemsDOM}
                className="absolute -bottom-16 right-0 flex min-w-[280px] translate-y-full flex-col items-center gap-6 rounded bg-white px-4 py-6 shadow-lg transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2 md:hidden"
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
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
