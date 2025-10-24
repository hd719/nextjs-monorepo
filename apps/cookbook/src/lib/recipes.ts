import { createClient } from "@/app/utils/supabase/server";
import type {
  CreateRecipeInput,
  Recipe,
  RecipeListItem,
  RecipeQueryParams,
  UpdateRecipeInput,
} from "@/types/recipe";

// Error types for better error handling
export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
}

export interface DatabaseResult<T> {
  data: T | null;
  error: DatabaseError | null;
}

export interface PaginatedResult<T> {
  data: T[] | null;
  error: DatabaseError | null;
  count: number | null;
  page: number;
  limit: number;
  totalPages: number | null;
}

export async function getPublishedRecipes(
  params: Partial<RecipeQueryParams> = {}
): Promise<PaginatedResult<Recipe>> {
  try {
    const supabase = await createClient();
    const {
      page = 1,
      limit = 10,
      category,
      cuisine,
      search,
      sort_by = "published_at",
      sort_order = "desc",
    } = params;

    const offset = (page - 1) * limit;

    // Build query for published recipes only
    let query = supabase
      .from("recipes")
      .select("*", { count: "exact" })
      .eq("is_published", true)
      .range(offset, offset + limit - 1)
      .order(sort_by, { ascending: sort_order === "asc" });

    // Add filters if provided
    if (category) {
      query = query.eq("category", category);
    }

    if (cuisine) {
      query = query.eq("cuisine", cuisine);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
        count: null,
        page,
        limit,
        totalPages: null,
      };
    }

    const totalPages = count ? Math.ceil(count / limit) : null;

    return {
      data: data as Recipe[],
      error: null,
      count,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: "Failed to fetch published recipes",
        details: error instanceof Error ? error.message : String(error),
      },
      count: null,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: null,
    };
  }
}

export async function getRecipeBySlug(
  slug: string
): Promise<DatabaseResult<Recipe>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true) // Only published recipes for public access
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }

    return {
      data: data as Recipe,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: "Failed to fetch recipe by slug",
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

export async function getUserRecipes(
  userId: string,
  params: Partial<RecipeQueryParams> = {}
): Promise<PaginatedResult<RecipeListItem>> {
  try {
    const supabase = await createClient();
    const {
      page = 1,
      limit = 10,
      category,
      cuisine,
      search,
      status = "all",
      sort_by = "updated_at",
      sort_order = "desc",
    } = params;

    const offset = (page - 1) * limit;

    // Build query for user's recipes
    let query = supabase
      .from("recipes")
      .select(
        `
        id,
        title,
        slug,
        is_published,
        updated_at,
        created_at,
        category,
        ingredients,
        steps
      `,
        { count: "exact" }
      )
      .eq("owner_id", userId)
      .range(offset, offset + limit - 1)
      .order(sort_by, { ascending: sort_order === "asc" });

    // Filter by status
    if (status === "published") {
      query = query.eq("is_published", true);
    } else if (status === "draft") {
      query = query.eq("is_published", false);
    }

    // Add other filters
    if (category) {
      query = query.eq("category", category);
    }

    if (cuisine) {
      query = query.eq("cuisine", cuisine);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
        count: null,
        page,
        limit,
        totalPages: null,
      };
    }

    // Transform data to include computed fields
    const transformedData = data?.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      is_published: recipe.is_published,
      updated_at: recipe.updated_at,
      created_at: recipe.created_at,
      category: recipe.category,
      ingredient_count: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.length
        : 0,
      step_count: Array.isArray(recipe.steps) ? recipe.steps.length : 0,
    })) as RecipeListItem[];

    const totalPages = count ? Math.ceil(count / limit) : null;

    return {
      data: transformedData,
      error: null,
      count,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: "Failed to fetch user recipes",
        details: error instanceof Error ? error.message : String(error),
      },
      count: null,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: null,
    };
  }
}

/**
 * Get a single recipe by ID for editing
 * Checks ownership to ensure user can only access their own recipes
 */
