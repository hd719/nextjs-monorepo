import {
  bulkDeleteRecipesAction,
  bulkPublishRecipesAction,
  deleteRecipeAction,
  publishRecipeAction,
  unpublishRecipeAction,
} from "@/app/recipe-actions";
import { OptimisticAction } from "@/hooks/use-optimistic-recipes";
import { Recipe } from "@/types/recipe";

export interface RecipeActionsConfig {
  addOptimisticUpdate: (action: OptimisticAction) => void;
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  setSelectedRecipes: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedRecipes: Set<string>;
  startTransition: (callback: () => void) => void;
}

export function createRecipeActions(config: RecipeActionsConfig) {
  const {
    addOptimisticUpdate,
    setRecipes,
    setSelectedRecipes,
    selectedRecipes,
    startTransition,
  } = config;

  const handlePublishRecipe = async (id: string) => {
    addOptimisticUpdate({ type: "publish", id });
    startTransition(async () => {
      try {
        const result = await publishRecipeAction(id);

        if (result.success && result.data) {
          // Update local state with server response
          setRecipes((prev) =>
            prev.map((recipe) =>
              recipe.id === id ? { ...recipe, ...result.data } : recipe
            )
          );
        } else if (!result.success) {
          console.error("Failed to publish recipe:", result.error);
          // Revert optimistic update on error
          setRecipes((prev) => [...prev]);
        }
      } catch (error) {
        console.error("Failed to publish recipe:", error);
        // Revert optimistic update on error
        setRecipes((prev) => [...prev]);
      }
    });
  };

  const handleUnpublishRecipe = async (id: string) => {
    addOptimisticUpdate({ type: "unpublish", id });
    startTransition(async () => {
      try {
        const result = await unpublishRecipeAction(id);

        if (result.success && result.data) {
          // Update local state with server response
          setRecipes((prev) =>
            prev.map((recipe) =>
              recipe.id === id ? { ...recipe, ...result.data } : recipe
            )
          );
        } else if (!result.success) {
          console.error("Failed to unpublish recipe:", result.error);
          // Revert optimistic update on error
          setRecipes((prev) => [...prev]);
        }
      } catch (error) {
        console.error("Failed to unpublish recipe:", error);
        setRecipes((prev) => [...prev]);
      }
    });
  };

  const handleDeleteRecipe = async (id: string) => {
    addOptimisticUpdate({ type: "delete", id });
    startTransition(async () => {
      try {
        const result = await deleteRecipeAction(id);

        if (result.success) {
          // Update local state - remove the deleted recipe
          setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
          setSelectedRecipes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        } else {
          console.error("Failed to delete recipe:", result.error);
          // Revert optimistic update on error
          setRecipes((prev) => [...prev]);
        }
      } catch (error) {
        console.error("Failed to delete recipe:", error);
        setRecipes((prev) => [...prev]);
      }
    });
  };

  const handleBulkPublish = async () => {
    const ids = Array.from(selectedRecipes);
    ids.forEach((id) => addOptimisticUpdate({ type: "publish", id }));

    startTransition(async () => {
      try {
        const result = await bulkPublishRecipesAction(ids);

        if (result.success) {
          // Update local state - mark selected recipes as published
          setRecipes((prev) =>
            prev.map((recipe) =>
              selectedRecipes.has(recipe.id)
                ? {
                    ...recipe,
                    is_published: true,
                    published_at: new Date().toISOString(),
                  }
                : recipe
            )
          );
          setSelectedRecipes(new Set());
        } else {
          console.error("Failed to bulk publish:", result.error);
          // Revert optimistic update on error
          setRecipes((prev) => [...prev]);
        }
      } catch (error) {
        console.error("Failed to bulk publish:", error);
        setRecipes((prev) => [...prev]);
      }
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedRecipes);
    ids.forEach((id) => addOptimisticUpdate({ type: "delete", id }));

    startTransition(async () => {
      try {
        const result = await bulkDeleteRecipesAction(ids);

        if (result.success) {
          // Update local state - remove deleted recipes
          setRecipes((prev) =>
            prev.filter((recipe) => !selectedRecipes.has(recipe.id))
          );
          setSelectedRecipes(new Set());
        } else {
          console.error("Failed to bulk delete:", result.error);
          // Revert optimistic update on error
          setRecipes((prev) => [...prev]);
        }
      } catch (error) {
        console.error("Failed to bulk delete:", error);
        setRecipes((prev) => [...prev]);
      }
    });
  };

  return {
    handlePublishRecipe,
    handleUnpublishRecipe,
    handleDeleteRecipe,
    handleBulkPublish,
    handleBulkDelete,
  };
}
