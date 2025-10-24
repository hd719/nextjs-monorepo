import { createClient } from "@/app/utils/supabase/server";
import { getAdminRecipes } from "@/lib/recipes";

import DraftsRecipesClient from "./DraftsRecipesClient";

export default async function DraftsRecipesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please sign in to access the admin area.</p>
      </div>
    );
  }

  const result = await getAdminRecipes(user.id, {
    page: 1,
    limit: 100,
    status: "draft",
    sort_by: "updated_at",
    sort_order: "desc",
  });

  const draftRecipes = result.data || [];

  return <DraftsRecipesClient initialRecipes={draftRecipes} />;
}
