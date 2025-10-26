/**
 * Pagination utility functions
 */

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  maxVisiblePages?: number;
}

export interface PaginationResult {
  visiblePages: (number | string)[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  totalPages: number;
}

/**
 * Calculate total number of pages based on total items and items per page
 */
export function calculateTotalPages(
  totalItems: number,
  itemsPerPage: number
): number {
  return Math.ceil(totalItems / itemsPerPage);
}

/**
 * Calculate pagination slice indices for array slicing
 */
export function calculatePaginationSlice(
  currentPage: number,
  itemsPerPage: number
): { startIndex: number; endIndex: number } {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return { startIndex, endIndex };
}

/**
 * Generate visible page numbers with ellipsis for large page ranges
 * Returns an array of page numbers and ellipsis strings
 */
export function generateVisiblePages(
  config: PaginationConfig
): (number | string)[] {
  const { currentPage, totalPages, maxVisiblePages = 5 } = config;
  const pages: (number | string)[] = [];

  // If total pages is less than or equal to max visible, show all pages
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Always show first page
  pages.push(1);

  // Add ellipsis if current page is far from start
  if (currentPage > 3) {
    pages.push("...");
  }

  // Show pages around current page
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }

  // Add ellipsis if current page is far from end
  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  // Always show last page
  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Get complete pagination state and navigation helpers
 */
export function getPaginationState(config: PaginationConfig): PaginationResult {
  const { currentPage, totalPages } = config;

  return {
    visiblePages: generateVisiblePages(config),
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
    totalPages,
  };
}

/**
 * Validate and normalize page number
 */
export function normalizePage(page: number, totalPages: number): number {
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return Math.floor(page);
}

/**
 * Check if pagination should be shown
 */
export function shouldShowPagination(totalPages: number): boolean {
  return totalPages > 1;
}
