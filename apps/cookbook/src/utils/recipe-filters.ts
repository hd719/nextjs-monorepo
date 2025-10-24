import { Recipe } from "@/types/recipe";

export type StatusFilter = "all" | "published" | "draft";
export type SortBy = "title" | "updated_at" | "created_at";
export type SortOrder = "asc" | "desc";

export interface RecipeFilters {
  searchTerm: string;
  statusFilter: StatusFilter;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export function filterAndSortRecipes(
  recipes: Recipe[],
  filters: RecipeFilters
): Recipe[] {
  const { searchTerm, statusFilter, sortBy, sortOrder } = filters;

  return recipes
    .filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && recipe.is_published) ||
        (statusFilter === "draft" && !recipe.is_published);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "updated_at":
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
}

export function paginateRecipes(
  recipes: Recipe[],
  currentPage: number,
  itemsPerPage: number
) {
  const totalPages = Math.ceil(recipes.length / itemsPerPage);
  const paginatedRecipes = recipes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    paginatedRecipes,
    totalPages,
    totalItems: recipes.length,
  };
}
