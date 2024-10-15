import { createClient } from "@/app/utils/supabase/server";

import { recipes as mockRecipes, Recipe } from "../../../data/MockData";
import FeedClient from "./FeedClient";

export default async function FeedServer(): Promise<JSX.Element> {
  const {
    data: { user },
  } = await createClient().auth.getUser();

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
