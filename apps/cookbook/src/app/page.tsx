import React from "react";

import Image from "next/image";
import Link from "next/link";

import HomeImage from "../../public/images/main.jpeg";

export default async function Index() {
  return (
    <>
      <section>
        <div className="relative flex h-[650px] min-w-[200px] items-center overflow-hidden rounded-xl">
          <Image
            src={HomeImage}
            alt="Photo of food"
            className="absolute object-cover object-center"
          />
          <div className="relative flex h-full flex-col justify-center bg-slate-900 bg-opacity-30 p-5 text-white md:p-16">
            <h1 className="font-inter text-3xl font-extrabold md:text-6xl">
              Payal's Recipes
              <br />
              <span>Discovering the Art of Cooking</span>
            </h1>
            <p className="font-inter mt-5 min-w-[200px] text-sm md:text-xl">
              Welcome! I'm Payal, and I love to cook. I'm excited to share my
              recipes with you.
            </p>
            <Link
              href={"#recipe-list"}
              className="font-inter mt-4 w-fit rounded-xl bg-white p-4 text-2xl font-semibold text-black transition-all hover:bg-black hover:text-white disabled:bg-gray-500"
            >
              Explore my collection of recipes
            </Link>
          </div>
        </div>
        {/* <Feed /> */}
      </section>
    </>
  );
}
