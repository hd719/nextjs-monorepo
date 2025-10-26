"use client";

import { useEffect, useTransition } from "react";

import { createRecipeAction, updateRecipeAction } from "@/app/recipe-actions";
import { Button } from "@/components/ui/button";
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
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
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

      <div className="mx-auto space-y-8">
        <Form {...form}>
          <form className="space-y-8">
            {/* Basic Recipe Information */}
            <div className="rounded-lg border border-appGray-300 bg-white p-6 transition-colors duration-300">
              <h3 className="mb-6 text-xl font-semibold tracking-[-0.41px] text-appGray-700">
                Basic Information
              </h3>
              <div className="space-y-4">
                {/* Title Field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium tracking-[-0.41px] text-appGray-700">
                        Recipe Title *
                      </FormLabel>
                      <FormControl>
                        <div className="overflow-hidden rounded-lg border transition-colors duration-300 focus-within:border-appAccent">
                          <Input
                            placeholder="Enter recipe title..."
                            className="border-0 bg-transparent text-sm font-medium tracking-[-0.41px] text-appGray-700 placeholder:text-appGray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-medium text-appWarning" />
                    </FormItem>
                  )}
                />

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium tracking-[-0.41px] text-appGray-700">
                        Description
                      </FormLabel>
                      <FormControl>
                        <div className="overflow-hidden rounded-lg border transition-colors duration-300 focus-within:border-appAccent">
                          <Textarea
                            placeholder="Brief description of your recipe..."
                            rows={3}
                            className="resize-none border-0 bg-transparent text-sm font-medium tracking-[-0.41px] text-appGray-700 placeholder:text-appGray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-medium text-appWarning" />
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
                        <FormLabel className="text-sm font-medium tracking-[-0.41px] text-appGray-700">
                          Category
                        </FormLabel>
                        <FormControl>
                          <div className="overflow-hidden rounded-lg border transition-colors duration-300 focus-within:border-appAccent">
                            <select
                              className="flex h-10 w-full border-0 bg-transparent px-3 py-2 text-sm font-medium tracking-[-0.41px] text-appGray-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="" className="text-appGray-400">
                                Select category...
                              </option>
                              {RECIPE_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-appWarning" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cuisine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium tracking-[-0.41px] text-appGray-700">
                          Cuisine
                        </FormLabel>
                        <FormControl>
                          <div className="overflow-hidden rounded-lg border transition-colors duration-300 focus-within:border-appAccent">
                            <select
                              className="flex h-10 w-full border-0 bg-transparent px-3 py-2 text-sm font-medium tracking-[-0.41px] text-appGray-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="" className="text-appGray-400">
                                Select cuisine...
                              </option>
                              {RECIPE_CUISINES.map((cuisine) => (
                                <option key={cuisine} value={cuisine}>
                                  {cuisine}
                                </option>
                              ))}
                            </select>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-appWarning" />
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
                        <FormLabel className="text-sm font-medium tracking-[-0.41px] text-appGray-700">
                          Servings
                        </FormLabel>
                        <FormControl>
                          <div className="overflow-hidden rounded-lg border transition-colors duration-300 focus-within:border-appAccent">
                            <Input
                              type="number"
                              min="1"
                              max="999"
                              placeholder="4"
                              className="border-0 bg-transparent text-sm font-medium tracking-[-0.41px] text-appGray-700 placeholder:text-appGray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-appWarning" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prep_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium tracking-[-0.41px] text-appGray-700">
                          Prep Time (minutes)
                        </FormLabel>
                        <FormControl>
                          <div className="overflow-hidden rounded-lg border transition-colors duration-300 focus-within:border-appAccent">
                            <Input
                              type="number"
                              min="0"
                              max="999"
                              placeholder="15"
                              className="border-0 bg-transparent text-sm font-medium tracking-[-0.41px] text-appGray-700 placeholder:text-appGray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-appWarning" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cook_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium tracking-[-0.41px] text-appGray-700">
                          Cook Time (minutes)
                        </FormLabel>
                        <FormControl>
                          <div className="overflow-hidden rounded-lg border transition-colors duration-300 focus-within:border-appAccent">
                            <Input
                              type="number"
                              min="0"
                              max="999"
                              placeholder="30"
                              className="border-0 bg-transparent text-sm font-medium tracking-[-0.41px] text-appGray-700 placeholder:text-appGray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-appWarning" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="rounded-lg border border-appGray-300 bg-white p-6 transition-colors duration-300">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-[-0.41px] text-appGray-700">
                  Ingredients *
                </h3>
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
                            <div className="overflow-hidden rounded-lg border transition-colors duration-300 focus-within:border-appAccent">
                              <Input
                                placeholder={`Ingredient ${index + 1}...`}
                                className="border-0 bg-transparent text-sm font-medium tracking-[-0.41px] text-appGray-700 placeholder:text-appGray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs font-medium text-appWarning" />
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
                  <p className="text-xs font-medium text-appWarning">
                    {form.formState.errors.ingredients.root.message}
                  </p>
                )}
                {form.formState.errors.ingredients?.message && (
                  <p className="text-xs font-medium text-appWarning">
                    {form.formState.errors.ingredients.message}
                  </p>
                )}
              </div>
            </div>

            {/* Steps Section */}
            <div className="rounded-lg border border-appGray-300 bg-white p-6 transition-colors duration-300">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-[-0.41px] text-appGray-700">
                  Cooking Steps *
                </h3>
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
                    <div className="flex h-10 w-8 items-center justify-center rounded-md bg-appGray-200 text-sm font-medium text-appAccent">
                      {index + 1}
                    </div>
                    <FormField
                      control={form.control}
                      name={`steps.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="overflow-hidden rounded-lg border transition-colors duration-300 focus-within:border-appAccent">
                              <Textarea
                                placeholder={`Step ${index + 1} instructions...`}
                                rows={2}
                                className="resize-none border-0 bg-transparent text-sm font-medium tracking-[-0.41px] text-appGray-700 placeholder:text-appGray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs font-medium text-appWarning" />
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
                  <p className="text-xs font-medium text-appWarning">
                    {form.formState.errors.steps.root.message}
                  </p>
                )}
                {form.formState.errors.steps?.message && (
                  <p className="text-xs font-medium text-appWarning">
                    {form.formState.errors.steps.message}
                  </p>
                )}
              </div>
            </div>

            {/* Images Section */}
            <div className="rounded-lg border border-appGray-300 bg-white p-6 transition-colors duration-300">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-[-0.41px] text-appGray-700">
                  Images
                </h3>
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
                            <div className="overflow-hidden rounded-lg border transition-colors duration-300 focus-within:border-appAccent">
                              <Input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                className="border-0 bg-transparent text-sm font-medium tracking-[-0.41px] text-appGray-700 placeholder:text-appGray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs font-medium text-appWarning" />
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
                  <p className="text-xs font-medium text-appWarning">
                    {form.formState.errors.images.root.message}
                  </p>
                )}
                {form.formState.errors.images?.message && (
                  <p className="text-xs font-medium text-appWarning">
                    {form.formState.errors.images.message}
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="rounded-lg border border-appGray-300 bg-white p-6 transition-colors duration-300">
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
                        // Log validation errors for debugging
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
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
