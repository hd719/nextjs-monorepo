import { createClient } from "@/app/utils/supabase/server";
import { RecipeForm } from "@/components/RecipeForm";
import { Button } from "@/components/ui/button";
import { getRecipeById } from "@/lib/recipes";
import { Recipe } from "@/types/recipe";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RecipeActions } from "./RecipeActions";

interface EditRecipePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchRecipeData(recipeId: string): Promise<Recipe> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const result = await getRecipeById(recipeId, user.id);

  if (result.error || !result.data) {
    throw new Error(result.error?.message || "Recipe not found");
  }

  return result.data;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  const recipe = await fetchRecipeData(id);

  return (
    <div className="min-h-screen bg-gradient-light">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* Page Header with Back Navigation and Actions */}
        <div className="border-b border-primary-200 pb-6">
          <div className="flex items-center justify-between">
            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Edit Recipe: {recipe.title}
              </h1>
            </div>

            {/* Back Navigation and Action Buttons */}
            <div className="flex items-center space-x-4">
              <RecipeActions recipe={recipe} recipeId={id} />
              <Link href="/admin/recipes">
                <Button
                  variant="ghost"
                  size="sm"
                  className="pr-0 text-primary-600 hover:text-primary-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Back to Recipes</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-neutral-600">
              Make changes to your recipe. Updates are saved automatically.
            </p>
          </div>

          {/* Recipe Status Badge */}
          <div className="mt-4 flex items-center space-x-4">
            <div
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                recipe.is_published
                  ? "border border-secondary-300 bg-secondary-100 text-secondary-800"
                  : "border border-warning-300 bg-warning-100 text-warning-800"
              }`}
            >
              {recipe.is_published ? "Published" : "Draft"}
            </div>
            {recipe.published_at && (
              <span className="text-sm text-neutral-600">
                Published on{" "}
                {new Date(recipe.published_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Recipe Form - Client Component */}
        <RecipeForm recipe={recipe} />
      </div>
    </div>
  );
}
