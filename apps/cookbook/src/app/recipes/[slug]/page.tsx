import { getRecipeBySlug } from "@/lib/recipes";
import { Recipe } from "@/types/recipe";
import { Clock, Users, ChefHat, Printer } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import PancakeImage from "../../../../public/images/pancake.jpeg";

interface RecipePageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
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
    ].filter(Boolean),
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

  // Generate JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: recipe.images?.[0] || "",
    author: {
      "@type": "Person",
      name: "Payal",
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

      <div className="min-h-screen bg-gray-50">
        {/* Header Navigation */}
        <div className="bg-white shadow-sm">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              ← Back to Recipes
            </Link>
          </div>
        </div>

        {/* Recipe Content */}
        <article className="mx-auto max-w-4xl px-4 py-8">
          {/* Recipe Header */}
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {recipe.category && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {recipe.category}
                </span>
              )}
              {recipe.cuisine && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  {recipe.cuisine}
                </span>
              )}
            </div>

            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              {recipe.title}
            </h1>

            {recipe.description && (
              <p className="mb-6 text-xl text-gray-600">{recipe.description}</p>
            )}

            {/* Recipe Meta Info */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {recipe.prep_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Prep: {recipe.prep_minutes} min</span>
                </div>
              )}
              {recipe.cook_minutes && (
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  <span>Cook: {recipe.cook_minutes} min</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Serves: {recipe.servings}</span>
                </div>
              )}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1 hover:bg-gray-200 print:hidden"
              >
                <Printer className="h-4 w-4" />
                <span>Print Recipe</span>
              </button>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Recipe Image */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
                  <Image
                    src={recipe.images?.[0] || PancakeImage}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                {/* Additional Images */}
                {recipe.images && recipe.images.length > 1 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {recipe.images.slice(1, 5).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded-md bg-gray-200"
                      >
                        <Image
                          src={image}
                          alt={`${recipe.title} - Image ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recipe Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Ingredients */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <section>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Ingredients
                  </h2>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="text-gray-700">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Instructions */}
              {recipe.steps && recipe.steps.length > 0 && (
                <section>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Instructions
                  </h2>
                  <ol className="space-y-4">
                    {recipe.steps.map((step, index) => (
                      <li
                        key={index}
                        className="flex gap-4 rounded-lg bg-white p-4 shadow-sm"
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          </div>

          {/* Recipe Footer */}
          <footer className="mt-12 border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Recipe by <span className="font-semibold">Payal</span>
                </p>
                <p className="text-sm text-gray-500">
                  Published on{" "}
                  {new Date(
                    recipe.published_at || recipe.created_at
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Link
                href="/"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                More Recipes
              </Link>
            </div>
          </footer>
        </article>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          article {
            max-width: none !important;
            padding: 0 !important;
          }
          
          .sticky {
            position: static !important;
          }
          
          .grid {
            display: block !important;
          }
          
          .lg\\:col-span-1,
          .lg\\:col-span-2 {
            width: 100% !important;
          }
          
          .shadow-sm,
          .shadow {
            box-shadow: none !important;
          }
          
          .bg-gray-50,
          .bg-white,
          .bg-gray-100 {
            background: white !important;
          }
          
          .text-blue-600,
          .text-blue-800,
          .text-green-800 {
            color: black !important;
          }
          
          .bg-blue-100,
          .bg-green-100,
          .bg-blue-600 {
            background: white !important;
            border: 1px solid black !important;
          }
        }
      `}</style>
    </>
  );
}
