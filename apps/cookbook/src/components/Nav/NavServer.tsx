import { Suspense } from "react";

import { createClient } from "@/app/utils/supabase/server";
import Header from "@/components/Header";
import { getPublishedRecipes } from "@/lib/recipes";

export default function NavServer(): React.JSX.Element {
  return (
    <Suspense fallback={<Header />}>
      <DynamicNav />
    </Suspense>
  );
}

async function DynamicNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await getPublishedRecipes({
    page: 1,
    limit: 50, // Get recipes for search
    sort_by: "published_at",
    sort_order: "desc",
  });

  const recipes = result.data || [];

  return <Header userEmail={user?.email || undefined} recipes={recipes} />;
}
