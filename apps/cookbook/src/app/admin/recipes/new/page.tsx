import { RecipeForm } from "@/components/RecipeForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRecipePage() {
  return (
    <div className="bg-gradient-light min-h-screen">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* Back Navigation */}
        <div className="flex items-center">
          <Link href="/admin/recipes">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:text-primary-700 pl-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-primary-200 border-b pb-6">
          <h1 className="text-3xl font-bold text-neutral-900">
            Create New Recipe
          </h1>
          <p className="mt-2 text-neutral-600">
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
