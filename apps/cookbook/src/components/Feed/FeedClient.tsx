"use client";

import React, { Suspense, useEffect, useState } from "react";

import { createClient } from "@/app/utils/supabase/client";
import { dateConvert } from "@/app/utils/utils";
import { Pagination } from "@/components/Pagination";
import { User } from "@supabase/supabase-js"; // Import the User type from Supabase
import Image from "next/image";

import { Recipe } from "../../../data/MockData";
import PankcakeImage from "../../../public/images/pancake.jpeg";

type FeedClientProps = {
  recipes: Recipe[];
  recipesPromise?: () => Promise<Recipe[]>;
};

export default function FeedClient({ recipes }: FeedClientProps): JSX.Element {
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

  const recipesPerPage = 6;

  return (
    <section
      id="recipe-list"
      className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2"
    >
      <div className="md:grid-rows-3; mt-6 grid w-full items-center gap-6 py-4 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2">
        {recipes.map((recipe: Recipe, index) => (
          <>
            <div
              className="h-fit max-w-[370px] flex-1 rounded-lg border border-gray-300 bg-white/20 bg-clip-padding p-6 backdrop-blur-lg backdrop-filter"
              data-cy={`test-recipe-card-${recipe.title}`}
            >
              <div className="relative flex h-[300px] max-w-[330px] items-center overflow-hidden">
                <Image
                  alt="recipe-photo"
                  src={PankcakeImage}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="https://placehold.co/330x300/png?text=Picture"
                />
              </div>
              <p className="font-satoshi mt-4 text-3xl font-semibold text-gray-700">
                {recipe.title}
              </p>
              <p className="mb-4 mt-1 font-inter text-lg">#{recipe.tag}</p>
              <button
                className="outline_btn"
                onClick={() => {}}
                data-cy={`go-to-recipe-btn-${recipe.title}`}
              >
                Go to recipe
              </button>
              <div className="mt-4 flex flex-1 items-center justify-start gap-3">
                <div className="flex flex-col">
                  <h3 className="font-satoshi font-semibold text-gray-900">
                    {recipe?.createdBy ? recipe.createdBy : "User name "}
                  </h3>
                  <p className="font-inter text-sm text-gray-500">
                    {recipe.createdAt
                      ? dateConvert(recipe.createdAt)
                      : "Time created"}
                  </p>
                </div>
              </div>
              {user?.id ? (
                <div className="flex-center mt-5 gap-4 border-t border-gray-100 pt-3">
                  <p
                    className="green_gradient cursor-pointer font-inter text-sm"
                    onClick={() => {}}
                    data-cy={`edit-recipe-btn-${recipe.title}`}
                  >
                    Edit
                  </p>
                  <p
                    className="orange_gradient cursor-pointer font-inter text-sm"
                    onClick={() => {}}
                    data-cy={`delete-recipe-btn-${recipe.title}`}
                  >
                    Delete
                  </p>
                </div>
              ) : null}
            </div>
          </>
        ))}
      </div>
      <Pagination
        recipesPerPage={recipesPerPage}
        totalRecipes={recipes.length}
        paginate={paginate}
      />
    </section>
  );
}
