"use server";

import { createClient } from "@/app/utils/supabase/server";
import {
  createRecipe,
  deleteRecipe as deleteRecipeDb,
  getRecipeById,
  updateRecipe as updateRecipeDb,
} from "@/lib/recipes";
import {
  CreateRecipeSchema,
  PublishRecipeSchema,
  UpdateRecipeSchema,
} from "@/schemas/recipe";
import { CreateRecipeInput, UpdateRecipeInput } from "@/types/recipe";
import { revalidatePath } from "next/cache";

export interface RecipeActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Array<{ field: string; message: string }>;
}

export async function createRecipeAction(
  input: CreateRecipeInput
): Promise<RecipeActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const validationResult = CreateRecipeSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid recipe data",
        validationErrors: validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }

    const result = await createRecipe(validationResult.data, user.id);

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/recipes");
    revalidatePath("/");

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Create recipe action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateRecipeAction(
  id: string,
  input: UpdateRecipeInput
): Promise<RecipeActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const validationResult = UpdateRecipeSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid recipe data",
        validationErrors: validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }

    const result = await updateRecipeDb(id, validationResult.data, user.id);

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/recipes");
    revalidatePath(`/admin/recipes/${id}`);
    revalidatePath("/");

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Update recipe action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function publishRecipeAction(
  id: string
): Promise<RecipeActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const recipeResult = await getRecipeById(id, user.id);
    if (recipeResult.error || !recipeResult.data) {
      return {
        success: false,
        error: "Recipe not found or access denied",
      };
    }

    const recipe = recipeResult.data;

    if (recipe.is_published) {
      return {
        success: false,
        error: "Recipe is already published",
      };
    }

    const validationResult = PublishRecipeSchema.safeParse(recipe);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Recipe is not ready for publishing",
        validationErrors: validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }

    // Update recipe to published status
    const now = new Date().toISOString();
    const updateResult = await updateRecipeDb(
      id,
      {
        is_published: true,
        published_at: now,
      },
      user.id
    );

    if (updateResult.error) {
      return {
        success: false,
        error: updateResult.error.message,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/recipes");
    revalidatePath(`/admin/recipes/${id}`);
    revalidatePath("/");

    return {
      success: true,
      data: updateResult.data,
    };
  } catch (error) {
    console.error("Publish recipe action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function unpublishRecipeAction(
  id: string
): Promise<RecipeActionResult> {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Get the current recipe
    const recipeResult = await getRecipeById(id, user.id);
    if (recipeResult.error || !recipeResult.data) {
      return {
        success: false,
        error: "Recipe not found or access denied",
      };
    }

    const recipe = recipeResult.data;

    // Check if already unpublished
    if (!recipe.is_published) {
      return {
        success: false,
        error: "Recipe is already unpublished",
      };
    }

    // Update recipe to unpublished status
    const updateResult = await updateRecipeDb(
      id,
      {
        is_published: false,
        // published_at is intentionally not reset, keeping historical record
      },
      user.id
    );

    if (updateResult.error) {
      return {
        success: false,
        error: updateResult.error.message,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/recipes");
    revalidatePath(`/admin/recipes/${id}`);
    revalidatePath("/");

    return {
      success: true,
      data: updateResult.data,
    };
  } catch (error) {
    console.error("Unpublish recipe action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteRecipeAction(
  id: string
): Promise<RecipeActionResult> {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Delete recipe
    const result = await deleteRecipeDb(id, user.id);

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/recipes");
    revalidatePath("/");

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error("Delete recipe action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function bulkPublishRecipesAction(
  ids: string[]
): Promise<RecipeActionResult> {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const results = await Promise.allSettled(
      ids.map((id) => publishRecipeAction(id))
    );

    const failures = results
      .map((result, index) => ({ result, id: ids[index] }))
      .filter(
        ({ result }) => result.status === "rejected" || !result.value.success
      );

    if (failures.length > 0) {
      return {
        success: false,
        error: `Failed to publish ${failures.length} out of ${ids.length} recipes`,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/recipes");
    revalidatePath("/");

    return {
      success: true,
      data: { publishedCount: ids.length },
    };
  } catch (error) {
    console.error("Bulk publish action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function bulkDeleteRecipesAction(
  ids: string[]
): Promise<RecipeActionResult> {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const results = await Promise.allSettled(
      ids.map((id) => deleteRecipeAction(id))
    );

    const failures = results
      .map((result, index) => ({ result, id: ids[index] }))
      .filter(
        ({ result }) => result.status === "rejected" || !result.value.success
      );

    if (failures.length > 0) {
      return {
        success: false,
        error: `Failed to delete ${failures.length} out of ${ids.length} recipes`,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/recipes");
    revalidatePath("/");

    return {
      success: true,
      data: { deletedCount: ids.length },
    };
  } catch (error) {
    console.error("Bulk delete action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
