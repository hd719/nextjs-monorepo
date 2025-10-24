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
import { useOptimisticRecipes } from "@/hooks/use-optimistic-recipes";
import { Recipe } from "@/types/recipe";
import { createRecipeActions } from "@/utils/recipe-actions";
import {
  filterAndSortRecipes,
  paginateRecipes,
  type SortBy,
  type SortOrder,
  type StatusFilter,
} from "@/utils/recipe-filters";
import Link from "next/link";

interface AdminRecipesClientProps {
  initialRecipes: Recipe[];
}

export default function AdminRecipesClient({
  initialRecipes,
}: AdminRecipesClientProps) {
  const [recipes, setRecipes] = useState(initialRecipes);
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
    <div className="bg-gradient-light min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {/* Page Header */}
        <div className="border-primary-200 border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                All Recipes
              </h1>
              <p className="mt-2 text-neutral-600">
                Manage your recipes, publish drafts, and organize your content
              </p>
            </div>
            <Link href="/admin/recipes/new">
              <Button className="btn-primary">
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
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("published")}
                  >
                    Published
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    Drafts
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
            <div className="bg-accent-50 border-accent-200 mt-4 flex items-center gap-4 rounded-lg border p-4">
              <span className="text-accent-900 text-sm font-medium">
                {selectedRecipes.size} recipe
                {selectedRecipes.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="btn-secondary"
                  onClick={handleBulkPublish}
                  disabled={isPending}
                >
                  Publish Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-error-300 text-error-700 hover:bg-error-50"
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
              <thead className="border-primary-200 bg-primary-50 border-b">
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
                    Recipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-primary-200 divide-y bg-white">
                {paginatedRecipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-primary-50">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedRecipes.has(recipe.id)}
                        onCheckedChange={() => toggleRecipeSelection(recipe.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {recipe.title}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {recipe.description}
                        </div>
                        {recipe.category && (
                          <div className="mt-1">
                            <Badge
                              variant="outline"
                              className="border-secondary-300 text-secondary-700 text-xs"
                            >
                              {recipe.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          recipe.is_published
                            ? "bg-secondary-100 text-secondary-800 border-secondary-300"
                            : "bg-warning-100 text-warning-800 border-warning-300"
                        }
                      >
                        {recipe.is_published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
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
                          {recipe.is_published && (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/recipes/${recipe.slug}`}
                                target="_blank"
                              >
                                View Public
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              recipe.is_published
                                ? handleUnpublishRecipe(recipe.id)
                                : handlePublishRecipe(recipe.id)
                            }
                            disabled={isPending}
                          >
                            {recipe.is_published ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="text-error-600 hover:bg-error-50"
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
            <div className="border-primary-200 flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-neutral-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredRecipes.length)}{" "}
                of {filteredRecipes.length} recipes
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary-300 text-primary-700 hover:bg-primary-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 py-1 text-sm text-neutral-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary-300 text-primary-700 hover:bg-primary-50"
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
            <div className="text-neutral-600">
              <div className="mb-4 text-4xl">📝</div>
              <h3 className="mb-2 text-lg font-medium text-neutral-900">
                {searchTerm || statusFilter !== "all"
                  ? "No recipes found"
                  : "No recipes yet"}
              </h3>
              <p className="mb-4 text-neutral-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first recipe"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/admin/recipes/new">
                  <Button className="btn-primary">
                    Create Your First Recipe
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
