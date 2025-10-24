"use client";

import { useEffect, useTransition } from "react";

import { createRecipeAction, updateRecipeAction } from "@/app/recipe-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { RecipeFormArraySchema } from "@/schemas/recipe";
import { Recipe, RECIPE_CATEGORIES, RECIPE_CUISINES } from "@/types/recipe";
import { getIngredientsAsStrings } from "@/utils/recipe-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Control, FieldValues, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type RecipeFormData = z.infer<typeof RecipeFormArraySchema>;

interface RecipeFormProps {
  recipe?: Recipe;
  onSuccess?: (recipe: Recipe) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

export function RecipeForm({
  recipe,
  onSuccess,
  onCancel,
  onError,
}: RecipeFormProps) {
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(RecipeFormArraySchema),
    defaultValues: {
      title: recipe?.title || "",
      description: recipe?.description || "",
      category: recipe?.category || "",
      cuisine: recipe?.cuisine || "",
      servings: recipe?.servings || undefined,
      prep_minutes: recipe?.prep_minutes || undefined,
      cook_minutes: recipe?.cook_minutes || undefined,
      ingredients: recipe ? getIngredientsAsStrings(recipe.ingredients) : [],
      steps: recipe?.steps?.length ? recipe.steps : [],
      images: recipe?.images || [],
    },
  });

  // Dynamic field arrays for ingredients and steps
  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients" as never,
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control: form.control,
    name: "steps" as never,
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control: form.control,
    name: "images" as never,
  });

  // Note: We use useTransition + direct server action calls instead of useActionState
  // This gives us more control over form handling and better UX

  const [isPending, startTransition] = useTransition();

  // Ensure we have at least one field for ingredients and steps
  useEffect(() => {
    if (ingredientFields.length === 0) {
      appendIngredient("");
    }
    if (stepFields.length === 0) {
      appendStep("");
    }
  }, [
    ingredientFields.length,
    stepFields.length,
    appendIngredient,
    appendStep,
  ]);

  // Handle form submission with draft/publish options
  const handleSubmit = (
    data: RecipeFormData,
    shouldPublish: boolean = false
  ) => {
    startTransition(async () => {
      try {
        // Prepare the form input data
        const formInput = {
          ...data,
          is_published: shouldPublish,
          // Convert empty strings to undefined for optional fields
          category: data.category || undefined,
          cuisine: data.cuisine || undefined,
          servings: data.servings || undefined,
          prep_minutes: data.prep_minutes || undefined,
          cook_minutes: data.cook_minutes || undefined,
          // Filter out empty ingredients and steps
          ingredients: data.ingredients.filter(
            (ingredient) => ingredient.trim() !== ""
          ),
          steps: data.steps.filter((step) => step.trim() !== ""),
          // Filter out empty image URLs
          images: data.images.filter((image) => image.trim() !== ""),
        };

        let result;
        if (recipe?.id) {
          // Update existing recipe
          result = await updateRecipeAction(recipe.id, formInput);
        } else {
          // Create new recipe
          result = await createRecipeAction(formInput);
        }

        if (result.success && result.data) {
          // Show success toast
          if (recipe?.id) {
            toast.success(
              "Recipe updated successfully!",
              `"${result.data.title}" has been saved with your latest changes.`
            );
          } else {
            toast.success(
              "Recipe created successfully!",
              `"${result.data.title}" has been saved to your cookbook.`,
              3000
            );
            // Navigate to edit page for new recipes
            router.push(`/admin/recipes/${result.data.id}/edit`);
          }
          onSuccess?.(result.data);
        } else {
          // Handle validation errors or server errors
          const errorMessage =
            result.error ||
            "An unexpected error occurred while saving the recipe.";
          console.error("Form submission error:", errorMessage);
          toast.error(
            recipe?.id ? "Failed to update recipe" : "Failed to create recipe",
            errorMessage
          );
          onError?.(errorMessage);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while saving the recipe.";
        console.error("Form submission error:", error);
        toast.error(
          recipe?.id ? "Failed to update recipe" : "Failed to create recipe",
          errorMessage
        );
        onError?.(errorMessage);
      }
    });
  };

  // Add new ingredient field
  const addIngredient = () => {
    appendIngredient("");
  };

  // Add new step field
  const addStep = () => {
    appendStep("");
  };

  // Add new image field
  const addImage = () => {
    appendImage("");
  };

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="mx-auto space-y-6">
        <Form {...form}>
          <form className="space-y-6">
            {/* Basic Recipe Information */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
              <div className="space-y-4">
                {/* Title Field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipe Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter recipe title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of your recipe..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category and Cuisine Row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Select category...</option>
                            {RECIPE_CATEGORIES.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cuisine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuisine</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Select cuisine...</option>
                            {RECIPE_CUISINES.map((cuisine) => (
                              <option key={cuisine} value={cuisine}>
                                {cuisine}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Servings and Time Row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="servings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Servings</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="999"
                            placeholder="4"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prep_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prep Time (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="999"
                            placeholder="15"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cook_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cook Time (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="999"
                            placeholder="30"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Card>

            {/* Ingredients Section */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ingredients *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ingredient
                </Button>
              </div>
              <div className="space-y-3">
                {ingredientFields.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No ingredients added yet. Click "Add Ingredient" to add.
                  </p>
                )}
                {ingredientFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder={`Ingredient ${index + 1}...`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {ingredientFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {/* Array-level validation message for ingredients */}
                {form.formState.errors.ingredients?.root && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.ingredients.root.message}
                  </p>
                )}
                {form.formState.errors.ingredients?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.ingredients.message}
                  </p>
                )}
              </div>
            </Card>

            {/* Steps Section */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Cooking Steps *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Step
                </Button>
              </div>
              <div className="space-y-3">
                {stepFields.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No steps added yet. Click "Add Steps" to add.
                  </p>
                )}
                {stepFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <div className="flex h-10 w-8 items-center justify-center rounded-md bg-gray-100 text-sm font-medium">
                      {index + 1}
                    </div>
                    <FormField
                      control={form.control}
                      name={`steps.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Textarea
                              placeholder={`Step ${index + 1} instructions...`}
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {stepFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeStep(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {/* Array-level validation message for steps */}
                {form.formState.errors.steps?.root && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.steps.root.message}
                  </p>
                )}
                {form.formState.errors.steps?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.steps.message}
                  </p>
                )}
              </div>
            </Card>

            {/* Images Section (Stub Implementation) */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Images</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImage}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Image URL
                </Button>
              </div>
              <div className="space-y-3">
                {imageFields.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No images added yet. Click "Add Image URL" to add.
                  </p>
                )}
                {imageFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`images.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {/* Array-level validation message for images */}
                {form.formState.errors.images?.root && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.images.root.message}
                  </p>
                )}
                {form.formState.errors.images?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.images.message}
                  </p>
                )}
              </div>
            </Card>

            {/* Form Actions */}
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={form.handleSubmit(
                      (data) => handleSubmit(data, false),
                      (errors) => {
                        Object.keys(errors).forEach((key) => {
                          form.setError(
                            key as any,
                            errors[key as keyof typeof errors] as any
                          );
                        });
                      }
                    )}
                    disabled={isPending}
                    variant="outline"
                  >
                    {isPending ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button
                    type="button"
                    onClick={form.handleSubmit(
                      (data) => handleSubmit(data, true),
                      (errors) => {
                        console.log("Publish validation errors:", errors);
                        // Force form to show validation errors
                        Object.keys(errors).forEach((key) => {
                          form.setError(
                            key as any,
                            errors[key as keyof typeof errors] as any
                          );
                        });
                      }
                    )}
                    disabled={isPending}
                  >
                    {isPending
                      ? "Publishing..."
                      : recipe?.is_published
                        ? "Update & Publish"
                        : "Publish Recipe"}
                  </Button>
                </div>
                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </Card>
          </form>
        </Form>
      </div>
    </>
  );
}
