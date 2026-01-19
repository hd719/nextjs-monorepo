import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateRecipePages(recipeSlug?: string) {
  // Revalidate home page to show updated recipe list
  revalidatePath("/");

  // Revalidate admin pages
  revalidatePath("/admin/recipes");
  revalidatePath("/admin/recipes/published");
  revalidatePath("/admin/recipes/drafts");

  // Revalidate specific recipe page if slug is provided
  if (recipeSlug) {
    revalidatePath(`/recipes/${recipeSlug}`);
  }

  // Revalidate sitemap
  revalidatePath("/sitemap.xml");
}

/**
 * Revalidate all recipe pages (use sparingly)
 */
export function revalidateAllRecipePages() {
  // Revalidate all recipe pages using tag-based revalidation
  revalidateTag("recipes", { expire: 0 });

  // Revalidate key pages
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
}

/**
 * Cache tags for different types of content
 */
export const CACHE_TAGS = {
  RECIPES: "recipes",
  RECIPE_DETAIL: "recipe-detail",
  PUBLISHED_RECIPES: "published-recipes",
  USER_RECIPES: "user-recipes",
} as const;

/**
 * Generate cache tags for a specific recipe
 */
export function getRecipeCacheTags(recipeId: string, recipeSlug: string) {
  return [
    CACHE_TAGS.RECIPES,
    CACHE_TAGS.RECIPE_DETAIL,
    `recipe-${recipeId}`,
    `recipe-slug-${recipeSlug}`,
  ];
}

/**
 * Generate cache tags for recipe lists
 */
export function getRecipeListCacheTags(userId?: string) {
  const tags: string[] = [CACHE_TAGS.RECIPES, CACHE_TAGS.PUBLISHED_RECIPES];

  if (userId) {
    tags.push(CACHE_TAGS.USER_RECIPES, `user-recipes-${userId}`);
  }

  return tags;
}
