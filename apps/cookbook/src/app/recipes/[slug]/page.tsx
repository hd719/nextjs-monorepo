import { createClient } from "@/app/utils/supabase/server";
import { getRecipeBySlug } from "@/lib/recipes";
import {
  generateRecipeMetadata,
  generateRecipeStructuredData,
} from "@/lib/seo";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import RecipeClient from "./RecipeClient";

interface RecipePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getRecipeBySlug(slug);

  if (result.error || !result.data) {
    return {
      title: "Recipe Not Found - Payal's Cookbook",
      description:
        "The requested recipe could not be found. Browse our collection of delicious recipes instead.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const recipe = result.data;

  // Get recipe owner's name for metadata
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", recipe.owner_id)
    .single();

  const authorName = userData?.full_name || userData?.email || "Chef";

  return generateRecipeMetadata(recipe, authorName);
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const result = await getRecipeBySlug(slug);

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

  const authorName = userData?.full_name || userData?.email || "Payal";

  // Generate comprehensive JSON-LD structured data for SEO
  const structuredData = generateRecipeStructuredData(recipe, authorName);

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
