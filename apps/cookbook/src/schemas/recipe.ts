import { z } from "zod";

import { RECIPE_CATEGORIES, RECIPE_CUISINES } from "../types/recipe";

// Base ingredient object schema
export const IngredientObjectSchema = z.object({
  name: z
    .string()
    .min(1, "Ingredient name is required")
    .max(100, "Ingredient name too long"),
  amount: z.string().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

// Flexible ingredients schema - can be array of strings or objects
export const IngredientsSchema = z.union([
  z
    .array(z.string().min(1, "Ingredient cannot be empty"))
    .min(1, "At least one ingredient is required"),
  z.array(IngredientObjectSchema).min(1, "At least one ingredient is required"),
]);

// Steps schema - array of non-empty strings
export const StepsSchema = z
  .array(z.string().min(1, "Step cannot be empty"))
  .min(1, "At least one cooking step is required");

// Images schema - array of valid URLs
export const ImagesSchema = z
  .array(z.string().url("Must be a valid URL").or(z.string().length(0)))
  .optional();

// Slug validation - URL-safe characters only
export const SlugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug too long")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers, and hyphens"
  );

// Title validation
export const TitleSchema = z
  .string()
  .min(2, "Title must be at least 2 characters")
  .max(100, "Title must be less than 100 characters")
  .trim();

// Description validation
export const DescriptionSchema = z
  .string()
  .max(500, "Description must be less than 500 characters")
  .optional()
  .or(z.literal(""));

// Category validation using const array
export const CategorySchema = z
  .enum(RECIPE_CATEGORIES)
  .optional()
  .or(z.literal(""));

// Cuisine validation using const array
export const CuisineSchema = z
  .enum(RECIPE_CUISINES)
  .optional()
  .or(z.literal(""));

// Positive integer validation for servings and time
export const PositiveIntSchema = z
  .number()
  .int("Must be a whole number")
  .positive("Must be greater than 0")
  .max(999, "Value too large")
  .optional();

// Create Recipe Schema - for new recipe creation
export const CreateRecipeSchema = z.object({
  title: TitleSchema,
  slug: SlugSchema,
  description: DescriptionSchema,
  ingredients: IngredientsSchema.optional().default([]),
  steps: StepsSchema.optional().default([]),
  images: ImagesSchema.default([]),
  category: CategorySchema,
  cuisine: CuisineSchema,
  servings: PositiveIntSchema,
  prep_minutes: PositiveIntSchema,
  cook_minutes: PositiveIntSchema,
  is_published: z.boolean().default(false),
});

// Update Recipe Schema - all fields optional except id
export const UpdateRecipeSchema = z.object({
  id: z.string().uuid("Invalid recipe ID"),
  title: TitleSchema.optional(),
  slug: SlugSchema.optional(),
  description: DescriptionSchema,
  ingredients: IngredientsSchema.optional(),
  steps: StepsSchema.optional(),
  images: ImagesSchema,
  category: CategorySchema,
  cuisine: CuisineSchema,
  servings: PositiveIntSchema,
  prep_minutes: PositiveIntSchema,
  cook_minutes: PositiveIntSchema,
  is_published: z.boolean().optional(),
  published_at: z.string().datetime().nullable().optional(),
});

// Recipe Form Schema - for form validation (all inputs are strings initially)
export const RecipeFormSchema = z.object({
  title: TitleSchema,
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  ingredients: z
    .string()
    .min(1, "Ingredients are required")
    .max(2000, "Ingredients list too long"),
  steps: z
    .string()
    .min(1, "Cooking steps are required")
    .max(2000, "Steps list too long"),
  category: z.string().optional(),
  cuisine: z.string().optional(),
  servings: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Servings must be a positive number",
    }),
  prep_minutes: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Prep time must be a positive number",
    }),
  cook_minutes: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Cook time must be a positive number",
    }),
  images: z.string().optional(), // Comma-separated URLs
});

// Publish Recipe Schema - ensures recipe is complete before publishing
export const PublishRecipeSchema = CreateRecipeSchema.extend({
  id: z.string().uuid("Invalid recipe ID"),
  ingredients: IngredientsSchema, // Required for publishing
  steps: StepsSchema, // Required for publishing
}).refine(
  (data) => {
    // Additional validation for publishing
    return data.ingredients.length > 0 && data.steps.length > 0;
  },
  {
    message: "Recipe must have ingredients and steps to be published",
    path: ["_form"],
  }
);

// Query Parameters Schema - for API filtering and pagination
export const RecipeQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, "Page must be positive"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
  category: z.string().optional(),
  cuisine: z.string().optional(),
  search: z.string().max(100, "Search term too long").optional(),
  status: z.enum(["all", "published", "draft"]).optional().default("all"),
  sort_by: z
    .enum(["title", "created_at", "updated_at", "published_at"])
    .optional()
    .default("updated_at"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Utility function to parse ingredients from form string to array
export function parseIngredientsFromForm(ingredientsString: string): string[] {
  return ingredientsString
    .split("\n")
    .map((ingredient) => ingredient.trim())
    .filter((ingredient) => ingredient.length > 0);
}

// Utility function to parse steps from form string to array
export function parseStepsFromForm(stepsString: string): string[] {
  return stepsString
    .split("\n")
    .map((step) => step.trim())
    .filter((step) => step.length > 0);
}

// Utility function to parse images from form string to array
export function parseImagesFromForm(imagesString: string): string[] {
  if (!imagesString) return [];
  return imagesString
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}

// Transform form data to create recipe input
export function transformFormToCreateInput(
  formData: z.infer<typeof RecipeFormSchema>
) {
  return {
    title: formData.title,
    description: formData.description || undefined,
    ingredients: parseIngredientsFromForm(formData.ingredients),
    steps: parseStepsFromForm(formData.steps),
    images: parseImagesFromForm(formData.images || ""),
    category: formData.category || undefined,
    cuisine: formData.cuisine || undefined,
    servings: formData.servings ? parseInt(formData.servings, 10) : undefined,
    prep_minutes: formData.prep_minutes
      ? parseInt(formData.prep_minutes, 10)
      : undefined,
    cook_minutes: formData.cook_minutes
      ? parseInt(formData.cook_minutes, 10)
      : undefined,
  };
}

// Validation error formatter for better UX
export function formatZodError(error: z.ZodError) {
  const formattedErrors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(err.message);
  });

  return formattedErrors;
}

// Type exports for use with TypeScript
export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof UpdateRecipeSchema>;
export type RecipeFormInput = z.infer<typeof RecipeFormSchema>;
export type RecipeQueryInput = z.infer<typeof RecipeQuerySchema>;
export type PublishRecipeInput = z.infer<typeof PublishRecipeSchema>;

// Schema exports for validation
export {
  CreateRecipeSchema as CreateRecipe,
  UpdateRecipeSchema as UpdateRecipe,
  RecipeFormSchema as RecipeForm,
  RecipeQuerySchema as RecipeQuery,
  PublishRecipeSchema as PublishRecipe,
};
