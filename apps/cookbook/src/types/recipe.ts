// Base recipe interface matching database schema
export interface Recipe {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  description: string | null;
  ingredients: string[] | IngredientObject[];
  steps: string[];
  images: string[];
  category: string | null;
  cuisine: string | null;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  is_published: boolean;
  published_at: string | null; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Enhanced ingredient object for structured data
export interface IngredientObject {
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
}

// Input type for creating new recipes
export interface CreateRecipeInput {
  title: string;
  slug: string;
  description?: string;
  ingredients?: string[] | IngredientObject[];
  steps?: string[];
  images?: string[];
  category?: string;
  cuisine?: string;
  servings?: number;
  prep_minutes?: number;
  cook_minutes?: number;
  is_published?: boolean;
}

// Input type for updating existing recipes (all fields optional except id)
export interface UpdateRecipeInput {
  id: string;
  title?: string;
  slug?: string;
  description?: string | null;
  ingredients?: string[] | IngredientObject[];
  steps?: string[];
  images?: string[];
  category?: string | null;
  cuisine?: string | null;
  servings?: number | null;
  prep_minutes?: number | null;
  cook_minutes?: number | null;
  is_published?: boolean;
  published_at?: string | null;
}

// Public recipe type (excludes sensitive fields, only published recipes)
export interface PublicRecipe extends Omit<Recipe, "owner_id"> {
  is_published: true; // Ensures only published recipes
}

// Recipe with computed fields for display
export interface RecipeWithComputed extends Recipe {
  total_time: number | null; // prep_minutes + cook_minutes
  difficulty: "Easy" | "Medium" | "Hard" | null;
  ingredient_count: number;
  step_count: number;
}

// Recipe list item for admin dashboard
export interface RecipeListItem {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  updated_at: string;
  created_at: string;
  category: string | null;
  ingredient_count: number;
  step_count: number;
}

// Recipe form data (for React Hook Form)
export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: string; // Textarea input as string, parsed later
  steps: string; // Textarea input as string, parsed later
  category: string;
  cuisine: string;
  servings: string; // Form inputs are strings
  prep_minutes: string;
  cook_minutes: string;
  images: string; // Comma-separated URLs as string
}

// Recipe status for admin UI
export type RecipeStatus = "draft" | "published";

// Recipe categories (can be extended)
export const RECIPE_CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Appetizer",
  "Dessert",
  "Snack",
  "Beverage",
  "Side Dish",
  "Soup",
  "Salad",
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

// Recipe cuisines (can be extended)
export const RECIPE_CUISINES = [
  "American",
  "Italian",
  "Mexican",
  "Chinese",
  "Indian",
  "French",
  "Japanese",
  "Thai",
  "Mediterranean",
  "Middle Eastern",
  "Other",
] as const;

export type RecipeCuisine = (typeof RECIPE_CUISINES)[number];

// API response types
export interface RecipeApiResponse {
  data: Recipe | null;
  error: string | null;
}

export interface RecipeListApiResponse {
  data: Recipe[] | null;
  error: string | null;
  count?: number;
  page?: number;
  limit?: number;
}

// Query parameters for recipe listing
export interface RecipeQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  cuisine?: string;
  search?: string;
  status?: "all" | "published" | "draft";
  sort_by?: "title" | "created_at" | "updated_at" | "published_at";
  sort_order?: "asc" | "desc";
}

// Type guards for runtime type checking
export function isIngredientObject(
  ingredient: IngredientObject
): ingredient is IngredientObject {
  return (
    typeof ingredient === "object" &&
    ingredient !== null &&
    typeof ingredient.name === "string"
  );
}

export function isPublishedRecipe(
  recipe: Recipe
): recipe is Recipe & { is_published: true } {
  return recipe.is_published === true;
}

// Utility type for form validation errors
export interface RecipeFormErrors {
  title?: string[];
  description?: string[];
  ingredients?: string[];
  steps?: string[];
  category?: string[];
  cuisine?: string[];
  servings?: string[];
  prep_minutes?: string[];
  cook_minutes?: string[];
  images?: string[];
  _form?: string[]; // General form errors
}

export const DEFAULT_RECIPE_VALUES = {
  title: "",
  description: "",
  ingredients: [],
  steps: [],
  images: [],
  category: undefined,
  cuisine: undefined,
  servings: undefined,
  prep_minutes: undefined,
  cook_minutes: undefined,
  is_published: false,
} satisfies Partial<CreateRecipeInput>;

// Export legacy Recipe type for backward compatibility
export type { Recipe as LegacyRecipe } from "../../data/MockData";
