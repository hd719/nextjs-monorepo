import { createClient } from "@/app/utils/supabase/server";
import { getRecipeBySlug } from "@/lib/recipes";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import RecipeClient from "./RecipeClient";

interface RecipePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const result = await getRecipeBySlug(params.slug);

  if (result.error || !result.data) {
    return {
      title: "Recipe Not Found",
      description: "The requested recipe could not be found.",
    };
  }

  const recipe = result.data;

  return {
    title: `${recipe.title} - Payal's Cookbook`,
    description: recipe.description || `Learn how to make ${recipe.title}`,
    keywords: [
      recipe.title,
      recipe.category,
      recipe.cuisine,
      "recipe",
      "cooking",
      "Payal",
    ].filter(Boolean) as string[],
    openGraph: {
      title: recipe.title,
      description: recipe.description || `Learn how to make ${recipe.title}`,
      images: recipe.images?.[0] ? [recipe.images[0]] : [],
      type: "article",
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const result = await getRecipeBySlug(params.slug);

  // Handle recipe not found
  if (result.error || !result.data) {
    notFound();
  }

  const recipe = result.data;

  // Get recipe owner's name
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", recipe.owner_id)
    .single();

  const authorName = userData?.full_name || userData?.email || "Chef";

  // Generate JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: recipe.images?.[0] || "",
    author: {
      "@type": "Person",
      name: authorName,
    },
    datePublished: recipe.published_at || recipe.created_at,
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    prepTime: recipe.prep_minutes ? `PT${recipe.prep_minutes}M` : undefined,
    cookTime: recipe.cook_minutes ? `PT${recipe.cook_minutes}M` : undefined,
    totalTime:
      recipe.prep_minutes && recipe.cook_minutes
        ? `PT${recipe.prep_minutes + recipe.cook_minutes}M`
        : undefined,
    recipeIngredient: recipe.ingredients || [],
    recipeInstructions: recipe.steps?.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Client Component for UI and Interactivity */}
      <RecipeClient recipe={recipe} authorName={authorName} />
    </>
  );
}
