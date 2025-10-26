"use client";

import React from "react";

import { ArrowRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

import HomeImage from "../../public/images/main.jpeg";

const HomeHero: React.FC = () => {
  return (
    <section className="relative">
      <div className="container">
        <div className="relative pb-6 pt-24 md:pb-10 lg:pb-[88px] lg:pt-[250px]">
          <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="mb-3 text-xl font-medium leading-[1.2] text-white md:text-3xl lg:mb-6 lg:text-7xl lg:leading-[1.1]">
              Payal's Recipes
            </h1>
            <p className="mb-6 text-xs font-medium leading-none text-white md:text-sm lg:mb-10 lg:text-xl lg:leading-none">
              Discovering the Art of Cooking
            </p>
            <Button asChild variant="default">
              <Link href="#recipe-list">
                <span className="mr-2">Browse recipes</span>
                <ArrowRightIcon className="h-[14px] w-[14px] lg:h-5 lg:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute left-0 top-0 size-full">
        <Image
          src={HomeImage}
          alt="Photo of delicious food"
          className="size-full object-cover object-center"
          priority
          placeholder="blur"
        />
        <div className="absolute bottom-0 left-0 h-2/3 w-full bg-gradient-to-t from-[#1E1E1E] to-[#1E1E1E]/0" />
      </div>
    </section>
  );
};

export default HomeHero;
