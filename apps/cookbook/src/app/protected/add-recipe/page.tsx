"use client";

import React, { useState } from "react";

import { addRecipeAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormState } from "react-dom";

interface RecipeFormProps {}

const RecipeForm = (): JSX.Element => {
  const [formState, action] = useFormState(addRecipeAction, {
    errors: {},
  });

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [directions, setDirections] = useState("");
  const [notes, setNotes] = useState("");
  const [nutritionalValue, setNutritionalValue] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (formState?.errors?._form) {
      return;
    }

    setTitle("");
    setIngredients("");
    setDirections("");
    setNotes("");
    setNutritionalValue("");
  };

  const inputs = [
    "title",
    "ingredients",
    "directions",
    "extraNotes",
    "nutritionalValue",
  ];

  const displayError = inputs.map((input) => {
    return (formState?.errors[input] as string) ? (
      <div className="rounded border border-red-400 bg-red-200 p-2">
        {formState?.errors[input].join(", ")}
      </div>
    ) : null;
  });

  return (
    <Card className="mx-auto min-w-[400px] rounded-lg p-6 shadow-lg sm:min-w-[600px]">
      <h2 className="mb-4 text-2xl font-bold">Add a New Recipe</h2>
      <form action={action} onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Recipe Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Textarea
          name="ingredients"
          placeholder="Ingredients (one per line)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Textarea
          name="directions"
          placeholder="Directions"
          value={directions}
          onChange={(e) => setDirections(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Textarea
          name="extraNotes"
          placeholder="Extra Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Input
          type="text"
          name="nutritionalValue"
          placeholder="Nutritional Value"
          value={nutritionalValue}
          onChange={(e) => setNutritionalValue(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          type="submit"
          className="rounded-m w-full text-white transition duration-300 marker:py-2 hover:bg-blue-600"
        >
          Submit Recipe
        </Button>

        {formState?.errors?._form ? (
          <div className="rounded border border-red-400 bg-red-200 p-2">
            {formState.errors._form.join(", ")}
          </div>
        ) : null}
      </form>
      <h3 className="mt-6 text-xl font-semibold">Ingredients List:</h3>
      <ul className="list-disc pl-5">
        {ingredients
          .split("\n")
          .filter(Boolean)
          .map((ingredient, index) => (
            <li key={index} className="text-gray-700">
              {ingredient}
            </li>
          ))}
      </ul>
    </Card>
  );
};

export default RecipeForm;
