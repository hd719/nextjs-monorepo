"use client";

import React, { useState } from "react";

import { Pagination } from "@/components/Pagination";
import { Recipe } from "@/types/recipe";
import { calculatePaginationSlice } from "@/utils/pagination";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

import PancakeImage from "../../../public/images/pancake.jpeg";

type FeedClientProps = {
  recipes: Recipe[];
  user: User | null;
};

export default function FeedClient({
  recipes,
  user,
}: FeedClientProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const RECIPES_PER_PAGE = 6;

  // Calculate pagination using utility function
  const { startIndex, endIndex } = calculatePaginationSlice(
    currentPage,
    RECIPES_PER_PAGE
  );
  const currentRecipes = recipes.slice(startIndex, endIndex);

  return (
    <section id="recipe-list">
      <div className="container">
        <div className="mb-8 grid grid-cols-2 gap-x-5 gap-y-8 lg:mb-16 lg:grid-cols-3 xl:gap-x-12 xl:gap-y-16">
          {currentRecipes.map((recipe: Recipe, index: number) => (
            <div
              key={recipe.id}
              className="h-fit max-w-[370px] flex-1 rounded-lg border border-appGray-300 bg-appGray-100/50 bg-clip-padding p-6 backdrop-blur-lg backdrop-filter"
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
                  priority={index < 3}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="mt-4">
                <h3 className="line-clamp-2 text-2xl font-semibold tracking-[-0.41px] text-appGray-700">
                  {recipe.title}
                </h3>
                {recipe.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-appGray-600">
                    {recipe.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {recipe.category && (
                    <span className="inline-flex items-center rounded-full bg-[#BCBD87]/10 px-2.5 py-0.5 text-xs font-medium text-appAccent">
                      {recipe.category}
                    </span>
                  )}
                  {recipe.cuisine && (
                    <span className="inline-flex items-center rounded-full bg-[#BCBD87]/10 px-2.5 py-0.5 text-xs font-medium text-appAccent">
                      {recipe.cuisine}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Link href={`/recipes/${recipe.slug}`}>
                  <button
                    className="w-full rounded-lg border border-transparent bg-appAccent px-4 py-2 text-sm font-medium text-appGray-200 transition-colors hover:border-appAccent hover:bg-appGray-200 hover:text-appAccent"
                    data-cy={`go-to-recipe-btn-${recipe.title}`}
                  >
                    View Recipe
                  </button>
                </Link>
              </div>

              <div className="mt-4 flex flex-1 items-center justify-start gap-3">
                <div className="flex flex-col">
                  <h4 className="font-semibold text-appGray-700">Payal</h4>
                  <p className="text-sm text-appGray-500">
                    {recipe.published_at
                      ? new Date(recipe.published_at).toLocaleDateString()
                      : new Date(recipe.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Admin controls - only show if user is authenticated and is admin */}
              {user?.id ? (
                <div className="flex-center mt-5 gap-4 border-t border-appGray-200 pt-3">
                  <Link href={`/admin/recipes/${recipe.id}/edit`}>
                    <span
                      className="cursor-pointer text-sm font-medium text-appAccent transition-colors hover:text-appAccent/70"
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
        <div className="flex justify-center pb-8 lg:pb-20 xl:pb-[120px]">
          <Pagination
            recipesPerPage={RECIPES_PER_PAGE}
            totalRecipes={recipes.length}
            paginate={paginate}
            currentPage={currentPage}
            className="mt-6 lg:mt-10 xl:mt-[72px]"
          />
        </div>
      </div>
    </section>
  );
}
