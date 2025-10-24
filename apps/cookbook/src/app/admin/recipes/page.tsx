"use client";

import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { mockRecipes } from "@/data/mock-recipes";
import { useOptimisticRecipes } from "@/hooks/use-optimistic-recipes";
import { createRecipeActions } from "@/utils/recipe-actions";
import {
  filterAndSortRecipes,
  paginateRecipes,
  type SortBy,
  type SortOrder,
  type StatusFilter,
} from "@/utils/recipe-filters";
import Link from "next/link";

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState(mockRecipes);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const { optimisticRecipes, addOptimisticUpdate } =
    useOptimisticRecipes(recipes);

  const filteredRecipes = filterAndSortRecipes(optimisticRecipes, {
    searchTerm,
    statusFilter,
    sortBy,
    sortOrder,
  });

  const itemsPerPage = 10;
  const { paginatedRecipes, totalPages } = paginateRecipes(
    filteredRecipes,
    currentPage,
    itemsPerPage
  );

  const {
    handlePublishRecipe,
    handleUnpublishRecipe,
    handleDeleteRecipe,
    handleBulkPublish,
    handleBulkDelete,
  } = createRecipeActions({
    addOptimisticUpdate,
    setRecipes,
    setSelectedRecipes,
    selectedRecipes,
    startTransition,
  });

  const toggleRecipeSelection = (id: string) => {
    setSelectedRecipes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRecipes.size === paginatedRecipes.length) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(paginatedRecipes.map((recipe) => recipe.id)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Recipes</h1>
            <p className="mt-2 text-gray-600">
              Manage your recipes, publish drafts, and organize your content
            </p>
          </div>
          <Link href="/admin/recipes/new">
            <Button>
              <span className="mr-2">➕</span>
              Create Recipe
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Status:{" "}
                  {statusFilter === "all"
                    ? "All"
                    : statusFilter === "published"
                      ? "Published"
                      : "Draft"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Recipes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("published")}>
                  Published Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                  Drafts Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Sort:{" "}
                  {sortBy === "title"
                    ? "Title"
                    : sortBy === "updated_at"
                      ? "Updated"
                      : "Created"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("title")}>
                  Title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("updated_at")}>
                  Last Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("created_at")}>
                  Date Created
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? "↓ Descending" : "↑ Ascending"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRecipes.size > 0 && (
          <div className="mt-4 flex items-center gap-4 rounded-lg bg-blue-50 p-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedRecipes.size} recipe
              {selectedRecipes.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleBulkPublish}
                disabled={isPending}
              >
                Publish Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                disabled={isPending}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Recipe Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3 text-left">
                  <Checkbox
                    checked={
                      selectedRecipes.size === paginatedRecipes.length &&
                      paginatedRecipes.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Recipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedRecipes.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedRecipes.has(recipe.id)}
                      onCheckedChange={() => toggleRecipeSelection(recipe.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {recipe.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {recipe.description}
                      </div>
                      {recipe.category && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {recipe.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={recipe.is_published ? "default" : "secondary"}
                    >
                      {recipe.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(recipe.updated_at)}
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ⋯
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/recipes/${recipe.id}/edit`}>
                            Edit Recipe
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/recipes/${recipe.slug}`}
                            target="_blank"
                          >
                            View Public
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {recipe.is_published ? (
                          <DropdownMenuItem
                            onClick={() => handleUnpublishRecipe(recipe.id)}
                            disabled={isPending}
                          >
                            Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handlePublishRecipe(recipe.id)}
                            disabled={isPending}
                          >
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="text-red-600"
                          disabled={isPending}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredRecipes.length)} of{" "}
              {filteredRecipes.length} recipes
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <div className="mb-4 text-4xl">📝</div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm || statusFilter !== "all"
                ? "No recipes found"
                : "No recipes yet"}
            </h3>
            <p className="mb-4 text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first recipe"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link href="/admin/recipes/new">
                <Button>Create Your First Recipe</Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
