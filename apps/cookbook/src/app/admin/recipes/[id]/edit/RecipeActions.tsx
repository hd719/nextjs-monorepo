"use client";

import { useOptimistic, useTransition } from "react";

import {
  deleteRecipeAction,
  publishRecipeAction,
  unpublishRecipeAction,
} from "@/app/recipe-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { Recipe } from "@/types/recipe";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RecipeActionsProps {
  recipe: Recipe;
  recipeId: string;
}

export function RecipeActions({ recipe, recipeId }: RecipeActionsProps) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isPublishToggling, startPublishTransition] = useTransition();
  const { toasts, toast, removeToast } = useToast();

  const [optimisticRecipe, updateOptimisticRecipe] = useOptimistic(
    recipe,
    (currentRecipe: Recipe, action: { type: "publish" | "unpublish" }) => {
      return {
        ...currentRecipe,
        is_published: action.type === "publish",
        published_at:
          action.type === "publish" ? new Date().toISOString() : null,
      };
    }
  );

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        const result = await deleteRecipeAction(recipeId);
        if (result.success) {
          toast.success(
            "Recipe deleted successfully!",
            `"${optimisticRecipe.title}" has been permanently removed from your cookbook.`,
            3000
          );
          router.push("/admin/recipes");
        } else {
          toast.error(
            "Failed to delete recipe",
            result.error || "An unexpected error occurred. Please try again."
          );
        }
      } catch (e) {
        console.error("Error message", e);
        toast.error(
          "Delete failed",
          "An unexpected error occurred while deleting the recipe."
        );
      }
    });
  };

  const handlePublishToggle = () => {
    const action = optimisticRecipe.is_published ? "unpublish" : "publish";
    const actionText = action === "publish" ? "published" : "unpublished";

    // Optimistically update the UI
    updateOptimisticRecipe({ type: action });

    startPublishTransition(async () => {
      try {
        const result = optimisticRecipe.is_published
          ? await unpublishRecipeAction(recipeId)
          : await publishRecipeAction(recipeId);

        if (result.success) {
          toast.success(
            `Recipe ${actionText} successfully!`,
            `"${optimisticRecipe.title}" is now ${actionText}.`,
            3000
          );

          // Redirect to published recipes page after publishing
          if (action === "publish") {
            router.push("/admin/recipes/published");
          }
        } else {
          // Revert optimistic update on error
          updateOptimisticRecipe({
            type: optimisticRecipe.is_published ? "publish" : "unpublish",
          });
          toast.error(
            `Failed to ${action} recipe`,
            result.error || "An unexpected error occurred. Please try again."
          );
        }
      } catch {
        // Revert optimistic update on error
        updateOptimisticRecipe({
          type: optimisticRecipe.is_published ? "publish" : "unpublish",
        });
        toast.error(
          `${action.charAt(0).toUpperCase() + action.slice(1)} failed`,
          "An unexpected error occurred. Please try again."
        );
      }
    });
  };

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center space-x-3">
        {/* Publish/Unpublish Toggle */}
        <Button
          variant={optimisticRecipe.is_published ? "outline" : "default"}
          onClick={handlePublishToggle}
          disabled={isPublishToggling}
          className="flex items-center"
        >
          {isPublishToggling ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {optimisticRecipe.is_published
                ? "Unpublishing..."
                : "Publishing..."}
            </>
          ) : optimisticRecipe.is_published ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Unpublish
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Publish
            </>
          )}
        </Button>

        {/* View Public Link */}
        {optimisticRecipe.is_published && (
          <Link href={`/recipes/${optimisticRecipe.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View Public
            </Button>
          </Link>
        )}

        {/* Delete Button with Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{optimisticRecipe.title}
                &quot;? This action cannot be undone and will permanently remove
                the recipe from your cookbook.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  "Delete Recipe"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
