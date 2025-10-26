"use client";

import React from "react";

import { ChevronDownIcon } from "@/components/icons";
import {
  calculateTotalPages,
  getPaginationState,
  shouldShowPagination,
} from "@/utils/pagination";
import classNames from "classnames";

interface PaginationProps {
  recipesPerPage: number;
  totalRecipes: number;
  paginate: (page: number) => void;
  currentPage: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  recipesPerPage,
  totalRecipes,
  paginate,
  currentPage,
  className = "",
}) => {
  const totalPages = calculateTotalPages(totalRecipes, recipesPerPage);

  // Don't show pagination if there's only one page or no recipes
  if (!shouldShowPagination(totalPages)) {
    return null;
  }

  const paginationState = getPaginationState({
    currentPage,
    totalPages,
    maxVisiblePages: 5,
  });

  const handlePrevious = () => {
    if (paginationState.canGoPrevious) {
      paginate(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (paginationState.canGoNext) {
      paginate(currentPage + 1);
    }
  };

  return (
    <div
      className={classNames(
        "flex items-center justify-center gap-x-2 duration-500 animate-in fade-in lg:gap-x-4",
        className
      )}
    >
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={!paginationState.canGoPrevious}
        className={classNames(
          "flex h-8 w-8 items-center justify-center rounded-lg border border-[#F0F0F0] text-xs font-medium leading-none transition-colors duration-300 lg:h-12 lg:w-12 lg:text-xl lg:leading-none",
          {
            "cursor-pointer text-appAccent hover:bg-appGray-200":
              paginationState.canGoPrevious,
            "cursor-not-allowed text-appGray-400":
              !paginationState.canGoPrevious,
          }
        )}
        aria-label="Previous page"
      >
        <ChevronDownIcon className="h-3 w-3 rotate-90 lg:h-4 lg:w-4" />
      </button>

      {/* Page Numbers */}
      {paginationState.visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {typeof page === "number" ? (
            <button
              onClick={() => paginate(page)}
              className={classNames(
                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs font-medium leading-none transition-colors duration-300 lg:h-12 lg:w-12 lg:text-xl lg:leading-none",
                {
                  "border-appAccent bg-appAccent text-white":
                    currentPage === page,
                  "border-[#F0F0F0] text-appAccent hover:bg-appGray-200":
                    currentPage !== page,
                }
              )}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          ) : (
            <span className="flex h-8 w-8 cursor-default items-center justify-center rounded-lg border border-[#F0F0F0] text-xs font-medium leading-none text-appAccent lg:h-12 lg:w-12 lg:text-xl lg:leading-none">
              {page}
            </span>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!paginationState.canGoNext}
        className={classNames(
          "flex h-8 w-8 items-center justify-center rounded-lg border border-[#F0F0F0] text-xs font-medium leading-none transition-colors duration-300 lg:h-12 lg:w-12 lg:text-xl lg:leading-none",
          {
            "cursor-pointer text-appAccent hover:bg-appGray-200":
              paginationState.canGoNext,
            "cursor-not-allowed text-appGray-400": !paginationState.canGoNext,
          }
        )}
        aria-label="Next page"
      >
        <ChevronDownIcon className="h-3 w-3 -rotate-90 lg:h-4 lg:w-4" />
      </button>
    </div>
  );
};
