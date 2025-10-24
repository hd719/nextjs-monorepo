"use client";

import React, { useEffect, useState } from "react";

import { createClient } from "@/app/utils/supabase/client";
import { Pagination } from "@/components/Pagination";
import { Recipe } from "@/types/recipe";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

import PancakeImage from "../../../public/images/pancake.jpeg";

type FeedClientProps = {
  recipes: Recipe[];
};

export default function FeedClient({
  recipes,
}: FeedClientProps): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await createClient().auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  const RECIPES_PER_PAGE = 6;

  return (
    <section
      id="recipe-list"
      className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2"
    >
      <div className="md:grid-rows-3; mt-6 grid w-full items-center gap-6 py-4 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2">
        {recipes.map((recipe: Recipe) => (
          <div
            key={recipe.id}
            className="h-fit max-w-[370px] flex-1 rounded-lg border border-gray-300 bg-white/20 bg-clip-padding p-6 backdrop-blur-lg backdrop-filter"
            data-cy={`test-recipe-card-${recipe.title}`}
          >
            <div className="relative flex h-[300px] max-w-[330px] items-center overflow-hidden rounded-lg">
              <Image
                alt={`Photo of ${recipe.title}`}
                src={recipe.images?.[0] || PancakeImage}
                fill
                className="object-cover"
                placeholder="blur"
                blurDataURL="https://placehold.co/330x300/png?text=Picture"
              />
            </div>
            <div className="mt-4">
              <h3 className="font-satoshi line-clamp-2 text-2xl font-semibold text-gray-700">
                {recipe.title}
              </h3>
              {recipe.description && (
                <p className="mt-2 line-clamp-2 font-inter text-sm text-gray-600">
                  {recipe.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {recipe.category && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {recipe.category}
                  </span>
                )}
                {recipe.cuisine && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {recipe.cuisine}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Link href={`/recipes/${recipe.slug}`}>
                <button
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 font-inter text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  data-cy={`go-to-recipe-btn-${recipe.title}`}
                >
                  View Recipe
                </button>
              </Link>
            </div>

            <div className="mt-4 flex flex-1 items-center justify-start gap-3">
              <div className="flex flex-col">
                <h4 className="font-satoshi font-semibold text-gray-900">
                  Payal
                </h4>
                <p className="font-inter text-sm text-gray-500">
                  {recipe.published_at
                    ? new Date(recipe.published_at).toLocaleDateString()
                    : new Date(recipe.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Admin controls - only show if user is authenticated and is admin */}
            {user?.id ? (
              <div className="flex-center mt-5 gap-4 border-t border-gray-100 pt-3">
                <Link href={`/admin/recipes/${recipe.id}/edit`}>
                  <span
                    className="green_gradient cursor-pointer font-inter text-sm"
                    data-cy={`edit-recipe-btn-${recipe.title}`}
                  >
                    Edit
                  </span>
                </Link>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <Pagination
        recipesPerPage={RECIPES_PER_PAGE}
        totalRecipes={recipes.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </section>
  );
}
