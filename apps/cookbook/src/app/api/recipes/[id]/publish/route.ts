import { createClient } from "@/app/utils/supabase/server";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { getRecipeById, updateRecipe } from "@/lib/recipes";
import { PublishRecipeSchema } from "@/schemas/recipe";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/recipes/[id]/publish
 * Publish a recipe (set is_published = true and published_at timestamp)
 * Requires authentication and ownership
 * Validates recipe is complete before publishing
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.AUTHENTICATION_REQUIRED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Get the current recipe to validate it
    const recipeResult = await getRecipeById(id, user.id);

    if (recipeResult.error || !recipeResult.data) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RECIPE_ACCESS_DENIED },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const recipe = recipeResult.data;

    // Check if recipe is already published
    if (recipe.is_published) {
      return NextResponse.json(
        {
          error: "Recipe is already published",
          data: recipe,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate recipe is complete for publishing
    const validationResult = PublishRecipeSchema.safeParse(recipe);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Recipe is not ready for publishing",
          details: "Recipe must have a title, ingredients, and cooking steps",
          validation_errors: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Update recipe to published status
    const now = new Date().toISOString();
    const updateResult = await updateRecipe(
      id,
      {
        is_published: true,
        published_at: now,
      },
      user.id
    );

    if (updateResult.error) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.FAILED_TO_UPDATE,
          details: updateResult.error.message,
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      data: updateResult.data,
      message: "Recipe published successfully",
    });
  } catch (error) {
    console.error("POST /api/recipes/[id]/publish error:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
