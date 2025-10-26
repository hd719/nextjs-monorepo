"use client";

import { Recipe } from "@/types/recipe";
import { ChefHat, Clock, Printer, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import PancakeImage from "../../../../public/images/pancake.jpeg";

interface RecipeClientProps {
  recipe: Recipe;
  authorName: string;
}

export default function RecipeClient({
  recipe,
  authorName,
}: RecipeClientProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="min-h-screen">
        {/* Header Navigation */}
        <div className="sticky top-0 z-10 border-b border-primary-100 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-medium text-primary-600 transition-colors hover:text-primary-700"
            >
              ← Back to Recipes
            </Link>
          </div>
        </div>

        {/* Recipe Content */}
        <article className="mx-auto max-w-6xl px-4 py-8">
          {/* Title Card & Image - Side by Side */}
          <div className="mb-12 grid gap-8 lg:grid-cols-2">
            {/* Title Card */}
            <div className="card p-8">
              <div className="mb-6 flex flex-wrap gap-3">
                {recipe.category && (
                  <span className="inline-flex items-center rounded-full bg-gradient-accent px-4 py-2 text-sm font-semibold text-white shadow-sm">
                    {recipe.category}
                  </span>
                )}
                {recipe.cuisine && (
                  <span className="inline-flex items-center rounded-full bg-gradient-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm">
                    {recipe.cuisine}
                  </span>
                )}
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight text-neutral-900 lg:text-5xl">
                {recipe.title}
              </h1>

              {recipe.description && (
                <p className="mb-8 text-xl leading-relaxed text-neutral-600">
                  {recipe.description}
                </p>
              )}

              {/* Recipe Meta Info Cards */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                {recipe.prep_minutes && (
                  <div className="rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary-500 p-2">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-700">
                          Prep Time
                        </p>
                        <p className="text-lg font-bold text-primary-900">
                          {recipe.prep_minutes} min
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {recipe.cook_minutes && (
                  <div className="rounded-xl border border-error-200 bg-gradient-to-br from-error-50 to-error-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-error-500 p-2">
                        <ChefHat className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-error-700">
                          Cook Time
                        </p>
                        <p className="text-lg font-bold text-error-900">
                          {recipe.cook_minutes} min
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {recipe.servings && (
                  <div className="rounded-xl border border-accent-200 bg-gradient-to-br from-accent-50 to-accent-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-accent-500 p-2">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-accent-700">
                          Servings
                        </p>
                        <p className="text-lg font-bold text-accent-900">
                          {recipe.servings}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
                  <button
                    onClick={handlePrint}
                    className="group flex w-full items-center gap-3 print:hidden"
                  >
                    <div className="rounded-lg bg-neutral-500 p-2 transition-colors group-hover:bg-neutral-600">
                      <Printer className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-700">
                        Print Recipe
                      </p>
                      <p className="text-lg font-bold text-neutral-900">PDF</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recipe Image Card */}
            <div className="card p-6">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-200">
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
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {recipe.images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg bg-neutral-200"
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

          {/* Ingredients & Instructions Cards */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Ingredients Card */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="card p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-secondary p-3">
                    <span className="text-2xl">🥕</span>
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-900">
                    Ingredients
                  </h2>
                </div>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="group flex items-start gap-4 rounded-xl border border-secondary-200 bg-gradient-to-r from-secondary-50 to-secondary-100 p-4 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="mt-1 flex-shrink-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-secondary">
                          <span className="text-sm font-bold text-white">
                            ✓
                          </span>
                        </div>
                      </div>
                      <span className="font-medium leading-relaxed text-neutral-800">
                        {typeof ingredient === "string"
                          ? ingredient
                          : `${ingredient.amount || ""} ${ingredient.unit || ""} ${ingredient.name}`.trim()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions Card */}
            {recipe.steps && recipe.steps.length > 0 && (
              <div className="card p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-accent p-3">
                    <span className="text-2xl">👨‍🍳</span>
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-900">
                    Instructions
                  </h2>
                </div>
                <ol className="space-y-4">
                  {recipe.steps.map((step, index) => (
                    <li
                      key={index}
                      className="group flex gap-5 rounded-xl border border-accent-200 bg-gradient-to-r from-accent-50 to-accent-100 p-5 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent shadow-lg">
                          <span className="text-lg font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <p className="pt-1 font-medium leading-relaxed text-neutral-800">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Recipe Footer */}
          <footer className="card mt-16 p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
                  <span className="text-xl font-bold text-white">
                    {authorName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-neutral-900">
                    Recipe by {authorName}
                  </p>
                  <p className="text-sm text-neutral-600">
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
              </div>
              <Link
                href="/"
                className="btn-primary inline-flex items-center gap-2"
              >
                More Recipes
              </Link>
            </div>
          </footer>
        </article>
      </div>

      {/* Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
            .bg-gradient-light,
            .card,
            .bg-gradient-to-br {
              background: white !important;
            }
            .text-primary-600,
            .text-primary-700,
            .text-accent-700,
            .text-secondary-700,
            .text-error-700 {
              color: black !important;
            }
            .bg-gradient-accent,
            .bg-gradient-secondary,
            .bg-gradient-primary {
              background: white !important;
              border: 1px solid black !important;
            }
          }
        `,
        }}
      />
    </>
  );
}
