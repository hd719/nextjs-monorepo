"use client";

import React, { useRef } from "react";

import { SearchIcon } from "@/components/icons";
import { useRecipeSearch } from "@/hooks/useRecipeSearch";
import { Recipe } from "@/types/recipe";
import classNames from "classnames";
import Link from "next/link";
import { Transition } from "react-transition-group";

interface RecipeSearchProps {
  value?: string;
  recipes?: Recipe[];
  static?: boolean;
  size?: "regular" | "lg";
  showResults?: boolean;
  onInput?: (value: string) => void;
  onEnter?: (value: string) => void;
  className?: string;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({
  value = "",
  recipes = [],
  static: isStatic = false,
  size = "regular",
  showResults = true,
  onInput,
  onEnter,
  className = "",
}) => {
  const transitionRef = useRef(null);

  // Use our custom hook for all search logic
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
    initialValue: value,
    onInput,
    onEnter,
  });

  return (
    <div className={classNames("relative", className)}>
      <form action={handleSearchAction}>
        <label
          className={classNames(
            "flex w-full items-center rounded-lg border bg-white px-4 transition-colors duration-300 focus-within:border-appAccent",
            {
              "border-[#DEDEDE]": isStatic,
              "border-transparent": !isStatic,
              "lg:px-6": size === "lg",
              "opacity-75": isPending, // React 19: Show loading state
            }
          )}
          style={{
            filter: !isStatic
              ? "drop-shadow(0px 0px 8px rgba(10, 34, 19, 0.25))"
              : "",
          }}
        >
          <SearchIcon
            className={classNames("h-5 w-5 text-appGray-400", {
              "lg:h-6 lg:w-6": size === "lg",
              "animate-pulse": isPending, // React 19: Loading animation
            })}
          />
          <div className="relative flex-1">
            <input
              name="search"
              value={currentSearchValue}
              placeholder="Search recipes"
              className={classNames(
                "w-full bg-transparent px-1.5 py-3 text-sm font-medium leading-none tracking-[-0.41px] text-appGray-700 placeholder:text-appGray-400 focus:outline-none",
                {
                  "lg:px-2.5 lg:py-[18px] lg:text-base lg:leading-none":
                    size === "lg",
                }
              )}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isPending} // React 19: Disable during transitions
            />
            {/* Autocomplete suggestion overlay */}
            {hasResults && showResults && hasQuery && placeholderSuggestion && (
              <span className="pointer-events-none absolute left-[7px] top-1/2 translate-y-[calc(-50%-1px)] text-sm font-medium leading-none tracking-[-0.41px]">
                <span className="opacity-0">{currentSearchValue}</span>
                <span className="text-appGray-400">
                  {placeholderSuggestion.slice(currentSearchValue.length)}
                </span>
              </span>
            )}
          </div>
        </label>
      </form>

      {/* Search results dropdown */}
      <Transition
        appear={true}
        mountOnEnter={true}
        unmountOnExit={true}
        nodeRef={transitionRef}
        in={showResults && hasQuery}
        timeout={300}
      >
        {(state) => (
          <div
            ref={transitionRef}
            className={classNames(
              "absolute -bottom-1 left-0 z-50 grid max-h-[200px] w-full translate-y-full grid-cols-1 gap-px overflow-hidden overflow-y-auto rounded-lg border border-[#EBEBEB] bg-[#EBEBEB]",
              {
                hidden: !hasQuery || !hasResults,
              },
              `fade-${state}`
            )}
          >
            {hasResults ? (
              filteredRecipes.slice(0, 5).map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  onClick={clearSearch}
                  className="flex bg-white px-4 py-3 text-sm font-medium leading-none tracking-[-0.41px] text-appGray-500 transition-colors duration-300 hover:bg-appGray-100 hover:text-appAccent"
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
                        <span className="text-xs text-appAccent">
                          {recipe.category}
                        </span>
                      )}
                      {recipe.cuisine && (
                        <span className="text-xs text-appAccent">
                          {recipe.cuisine}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex bg-white px-4 py-3 text-sm font-medium leading-none tracking-[-0.41px] text-appGray-500">
                No recipes found for "{currentSearchValue}"
              </div>
            )}
          </div>
        )}
      </Transition>
    </div>
  );
};

export default RecipeSearch;
