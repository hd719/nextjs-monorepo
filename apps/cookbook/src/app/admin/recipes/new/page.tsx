import { AdminPageHeader } from "@/components/AdminPageHeader";
import { RecipeForm } from "@/components/RecipeForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRecipePage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          title="Create New Recipe"
          description="Add a new recipe to your cookbook. You can save as draft or publish immediately."
        >
          <Link href="/admin/recipes">
            <Button className="bg-appAccent px-3 text-white hover:bg-appAccent/90 sm:px-4">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">Back to Recipes</span>
            </Button>
          </Link>
        </AdminPageHeader>

        {/* Recipe Form */}
        <RecipeForm />
      </div>
    </div>
  );
}
