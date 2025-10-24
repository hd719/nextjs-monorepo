import { useOptimistic } from "react";

import { Recipe } from "@/types/recipe";

export type OptimisticAction =
  | { type: "publish"; id: string }
  | { type: "unpublish"; id: string }
  | { type: "delete"; id: string };

export function useOptimisticRecipes(recipes: Recipe[]) {
  const [optimisticRecipes, addOptimisticUpdate] = useOptimistic(
    recipes,
    (state: Recipe[], action: OptimisticAction) => {
      switch (action.type) {
        case "publish":
          return state.map((recipe) =>
            recipe.id === action.id
              ? {
                  ...recipe,
                  is_published: true,
                  published_at: new Date().toISOString(),
                }
              : recipe
          );
        case "unpublish":
          return state.map((recipe) =>
            recipe.id === action.id
              ? { ...recipe, is_published: false }
              : recipe
          );
        case "delete":
          return state.filter((recipe) => recipe.id !== action.id);
        default:
          return state;
      }
    }
  );

  return { optimisticRecipes, addOptimisticUpdate };
}
