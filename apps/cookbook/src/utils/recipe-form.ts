import { IngredientObject } from "@/types/recipe";

export function getIngredientsAsStrings(
  ingredients?: string[] | IngredientObject[]
): string[] {
  if (!ingredients || ingredients.length === 0) return [""];

  return ingredients.map((ingredient) => {
    if (typeof ingredient === "string") return ingredient;
    if (ingredient && typeof ingredient === "object" && ingredient.name) {
      // Convert IngredientObject to string format
      const parts = [ingredient.name];
      if (ingredient.amount) parts.unshift(ingredient.amount);
      if (ingredient.unit) parts.splice(1, 0, ingredient.unit);
      return parts.join(" ");
    }
    return String(ingredient);
  });
}

export function formatIngredientObject(ingredient: IngredientObject): string {
  const parts = [ingredient.name];
  if (ingredient.amount) parts.unshift(ingredient.amount);
  if (ingredient.unit) parts.splice(1, 0, ingredient.unit);
  return parts.join(" ");
}

export function parseIngredientString(
  ingredientString: string
): IngredientObject {
  const parts = ingredientString.trim().split(/\s+/);

  if (parts.length === 1) {
    return { name: parts[0] };
  }

  // Simple heuristic: first part might be amount, second might be unit
  const [first, second, ...rest] = parts;

  // Check if first part looks like a number or fraction
  if (/^[\d\/\.\s]+$/.test(first)) {
    if (second && rest.length > 0) {
      return {
        amount: first,
        unit: second,
        name: rest.join(" "),
      };
    } else if (second) {
      return {
        amount: first,
        name: second,
      };
    }
  }

  // If no clear amount/unit pattern, treat as name
  return { name: ingredientString };
}
