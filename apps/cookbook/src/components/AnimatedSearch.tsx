"use client";

import React from "react";

import { SearchIcon, XIcon } from "@/components/icons";
import { useAnimatedSearch } from "@/hooks/useAnimatedSearch";
import { useRecipeSearch } from "@/hooks/useRecipeSearch";
import { Recipe } from "@/types/recipe";
import classNames from "classnames";
import Link from "next/link";

interface AnimatedSearchProps {
  recipes?: Recipe[];
  className?: string;
  onExpandChange?: (isExpanded: boolean) => void;
}

/**
 * AnimatedSearch component that transforms the nav bar into a search interface
 * When collapsed: shows a search icon
 * When expanded: overlays the entire nav bar with a search input
 */
const AnimatedSearch: React.FC<AnimatedSearchProps> = ({
  recipes = [],
  className = "",
  onExpandChange,
}) => {
  const {
    isExpanded,
    isAnimating,
    searchRef,
    inputRef,
    expandSearch,
    collapseSearch,
  } = useAnimatedSearch({
    onExpandChange,
  });

  const {
    currentSearchValue,
    isPending,
    filteredRecipes,
    placeholderSuggestion,
    handleSearchAction,
    handleInputChange,
    handleKeyDown,
    clearSearch,
    hasResults,
    hasQuery,
  } = useRecipeSearch({
    recipes,
    initialValue: "",
    onInput: undefined,
    onEnter: undefined,
  });

  // Handle closing search and clearing results
  const handleClose = () => {
    clearSearch();
    collapseSearch();
  };

  // Handle search key events
  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Escape") {
      handleClose();
      return;
    }
    handleKeyDown(event);
  };

  return (
    <div ref={searchRef} className={classNames("relative", className)}>
      {/* Collapsed State - Search Icon */}
      {!isExpanded && (
        <button
          onClick={expandSearch}
          disabled={isAnimating}
          className="group flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-200 hover:scale-110 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-appAccent disabled:opacity-50 md:flex"
          aria-label="Open search"
        >
          <SearchIcon className="h-5 w-5 text-appAccent-100 transition-transform duration-200 group-hover:scale-110" />
        </button>
      )}

      {/* Expanded State - Transform Nav Bar into Search */}
      {isExpanded && (
        <div className="fixed inset-x-0 top-0 z-[60] h-16 bg-appAccent shadow-lg transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2">
          <div className="container mx-auto h-full">
            <div className="flex h-full items-center px-4">
              {/* Search Form - replaces entire nav content */}
              <form action={handleSearchAction} className="flex-1">
                <div className="flex h-12 w-full items-center rounded-lg border border-white/20 bg-white px-4 shadow-xl transition-all duration-200 focus-within:border-white/40 focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-white/20">
                  <SearchIcon
                    className={classNames("mr-3 h-5 w-5 text-appAccent", {
                      "animate-pulse": isPending,
                    })}
                  />

                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      name="search"
                      value={currentSearchValue}
                      placeholder="Search recipes..."
                      aria-label="Search for recipes"
                      className="w-full bg-transparent text-base font-medium leading-none tracking-[-0.41px] text-appGray-700 placeholder:text-appGray-400 focus:outline-none md:text-lg"
                      onChange={handleInputChange}
                      onKeyDown={handleSearchKeyDown}
                      disabled={isPending}
                    />

                    {/* Autocomplete Suggestion */}
                    {hasResults && hasQuery && placeholderSuggestion && (
                      <span className="pointer-events-none absolute left-0 top-0 text-base font-medium leading-none tracking-[-0.41px] md:text-lg">
                        <span className="opacity-0">{currentSearchValue}</span>
                        <span className="text-appGray-400">
                          {placeholderSuggestion.slice(
                            currentSearchValue.length
                          )}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-appGray-200/50 transition-all duration-200 hover:scale-110 hover:bg-appGray-200 focus:outline-none focus:ring-2 focus:ring-appAccent/50"
                    aria-label="Close search"
                  >
                    <XIcon className="h-4 w-4 text-appAccent" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Search Results Dropdown */}
          <div className="container mx-auto">
            {hasQuery && (
              <div
                className={classNames(
                  "absolute left-4 right-4 top-full z-50 mt-2 max-h-96 overflow-hidden overflow-y-auto rounded-lg border border-white/20 bg-white shadow-xl transition-all duration-200 ease-in-out md:left-4 md:right-4",
                  {
                    "pointer-events-none scale-95 opacity-0": !hasResults,
                    "pointer-events-auto scale-100 opacity-100": hasResults,
                  }
                )}
              >
                {hasResults ? (
                  <div className="grid grid-cols-1 gap-px bg-appGray-200/20">
                    {filteredRecipes.slice(0, 6).map((recipe) => (
                      <Link
                        key={recipe.id}
                        href={`/recipes/${recipe.slug}`}
                        onClick={handleClose}
                        className="flex bg-white/90 px-4 py-3 text-sm font-medium leading-none tracking-[-0.41px] text-appGray-500 transition-colors duration-200 hover:bg-white hover:text-appAccent"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-appGray-700">
                            {recipe.title}
                          </div>
                          {recipe.description && (
                            <div className="mt-1 line-clamp-1 text-xs text-appGray-500">
                              {recipe.description}
                            </div>
                          )}
                          <div className="mt-1 flex gap-2">
                            {recipe.category && (
                              <span className="rounded-full bg-appAccent/10 px-2 py-0.5 text-xs font-medium text-appAccent">
                                {recipe.category}
                              </span>
                            )}
                            {recipe.cuisine && (
                              <span className="rounded-full bg-appAccent/10 px-2 py-0.5 text-xs font-medium text-appAccent">
                                {recipe.cuisine}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex bg-white/90 px-4 py-6 text-center">
                    <div className="w-full">
                      <div className="text-sm font-medium text-appGray-700">
                        No recipes found
                      </div>
                      <div className="mt-1 text-xs text-appGray-500">
                        Try searching for &quot;{currentSearchValue}&quot; with different
                        keywords
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedSearch;