export async function getRecipeById(
  recipeId: string,
  userId: string
): Promise<DatabaseResult<Recipe>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", recipeId)
      .eq("owner_id", userId) // Ensure ownership
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }

    return {
      data: data as Recipe,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: "Failed to fetch recipe by ID",
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Get full recipe data for admin pages
 * Returns complete Recipe objects with all fields
 */
export async function getAdminRecipes(
  userId: string,
  params: Partial<RecipeQueryParams> = {}
): Promise<PaginatedResult<Recipe>> {
  try {
    const supabase = await createClient();
    const {
      page = 1,
      limit = 10,
      category,
      cuisine,
      search,
      status = "all",
      sort_by = "updated_at",
      sort_order = "desc",
    } = params;

    const offset = (page - 1) * limit;

    // Build query for user's recipes with all fields
    let query = supabase
      .from("recipes")
      .select("*", { count: "exact" })
      .eq("owner_id", userId)
      .range(offset, offset + limit - 1)
      .order(sort_by, { ascending: sort_order === "asc" });

    // Filter by status
    if (status === "published") {
      query = query.eq("is_published", true);
    } else if (status === "draft") {
      query = query.eq("is_published", false);
    }

    // Add other filters
    if (category) {
      query = query.eq("category", category);
    }

    if (cuisine) {
      query = query.eq("cuisine", cuisine);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
        count: null,
        page,
        limit,
        totalPages: null,
      };
    }

    const totalPages = count ? Math.ceil(count / limit) : null;

    return {
      data: data as Recipe[],
      error: null,
      count,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: "Failed to fetch admin recipes",
        details: error instanceof Error ? error.message : String(error),
      },
      count: null,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: null,
    };
  }
}

/**
 * Create a new recipe
 * Automatically sets owner_id and generates timestamps
 */
export async function createRecipe(
  recipeData: CreateRecipeInput,
  userId: string
): Promise<DatabaseResult<Recipe>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipes")
      .insert({
        ...recipeData,
        owner_id: userId,
        // Set published_at if recipe is being published
        published_at: recipeData.is_published ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }

    return {
      data: data as Recipe,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: "Failed to create recipe",
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Update an existing recipe
 * Checks ownership and handles publish/unpublish logic
 */
export async function updateRecipe(
  recipeId: string,
  updates: Omit<UpdateRecipeInput, "id">,
  userId: string
): Promise<DatabaseResult<Recipe>> {
  try {
    const supabase = await createClient();

    // First check if recipe exists and user owns it
    const { data: existingRecipe, error: fetchError } = await supabase
      .from("recipes")
      .select("is_published, published_at")
      .eq("id", recipeId)
      .eq("owner_id", userId)
      .single();

    if (fetchError) {
      return {
        data: null,
        error: {
          message: "Recipe not found or access denied",
          code: fetchError.code,
        },
      };
    }

    // Handle publish/unpublish logic
    const updateData: any = { ...updates };

    if (updates.is_published !== undefined) {
      if (updates.is_published && !existingRecipe.is_published) {
        // Publishing for the first time
        updateData.published_at = new Date().toISOString();
      } else if (!updates.is_published && existingRecipe.is_published) {
        // Unpublishing
        updateData.published_at = null;
      }
    }

    const { data, error } = await supabase
      .from("recipes")
      .update(updateData)
      .eq("id", recipeId)
      .eq("owner_id", userId) // Double-check ownership
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }

    return {
      data: data as Recipe,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: "Failed to update recipe",
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

export async function deleteRecipe(
  recipeId: string,
  userId: string
): Promise<DatabaseResult<{ id: string }>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipeId)
      .eq("owner_id", userId) // Ensure ownership
      .select("id")
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }

    return {
      data: { id: data.id },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: "Failed to delete recipe",
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

export async function isSlugAvailable(
  slug: string,
  excludeRecipeId?: string
): Promise<DatabaseResult<boolean>> {
  try {
    const supabase = await createClient();

    let query = supabase.from("recipes").select("id").eq("slug", slug);

    // Exclude current recipe when updating
    if (excludeRecipeId) {
      query = query.neq("id", excludeRecipeId);
    }

    const { data, error } = await query;

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }

    // Slug is available if no recipes found
    return {
      data: data.length === 0,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: "Failed to check slug availability",
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

export async function getRecipeStats(userId: string): Promise<
  DatabaseResult<{
    total: number;
    published: number;
    draft: number;
  }>
> {
  try {
    const supabase = await createClient();

    const [totalResult, publishedResult] = await Promise.all([
      supabase
        .from("recipes")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", userId),
      supabase
        .from("recipes")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", userId)
        .eq("is_published", true),
    ]);

    if (totalResult.error || publishedResult.error) {
      return {
        data: null,
        error: { message: "Failed to fetch recipe statistics" },
      };
    }

    const total = totalResult.count || 0;
    const published = publishedResult.count || 0;
    const draft = total - published;

    return {
      data: { total, published, draft },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: "Failed to fetch recipe statistics",
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
