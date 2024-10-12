import { createClient } from "@/app/utils/supabase/server";
import { Button } from "@/components/ui/button";

export default async function AddRecipeButton() {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  const doesUserExist = !!user?.id;

  if (doesUserExist) {
    return (
      <Button type="submit" variant={"outline"}>
        Add New Recipe
      </Button>
    );
  }

  return null;
}
