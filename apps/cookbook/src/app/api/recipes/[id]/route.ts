import { createClient } from "@/app/utils/supabase/server";
import { DB_ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { deleteRecipe, getRecipeById, updateRecipe } from "@/lib/recipes";
import { generateUniqueSlug } from "@/lib/slug";
import { formatZodError, UpdateRecipeSchema } from "@/schemas/recipe";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/recipes/[id]
 * Get a single recipe by ID
 * Public: Only published recipes
 * Authenticated: User's own recipes (published + drafts)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // Public access - check if recipe exists and is published
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .single();

      if (error) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.RECIPE_NOT_FOUND },
          { status: HTTP_STATUS.NOT_FOUND }
        );
      }

      return NextResponse.json({ data });
    }

    // Authenticated access - get user's own recipe
    const result = await getRecipeById(id, user.id);

    if (result.error) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RECIPE_ACCESS_DENIED },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("GET /api/recipes/[id] error:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PATCH /api/recipes/[id]
 * Update an existing recipe
 * Requires authentication and ownership
 */
export async function PATCH(
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

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_JSON },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Add the ID to the body for validation
    const bodyWithId = { ...body, id };

    // Validate update data
    const validationResult = UpdateRecipeSchema.safeParse(bodyWithId);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INVALID_RECIPE_DATA,
          details: formatZodError(validationResult.error),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const updateData = validationResult.data;
    const { id: _, ...updates } = updateData; // Remove id from updates

    // Handle slug updates if title changed
    if (updates.title && updates.slug) {
      // If both title and slug are provided, validate slug uniqueness
      const slugResult = await generateUniqueSlug(updates.title, id);

      if (slugResult.error) {
        return NextResponse.json(
          {
            error: "Failed to validate slug",
            details: slugResult.error,
          },
          { status: 500 }
        );
      }

      // Use the validated unique slug
      updates.slug = slugResult.slug;
    } else if (updates.title && !updates.slug) {
      // If only title is provided, generate new slug
      const slugResult = await generateUniqueSlug(updates.title, id);

      if (slugResult.error) {
        return NextResponse.json(
          {
            error: "Failed to generate slug",
            details: slugResult.error,
          },
          { status: 500 }
        );
      }

      updates.slug = slugResult.slug;
    }

    // Update recipe in database
    const updateResult = await updateRecipe(id, updates, user.id);

    if (updateResult.error) {
      // Handle specific database errors
      if (updateResult.error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
        // Unique constraint violation (likely slug)
        return NextResponse.json(
          {
            error: ERROR_MESSAGES.DUPLICATE_SLUG,
            details: "Please choose a different title or slug",
          },
          { status: HTTP_STATUS.CONFLICT }
        );
      }

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
      message: "Recipe updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/recipes/[id] error:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/recipes/[id]
 * Delete a recipe
 * Requires authentication and ownership
 */
export async function DELETE(
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

    // Delete recipe from database
    const deleteResult = await deleteRecipe(id, user.id);

    if (deleteResult.error) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.FAILED_TO_DELETE,
          details: deleteResult.error.message,
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      message: "Recipe deleted successfully",
      data: { id: deleteResult.data?.id },
    });
  } catch (error) {
    console.error("DELETE /api/recipes/[id] error:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
