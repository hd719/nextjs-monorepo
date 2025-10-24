import React, { Suspense } from "react";

import RecipeSkeletonLoader from "@/components/RecipeSkeletonLoader";
import { getPublishedRecipes } from "@/lib/recipes";
import { Recipe } from "@/types/recipe";

import FeedClient from "./FeedClient";

export default async function FeedServer(): Promise<React.JSX.Element> {
  return (
    <div>
      <StaticFeed />
      <Suspense fallback={<RecipeSkeletonLoader />}>
        <DynamicFeed />
      </Suspense>
    </div>
  );
}

function StaticFeed(): React.JSX.Element {
  return <h3 className="mt-6 text-5xl font-bold">Find your favorite recipe</h3>;
}

async function DynamicFeed(): Promise<React.JSX.Element> {
  // Fetch published recipes from database
  const result = await getPublishedRecipes({
    page: 1,
    limit: 12, // Show more recipes on home page
    sort_by: "published_at",
    sort_order: "desc",
  });

  // Handle error case
  if (result.error) {
    console.error("Failed to fetch published recipes:", result.error);
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-gray-600">
          Sorry, we couldn't load the recipes right now.
        </p>
        <p className="mt-2 text-sm text-gray-500">Please try again later.</p>
      </div>
    );
  }

  const recipes = result.data || [];

  // Handle empty state
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="mb-2 text-2xl font-semibold text-gray-700">
          No recipes yet
        </h3>
        <p className="max-w-md text-center text-gray-600">
          Payal hasn't published any recipes yet. Check back soon for delicious
          recipes and cooking inspiration!
        </p>
      </div>
    );
  }

  return (
    <>
      <FeedClient recipes={recipes} />
    </>
  );
}
