import { RecipeForm } from "@/components/RecipeForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRecipePage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* Page Header with Back Navigation */}
        <div className="border-b border-primary-200 pb-6">
          <div className="flex items-center justify-between">
            {/* Page Title */}
            <h1 className="text-3xl font-bold text-neutral-900">
              Create New Recipe
            </h1>

            {/* Back Navigation */}
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
          <p className="mt-4 text-neutral-600">
            Add a new recipe to your cookbook. You can save as draft or publish
            immediately.
          </p>
        </div>

        {/* Recipe Form */}
        <RecipeForm />
      </div>
    </div>
  );
}
