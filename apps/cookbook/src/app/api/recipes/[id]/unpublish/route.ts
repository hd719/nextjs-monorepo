import { createClient } from "@/app/utils/supabase/server";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { getRecipeById, updateRecipe } from "@/lib/recipes";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/recipes/[id]/unpublish
 * Unpublish a recipe (set is_published = false, keep published_at for history)
 * Requires authentication and ownership
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get the current recipe
    const recipeResult = await getRecipeById(id, user.id);

    if (recipeResult.error || !recipeResult.data) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RECIPE_ACCESS_DENIED },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const recipe = recipeResult.data;

    // Check if recipe is already unpublished
    if (!recipe.is_published) {
      return NextResponse.json(
        {
          error: "Recipe is already unpublished",
          data: recipe,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Update recipe to unpublished status
    // Note: We keep published_at for historical record
    const updateResult = await updateRecipe(
      id,
      {
        is_published: false,
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
      message: "Recipe unpublished successfully",
    });
  } catch (error) {
    console.error("POST /api/recipes/[id]/unpublish error:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
