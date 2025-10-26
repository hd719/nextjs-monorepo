import { createClient } from "@/app/utils/supabase/server";
import { DB_ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import {
  createRecipe,
  getPublishedRecipes,
  getUserRecipes,
} from "@/lib/recipes";
import { generateUniqueSlug } from "@/lib/slug";
import {
  CreateRecipeSchema,
  formatZodError,
  RecipeQuerySchema,
} from "@/schemas/recipe";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/recipes
 * List recipes with optional filtering and pagination
 * Public: Returns published recipes only
 * Authenticated: Returns user's recipes (published + drafts)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryResult = RecipeQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      category: searchParams.get("category"),
      cuisine: searchParams.get("cuisine"),
      search: searchParams.get("search"),
      status: searchParams.get("status"),
      sort_by: searchParams.get("sort_by"),
      sort_order: searchParams.get("sort_order"),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: formatZodError(queryResult.error),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const queryParams = queryResult.data;

    // Check if user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // Public access - return published recipes only
      const result = await getPublishedRecipes(queryParams);

      if (result.error) {
        return NextResponse.json(
          {
            error: "Failed to fetch recipes",
            details: result.error.message,
          },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }

      return NextResponse.json({
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.count,
          totalPages: result.totalPages,
        },
      });
    }

    // Authenticated access - return user's recipes
    const result = await getUserRecipes(user.id, queryParams);

    if (result.error) {
      return NextResponse.json(
        {
          error: "Failed to fetch user recipes",
          details: result.error.message,
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/recipes error:", error);
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
 * POST /api/recipes
 * Create a new recipe
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
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
    } catch {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_JSON },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate recipe data
    const validationResult = CreateRecipeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INVALID_RECIPE_DATA,
          details: formatZodError(validationResult.error),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const recipeData = validationResult.data;

    // Generate unique slug if not provided or if provided slug is invalid
    let finalSlug = recipeData.slug;

    if (!finalSlug) {
      const slugResult = await generateUniqueSlug(recipeData.title);

      if (slugResult.error) {
        return NextResponse.json(
          {
            error: "Failed to generate slug",
            details: slugResult.error,
          },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }

      finalSlug = slugResult.slug;
    }

    // Create recipe in database
    const createResult = await createRecipe(
      {
        ...recipeData,
        slug: finalSlug,
      },
      user.id
    );

    if (createResult.error) {
      // Handle specific database errors
      if (createResult.error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
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
          error: ERROR_MESSAGES.FAILED_TO_CREATE,
          details: createResult.error.message,
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Return created recipe
    return NextResponse.json(
      {
        data: createResult.data,
        message: "Recipe created successfully",
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error("POST /api/recipes error:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
