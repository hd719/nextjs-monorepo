import { createClient } from "@/app/utils/supabase/server";
import { getAdminRecipes } from "@/lib/recipes";

import AdminRecipesClient from "./AdminRecipesClient";

export default async function AdminRecipesPage() {
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
    sort_by: "updated_at",
    sort_order: "desc",
  });

  const recipes = result.data || [];

  return <AdminRecipesClient initialRecipes={recipes} />;
}
