import React, { Suspense } from "react";

import { createClient } from "@/app/utils/supabase/server";
import RecipeSkeletonLoader from "@/components/RecipeSkeletonLoader";

import { recipes as mockRecipes, Recipe } from "../../../data/MockData";
import FeedClient from "./FeedClient";

export default async function FeedServer(): Promise<JSX.Element> {
  return (
    <div>
      <StaticFeed />
      <Suspense fallback={<RecipeSkeletonLoader />}>
        <DynamicFeed />
      </Suspense>
    </div>
  );
}

function StaticFeed(): JSX.Element {
  return <h3 className="mt-6 text-5xl font-bold">Find your favorite recipe</h3>;
}

async function DynamicFeed(): Promise<JSX.Element> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function getRecipes() {
    // Simulating an asynchronous operation with Supabase or other DB queries
    // Simulates delay of 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return mockRecipes;
  }

  let recipes: Recipe[] = await getRecipes();

  return (
    <>
      <FeedClient recipes={recipes} />
    </>
  );
}
