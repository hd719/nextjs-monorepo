import { getRecipesAction } from "@/app/actions";
import { createClient } from "@/app/utils/supabase/server";

import { Recipe } from "../../../data/MockData";
import FeedClient from "./FeedClient";

export default async function FeedServer(): Promise<JSX.Element> {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  const recipes: Recipe[] = await getRecipesAction();

  return (
    <>
      <FeedClient recipes={recipes} />
    </>
  );
}
